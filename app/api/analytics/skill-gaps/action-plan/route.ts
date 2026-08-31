import { NextResponse, type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import SkillGapReport from "@/models/skill-gap-report";
import OutcomeEvent from "@/models/outcome-event";
import { generateCurriculumActionPlan } from "@/lib/compute";
import type { ComputeDB } from "@/lib/compute-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillParam = searchParams.get("skill") || "CNC Operation";

    let dbData: ComputeDB = {
      trainees: [],
      learners: [],
      consents: [],
      employmentEvents: [],
      followUps: [],
      verifications: [],
      skillGaps: [],
    };

    try {
      await connectToDatabase();
      const [trainees, skillGaps, outcomes] = await Promise.all([
        Trainee.find({}).lean(),
        SkillGapReport.find({}).lean(),
        OutcomeEvent.find({}).lean(),
      ]);

      if (trainees && trainees.length > 0) {
        dbData.learners = trainees.map((t: any) => ({
          traineeId: t.traineeId || t._id.toString(),
          name: t.fullName || t.name || "Learner",
          phone: t.phone || "",
          district: t.district || "Pune",
          course: t.courseName || t.trade || "Vocational Course",
          provider: t.trainingProvider || "MSSDS Centre",
          status: t.currentStatus || "certified",
          baselineSalary: t.baselineSalary || 12000,
          currentSalary: t.currentSalary || 16000,
          wageIncrease: t.wageIncrease || 0,
          placementDate: t.placementDate ? new Date(t.placementDate).toISOString().slice(0, 10) : undefined,
          enrollmentDate: t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : "2024-01-01",
        }));

        dbData.skillGaps = skillGaps.map((s: any) => ({
          id: s._id.toString(),
          traineeId: s.traineeId || "",
          skillName: s.skillName || "General",
          severity: s.severity || "medium",
          reportedBy: s.reportedBy || "employer",
          notes: s.notes || "",
          createdAt: s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "2024-01-01",
        }));

        dbData.employmentEvents = outcomes.map((o: any) => ({
          id: o._id.toString(),
          traineeId: o.traineeId || "",
          eventType: o.eventType || "placement",
          status: o.status || "active",
          employerName: o.employerName || "Industrial Partner",
          salary: o.salary || 15000,
          reasonCode: o.reasonCode,
          eventDate: o.eventDate ? new Date(o.eventDate).toISOString().slice(0, 10) : "2024-01-01",
        }));
      }
    } catch {
      // Graceful fallback to default in-memory compute baseline
    }

    const actionPlan = generateCurriculumActionPlan(dbData, skillParam);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      actionPlan,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate curriculum action plan",
      },
      { status: 500 }
    );
  }
}
