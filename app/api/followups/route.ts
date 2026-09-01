import { connectToDatabase } from "@/lib/mongodb";
import FollowUp from "@/models/follow-up";
import { type NextRequest } from "next/server";
import { getFallbackProgramData } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const traineeId = request.nextUrl.searchParams.get("traineeId");
    const status = request.nextUrl.searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (traineeId) query.traineeId = traineeId.trim();
    if (status && ["scheduled", "completed"].includes(status)) query.status = status;

    const followUps = await FollowUp.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    if (followUps.length === 0 && Object.keys(query).length === 0) {
      const fallback = getFallbackProgramData();
      return Response.json({ success: true, count: fallback.followUps.length, followUps: fallback.followUps });
    }

    return Response.json({ success: true, count: followUps.length, followUps });
  } catch {
    const fallback = getFallbackProgramData();
    return Response.json({ success: true, count: fallback.followUps.length, followUps: fallback.followUps });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { traineeId, dueDate } = body;

    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }
    if (!dueDate || typeof dueDate !== "string") {
      return Response.json(
        { success: false, error: "dueDate (YYYY-MM-DD) is required" },
        { status: 400 }
      );
    }

    const followUp = await FollowUp.create({
      traineeId: traineeId.trim(),
      dueDate,
      assignedTo: body.assignedTo || "Coordinator",
      channel: body.channel || "Call",
      status: "scheduled",
      contactAttemptCount: 0,
      reason: body.reason || "Manual follow-up",
      notes: "",
      nextActionDate: "",
      outcomeUpdated: false,
      employmentStatus: "",
    });

    return Response.json({ success: true, followUp });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not create follow-up",
      },
      { status: 500 }
    );
  }
}