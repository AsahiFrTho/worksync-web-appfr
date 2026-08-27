import { connectToDatabase } from "@/lib/mongodb";
import OutcomeEvent from "@/models/outcome-event";
import EmployerVerification from "@/models/employer-verification";
import FollowUp from "@/models/follow-up";
import { type NextRequest } from "next/server";

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (dstr: string, n: number) =>
  new Date(new Date(dstr + "T12:00:00Z").getTime() + n * 86400000)
    .toISOString()
    .slice(0, 10);

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const traineeId = request.nextUrl.searchParams.get("traineeId");
    const query = traineeId
      ? { traineeId: traineeId.trim() }
      : {};

    const outcomes = await OutcomeEvent.find(query)
      .sort({ eventDate: -1, createdAt: -1 })
      .lean();

    return Response.json({ success: true, count: outcomes.length, outcomes });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load outcome events",
      },
      { status: 500 }
    );
  }
}

// Create an outcome event and, when applicable, queue an employer
// verification and/or schedule a follow-up — mirroring the Source's
// addOutcome store action.
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { traineeId, outcomeType, eventDate } = body;

    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }
    const validTypes = [
      "wage_employment",
      "self_employment",
      "apprenticeship",
      "higher_education",
      "job_change",
      "wage_update",
      "unemployed",
      "not_placed",
      "dropout",
    ];
    if (!validTypes.includes(outcomeType)) {
      return Response.json(
        { success: false, error: `Invalid outcomeType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }
    if (!eventDate || typeof eventDate !== "string") {
      return Response.json(
        { success: false, error: "eventDate (YYYY-MM-DD) is required" },
        { status: 400 }
      );
    }

    const needsVerification =
      ["wage_employment", "job_change"].includes(outcomeType) &&
      !!body.employerName;

    const event = await OutcomeEvent.create({
      traineeId: traineeId.trim(),
      outcomeType,
      eventDate,
      source: body.source || "Coordinator",
      verifiedStatus: needsVerification ? "pending" : "not_required",
      tags: body.tags || [],
      employerName: body.employerName || "",
      jobRole: body.jobRole || "",
      employmentType: body.employmentType || "Full-time",
      monthlyWage: body.monthlyWage != null ? Number(body.monthlyWage) : undefined,
      skillsUsed: body.skillsUsed || [],
      relevanceToTraining: body.relevanceToTraining || "high",
      selfEmploymentBusinessName: body.selfEmploymentBusinessName || "",
      selfEmploymentNature: body.selfEmploymentNature || "",
      selfEmploymentIncome:
        body.selfEmploymentIncome != null ? Number(body.selfEmploymentIncome) : undefined,
      selfEmploymentSupport: body.selfEmploymentSupport || "",
      apprenticeshipMentor: body.apprenticeshipMentor || "",
      apprenticeshipStatus: body.apprenticeshipStatus || "Ongoing",
      higherEducationInstitution: body.higherEducationInstitution || "",
      higherEducationCourse: body.higherEducationCourse || "",
      reasonCode: body.reasonCode || "",
      notes: body.notes || "",
      followUpRequired: !!body.followUpRequired,
      followUpDate: body.followUpDate || "",
    });

    let verificationId: string | null = null;
    if (needsVerification) {
      const verification = await EmployerVerification.create({
        outcomeEventId: event._id.toString(),
        traineeId: traineeId.trim(),
        employerName: body.employerName,
        jobRole: body.jobRole || "",
        startDate: eventDate,
        wage: body.monthlyWage != null ? Number(body.monthlyWage) : null,
        verificationStatus: "pending",
        verificationMethod: "",
        verifierRemarks: "New outcome — awaiting verification.",
        confidenceScore: null,
        verifiedBy: "",
        verifiedAt: "",
        flagged: false,
      });
      verificationId = verification._id.toString();
    }

    let followUpId: string | null = null;
    if (body.followUpRequired) {
      const followUp = await FollowUp.create({
        traineeId: traineeId.trim(),
        dueDate: body.followUpDate || addDays(today(), 30),
        assignedTo: body.assignedTo || "Coordinator",
        channel: body.channel || "Call",
        status: "scheduled",
        contactAttemptCount: 0,
        reason: `Follow-up after ${String(outcomeType).replace(/_/g, " ")} recorded`,
        notes: "",
        nextActionDate: "",
        outcomeUpdated: true,
        employmentStatus: "",
      });
      followUpId = followUp._id.toString();
    }

    return Response.json({
      success: true,
      outcome: event,
      verificationId,
      followUpId,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not create outcome event",
      },
      { status: 500 }
    );
  }
}