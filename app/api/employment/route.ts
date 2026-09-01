import { connectToDatabase } from "@/lib/mongodb";
import EmploymentRecord, {
  type EmploymentType,
  type VerificationStatus,
  type TrainingRelevance,
} from "@/models/employment-record";
import Trainee from "@/models/trainee";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = request.nextUrl.searchParams;
    const traineeId = searchParams.get("traineeId");
    const verificationStatus = searchParams.get("verificationStatus");
    const district = searchParams.get("district");
    const isCurrentParam = searchParams.get("isCurrent");

    const query: Record<string, unknown> = {};

    if (traineeId) {
      query.traineeId = traineeId.trim();
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus.trim();
    }
    if (district) {
      query.district = district.trim();
    }
    if (isCurrentParam !== null) {
      query.isCurrent = isCurrentParam === "true";
    }

    const employmentRecords = await EmploymentRecord.find(query)
      .sort({ createdAt: -1 })
      .populate("trainee")
      .lean();

    return Response.json({
      success: true,
      count: employmentRecords.length,
      employmentRecords,
    });
  } catch {
    return Response.json({
      success: true,
      count: 0,
      employmentRecords: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const {
      traineeId,
      employerName,
      employerContactEmail,
      jobRole,
      employmentType = "wage_employment",
      district,
      startDate,
      endDate,
      isCurrent = true,
      monthlyWage,
      trainingRelevance = "directly_related",
      verificationStatus = "pending",
      verificationMetadata,
      notes,
    } = body;

    // Validation
    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }

    const trainee = await Trainee.findOne({ traineeId: traineeId.trim() });
    if (!trainee) {
      return Response.json(
        { success: false, error: `Trainee with ID '${traineeId}' not found` },
        { status: 404 }
      );
    }

    if (!employerName || typeof employerName !== "string" || !employerName.trim()) {
      return Response.json(
        { success: false, error: "employerName is required" },
        { status: 400 }
      );
    }

    if (!jobRole || typeof jobRole !== "string" || !jobRole.trim()) {
      return Response.json(
        { success: false, error: "jobRole is required" },
        { status: 400 }
      );
    }

    if (monthlyWage === undefined || typeof monthlyWage !== "number" || monthlyWage < 0) {
      return Response.json(
        { success: false, error: "monthlyWage must be a non-negative number" },
        { status: 400 }
      );
    }

    if (!startDate || isNaN(new Date(startDate).getTime())) {
      return Response.json(
        { success: false, error: "startDate must be a valid ISO Date" },
        { status: 400 }
      );
    }

    const validEmploymentTypes: EmploymentType[] = [
      "wage_employment",
      "self_employment",
      "apprenticeship",
    ];
    if (!validEmploymentTypes.includes(employmentType)) {
      return Response.json(
        {
          success: false,
          error: `Invalid employmentType. Must be one of: ${validEmploymentTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const validStatuses: VerificationStatus[] = [
      "pending",
      "verified",
      "disputed",
      "flagged",
    ];
    if (!validStatuses.includes(verificationStatus)) {
      return Response.json(
        {
          success: false,
          error: `Invalid verificationStatus. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const validTrainingRelevances: TrainingRelevance[] = [
      "directly_related",
      "partially_related",
      "unrelated",
    ];
    if (!validTrainingRelevances.includes(trainingRelevance)) {
      return Response.json(
        {
          success: false,
          error: `Invalid trainingRelevance. Must be one of: ${validTrainingRelevances.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    if (parsedEndDate && parsedEndDate < parsedStartDate) {
      return Response.json(
        { success: false, error: "endDate cannot be earlier than startDate" },
        { status: 400 }
      );
    }

    // If new record is marked as current, ensure existing records for this trainee are set to isCurrent: false
    if (isCurrent) {
      await EmploymentRecord.updateMany(
        { traineeId: trainee.traineeId, isCurrent: true },
        { $set: { isCurrent: false } }
      );
    }

    // Structurally initialize the 4 standard follow-up milestones based on start date
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy;
    };

    const initialFollowUps = [
      { milestone: "30_day" as const, dueDate: addDays(parsedStartDate, 30), status: "pending" as const },
      { milestone: "90_day" as const, dueDate: addDays(parsedStartDate, 90), status: "pending" as const },
      { milestone: "180_day" as const, dueDate: addDays(parsedStartDate, 180), status: "pending" as const },
      { milestone: "365_day" as const, dueDate: addDays(parsedStartDate, 365), status: "pending" as const },
    ];

    const employmentRecord = await EmploymentRecord.create({
      trainee: trainee._id,
      traineeId: trainee.traineeId,
      employerName: employerName.trim(),
      employerContactEmail: employerContactEmail?.trim(),
      jobRole: jobRole.trim(),
      employmentType,
      district: district?.trim() || trainee.district,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      isCurrent: Boolean(isCurrent),
      monthlyWage,
      trainingRelevance,
      verificationStatus,
      verificationMetadata: verificationMetadata || {},
      followUps: initialFollowUps,
      notes: notes?.trim(),
    });

    return Response.json(
      {
        success: true,
        employmentRecord,
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not create employment record",
      },
      { status: 500 }
    );
  }
}
