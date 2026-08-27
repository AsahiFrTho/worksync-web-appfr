import { connectToDatabase } from "@/lib/mongodb";
import ConsentRecord from "@/models/consent-record";
import { type NextRequest } from "next/server";

const today = () => new Date().toISOString().slice(0, 10);

export async function GET() {
  try {
    await connectToDatabase();

    const consents = await ConsentRecord.find().lean();

    return Response.json({ success: true, count: consents.length, consents });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not load consent records",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/consent
// body: { traineeId, consentStatus, consentMethod?, consentPurpose?, consentDate? }
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { traineeId, consentStatus } = body;

    if (!traineeId || typeof traineeId !== "string" || !traineeId.trim()) {
      return Response.json(
        { success: false, error: "traineeId is required" },
        { status: 400 }
      );
    }
    const validStatuses = ["active", "expired", "revoked", "missing"];
    if (!validStatuses.includes(consentStatus)) {
      return Response.json(
        { success: false, error: `Invalid consentStatus. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const consent = await ConsentRecord.findOneAndUpdate(
      { traineeId: traineeId.trim() },
      {
        $set: {
          consentStatus,
          ...(body.consentMethod !== undefined ? { consentMethod: body.consentMethod } : {}),
          ...(body.consentPurpose !== undefined
            ? { consentPurpose: Array.isArray(body.consentPurpose) ? body.consentPurpose : [] }
            : {}),
          ...(body.consentDate !== undefined ? { consentDate: body.consentDate } : {}),
          consentLastUpdated: today(),
        },
      },
      { new: true, upsert: true }
    );

    return Response.json({ success: true, consent });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update consent",
      },
      { status: 500 }
    );
  }
}