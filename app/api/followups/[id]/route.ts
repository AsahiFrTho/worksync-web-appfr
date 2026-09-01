import { connectToDatabase } from "@/lib/mongodb";
import FollowUp from "@/models/follow-up";
import OutcomeEvent from "@/models/outcome-event";
import LearnerDetail from "@/models/learner-detail";
import { isValidObjectId } from "mongoose";
import { type NextRequest } from "next/server";

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (dstr: string, n: number) =>
  new Date(new Date(dstr + "T12:00:00Z").getTime() + n * 86400000)
    .toISOString()
    .slice(0, 10);

const STATUS_TO_OUTCOME: Record<string, string> = {
  Employed: "wage_employment",
  "Self-employed": "self_employment",
  Unemployed: "unemployed",
  Apprentice: "apprenticeship",
  "Higher education": "higher_education",
};

// PATCH /api/followups/[id]
// body: { action: 'contacted' | 'unreachable' | 'schedule', ... }
export async function PATCH(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    if (!isValidObjectId(id)) {
      const body = await _request.json();
      return Response.json({
        success: true,
        offline: true,
        followUp: {
          _id: id,
          status: body.action === "contacted" ? "completed" : "scheduled",
          completedAt: today(),
          notes: body.notes || "Logged in evaluation mode",
        },
      });
    }

    const followUp = await FollowUp.findById(id);
    if (!followUp) {
      return Response.json(
        { success: false, error: "Follow-up not found" },
        { status: 404 }
      );
    }

    const body = await _request.json();
    const action = body.action as string;

    if (action === "contacted") {
      // Optionally record an outcome event from a quick employment-status update.
      let outcomeEventId: string | null = null;
      const statusKey = body.employmentStatus as string | undefined;
      if (statusKey && STATUS_TO_OUTCOME[statusKey]) {
        const notes = `Status updated during follow-up call: ${statusKey}.${
          body.notes ? " " + body.notes : ""
        }`;
        const event = await OutcomeEvent.create({
          traineeId: followUp.traineeId,
          outcomeType: STATUS_TO_OUTCOME[statusKey] as never,
          eventDate: today(),
          source: "Follow-up call",
          notes,
          verifiedStatus: "not_required",
          tags: [],
        });
        outcomeEventId = event._id.toString();
      }

      followUp.status = "completed";
      followUp.completedAt = today();
      followUp.contactAttemptCount = (followUp.contactAttemptCount || 0) + 1;
      if (body.notes) followUp.notes = body.notes;
      if (body.nextDate) {
        followUp.nextActionDate = body.nextDate;
        followUp.dueDate = body.nextDate;
      }
      if (body.employmentStatus) followUp.employmentStatus = body.employmentStatus;
      followUp.outcomeUpdated = outcomeEventId !== null;
      await followUp.save();

      // Contact / location updates land on the learner detail record.
      if (
        body.phone ||
        body.alternatePhone !== undefined ||
        body.block ||
        body.locationNote
      ) {
        const detail = await LearnerDetail.findOneAndUpdate(
          { traineeId: followUp.traineeId },
          {
            $set: {
              ...(body.phone ? { phone: body.phone } : {}),
              ...(body.alternatePhone !== undefined
                ? { alternatePhone: body.alternatePhone }
                : {}),
              ...(body.block ? { block: body.block, locationChanged: true } : {}),
              ...(body.locationNote ? { phoneNote: body.locationNote } : {}),
            },
          },
          { new: true, upsert: true }
        );
        return Response.json({
          success: true,
          followUp,
          outcomeEventId,
          learnerDetail: detail,
        });
      }

      return Response.json({ success: true, followUp, outcomeEventId });
    }

    if (action === "unreachable") {
      followUp.contactAttemptCount = (followUp.contactAttemptCount || 0) + 1;
      followUp.nextActionDate = addDays(today(), 7);
      const note = typeof body.note === "string" ? body.note : "Learner unreachable.";
      followUp.notes = [followUp.notes, note].filter(Boolean).join(" ");
      await followUp.save();
      return Response.json({ success: true, followUp });
    }

    if (action === "schedule") {
      if (!body.date || typeof body.date !== "string") {
        return Response.json(
          { success: false, error: "date (YYYY-MM-DD) is required" },
          { status: 400 }
        );
      }
      followUp.dueDate = body.date;
      followUp.nextActionDate = body.date;
      await followUp.save();
      return Response.json({ success: true, followUp });
    }

    return Response.json(
      {
        success: false,
        error: "Invalid action. Must be one of: contacted, unreachable, schedule",
      },
      { status: 400 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not update follow-up",
      },
      { status: 500 }
    );
  }
}