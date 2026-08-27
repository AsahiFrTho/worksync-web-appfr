import { connectToDatabase } from "@/lib/mongodb";
import LearnerDetail from "@/models/learner-detail";
import { type NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const details = await LearnerDetail.find().lean();

    return Response.json({ success: true, count: details.length, details });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load learner details",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/learner-details
// body: { traineeId, ...patch } — upserts the optional operational fields
// (contact, demographics, batch, notes). Existing fields are only replaced
// when explicitly provided.
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { traineeId } = body;

    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }

    const allowed = [
      "uniqueLearnerId",
      "gender",
      "category",
      "block",
      "phone",
      "alternatePhone",
      "email",
      "phoneNote",
      "locationChanged",
      "notes",
      "batchName",
      "batchLabel",
    ];
    const $set: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) $set[key] = body[key];
    }
    if (Object.keys($set).length === 0) {
      return Response.json(
        { success: false, error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const detail = await LearnerDetail.findOneAndUpdate(
      { traineeId: traineeId.trim() },
      { $set },
      { new: true, upsert: true }
    );

    return Response.json({ success: true, detail });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update learner detail",
      },
      { status: 500 }
    );
  }
}