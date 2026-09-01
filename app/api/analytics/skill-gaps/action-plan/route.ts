import { NextResponse, type NextRequest } from "next/server";
import { getComputeDbSnapshot } from "@/lib/ai/curriculum-evidence";
import { generateCurriculumActionPlan } from "@/lib/compute";
import type { ComputeDB } from "@/lib/compute-types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillParam = searchParams.get("skill") || "CNC Operation";

    let dbData: ComputeDB = {
      learners: [],
      outcomes: [],
      followUps: [],
      verifications: [],
      skillGaps: [],
      settings: null,
    };

    try {
      dbData = await getComputeDbSnapshot();
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

