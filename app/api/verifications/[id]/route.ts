import { connectToDatabase } from "@/lib/mongodb";
import EmployerVerification from "@/models/employer-verification";
import OutcomeEvent from "@/models/outcome-event";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from "next/server";

const today = () => new Date().toISOString().slice(0, 10);

const OUTCOME_STATUS_MAP: Record<string, string> = {
  verified: "verified",
  rejected: "rejected",
  partially_verified: "partially_verified",
  pending: "pending",
  employer_unreachable: "unreachable",
};

// PATCH /api/verifications/[id]
// body: { action: 'approve' | 'reject' | 'evidence' | 'flag', method?, remarks?, confidence?, flagged? }
export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { success: false, error: `Invalid verification ID format: '${id}'` },
        { status: 400 }
      );
    }

    const verification = await EmployerVerification.findById(id);
    if (!verification) {
      return Response.json(
        { success: false, error: "Verification record not found" },
        { status: 404 }
      );
    }

    const body = await _request.json();
    const action = body.action as string;
    const verifierName = typeof body.verifiedBy === "string" ? body.verifiedBy : "Employer Verifier";

    if (action === "approve") {
      verification.verificationStatus = "verified";
      verification.verificationMethod = body.method || verification.verificationMethod || "HR call";
      if (body.remarks !== undefined && body.remarks !== "") verification.verifierRemarks = body.remarks;
      verification.confidenceScore =
        body.confidence !== undefined && body.confidence !== null && body.confidence !== ""
          ? Number(body.confidence)
          : 90;
      verification.verifiedBy = verifierName;
      verification.verifiedAt = today();
    } else if (action === "reject") {
      verification.verificationStatus = "rejected";
      verification.verificationMethod = body.method || "HR call";
      if (body.remarks !== undefined && body.remarks !== "") verification.verifierRemarks = body.remarks;
      verification.confidenceScore = 20;
      verification.verifiedBy = verifierName;
      verification.verifiedAt = today();
    } else if (action === "evidence") {
      verification.verifierRemarks = `Evidence requested: ${
        typeof body.remarks === "string" && body.remarks.trim()
          ? body.remarks
          : "payslip / offer letter"
      }`;
      if (verification.verificationStatus === "pending") {
        verification.verificationStatus = "partially_verified";
      }
    } else if (action === "flag") {
      verification.flagged =
        typeof body.flagged === "boolean" ? body.flagged : !verification.flagged;
    } else {
      return Response.json(
        {
          success: false,
          error: "Invalid action. Must be one of: approve, reject, evidence, flag",
        },
        { status: 400 }
      );
    }

    await verification.save();

    // Mirror the workflow status onto the linked outcome event so the
    // learner profile reflects current verification state.
    if (verification.outcomeEventId) {
      const mapped = OUTCOME_STATUS_MAP[verification.verificationStatus];
      if (mapped) {
        await OutcomeEvent.updateOne(
          { _id: verification.outcomeEventId },
          { $set: { verifiedStatus: mapped } }
        );
      }
    }

    return Response.json({ success: true, verification });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update verification",
      },
      { status: 500 }
    );
  }
}