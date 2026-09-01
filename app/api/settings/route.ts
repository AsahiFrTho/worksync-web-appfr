import { connectToDatabase } from "@/lib/mongodb";
import ProgramSettings from "@/models/program-settings";
import { type NextRequest } from "next/server";
import { getFallbackProgramData } from "@/lib/seed-data";

export async function GET() {
  try {
    await connectToDatabase();

    let settings = await ProgramSettings.findOne({ singleton: "default" }).lean();
    if (!settings) {
      settings = await ProgramSettings.create({ singleton: "default" });
    }

    return Response.json({ success: true, settings });
  } catch {
    const fallback = getFallbackProgramData();
    return Response.json({ success: true, settings: fallback.settings });
  }
}

// PATCH /api/settings — body is a partial ProgramSettings patch.
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const patch: Record<string, unknown> = {};

    const simpleFields = [
      "programName",
      "consentPolicy",
      "retentionPeriodMonths",
      "districts",
      "reasonCodes",
      "skillTags",
    ] as const;
    for (const key of simpleFields) {
      if (body[key] !== undefined) patch[key] = body[key];
    }
    if (body.notificationRules !== undefined) {
      patch["notificationRules"] = body.notificationRules;
    }

    if (Object.keys(patch).length === 0) {
      return Response.json(
        { success: false, error: "No updatable settings provided" },
        { status: 400 }
      );
    }

    const settings = await ProgramSettings.findOneAndUpdate(
      { singleton: "default" },
      { $set: patch },
      { new: true, upsert: true }
    );

    return Response.json({ success: true, settings });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update settings",
      },
      { status: 500 }
    );
  }
}