import { connectToDatabase } from "@/lib/mongodb";
import SkillGapReport from "@/models/skill-gap-report";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const traineeId = request.nextUrl.searchParams.get("traineeId");
    const query = traineeId ? { traineeId: traineeId.trim() } : {};

    const skillGaps = await SkillGapReport.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ success: true, count: skillGaps.length, skillGaps });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load skill-gap reports",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { traineeId, skillName } = body;

    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }
    if (!skillName || typeof skillName !== "string" || !skillName.trim()) {
      return Response.json(
        { success: false, error: "skillName is required" },
        { status: 400 }
      );
    }

    const validReporters = ["employer", "learner", "course"];
    const validSeverity = ["high", "medium", "low"];
    const reportedBy = validReporters.includes(body.reportedBy) ? body.reportedBy : "learner";
    const severity = validSeverity.includes(body.severity) ? body.severity : "medium";

    const report = await SkillGapReport.create({
      traineeId: traineeId.trim(),
      courseId: body.courseId || undefined,
      skillName: skillName.trim(),
      reportedBy,
      severity,
      notes: body.notes || "",
    });

    return Response.json({ success: true, skillGap: report });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not create skill-gap report",
      },
      { status: 500 }
    );
  }
}