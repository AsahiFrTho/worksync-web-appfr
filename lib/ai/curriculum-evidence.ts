import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import LearnerDetail from "@/models/learner-detail";
import ConsentRecord from "@/models/consent-record";
import OutcomeEvent from "@/models/outcome-event";
import FollowUp from "@/models/follow-up";
import EmployerVerification from "@/models/employer-verification";
import SkillGapReport from "@/models/skill-gap-report";
import ProgramSettings from "@/models/program-settings";
import { buildComputeDb } from "@/lib/build-compute-db";
import { generateCurriculumInsights, type CurriculumInsight } from "@/lib/compute";
import type { ComputeDB } from "@/lib/compute-types";
import type { ProgramData } from "@/lib/types";

/**
 * Read-only: fetches every operational collection straight from MongoDB and
 * assembles them into the exact same ComputeDB shape the client dashboard
 * builds from /api/program-data (via lib/build-compute-db.ts's shared
 * buildComputeDb()). Reusing that one join function guarantees this
 * server-side AI feature can never compute a different number for the same
 * underlying records than what a human sees on-screen.
 *
 * Mongoose's .lean() documents still contain live ObjectId / Date instances,
 * not the plain strings lib/types.ts's ProgramData shape expects (those
 * only become plain strings after going through a real HTTP JSON response,
 * which is what the client hook actually receives). We deliberately force
 * that same JSON round-trip here with JSON.parse(JSON.stringify(...)) so
 * this in-process path sees byte-for-byte the same shapes the client does,
 * instead of subtly different ones that could produce different numbers.
 */
async function fetchProgramDataSnapshot(): Promise<ProgramData> {
  await connectToDatabase();

  const [trainees, details, consents, outcomes, followUps, verifications, skillGaps] =
    await Promise.all([
      Trainee.find().lean(),
      LearnerDetail.find().lean(),
      ConsentRecord.find().lean(),
      OutcomeEvent.find().lean(),
      FollowUp.find().lean(),
      EmployerVerification.find().lean(),
      SkillGapReport.find().lean(),
    ]);

  const settings = await ProgramSettings.findOne({ singleton: "default" }).lean();

  return JSON.parse(
    JSON.stringify({
      trainees,
      details,
      consents,
      outcomes,
      followUps,
      verifications,
      skillGaps,
      settings: settings || null,
    })
  ) as ProgramData;
}

export async function getComputeDbSnapshot(): Promise<ComputeDB> {
  const data = await fetchProgramDataSnapshot();
  return buildComputeDb(data);
}

/** Free, instant, zero-AI-dependency: every course's deterministic
 *  curriculum insight, ranked worst-relative-to-peers first. This is what
 *  powers a card grid the user can browse before spending any Gemini quota
 *  on a specific course. */
export async function getCurriculumInsights(): Promise<CurriculumInsight[]> {
  const db = await getComputeDbSnapshot();
  return generateCurriculumInsights(db);
}
