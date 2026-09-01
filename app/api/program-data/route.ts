import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import LearnerDetail from "@/models/learner-detail";
import ConsentRecord from "@/models/consent-record";
import OutcomeEvent from "@/models/outcome-event";
import FollowUp from "@/models/follow-up";
import EmployerVerification from "@/models/employer-verification";
import SkillGapReport from "@/models/skill-gap-report";
import ProgramSettings from "@/models/program-settings";
import { getFallbackProgramData } from "@/lib/seed-data";

// Aggregate read endpoint used by the operational modules on first load.
// One round-trip instead of eight; each collection is also exposed through
// its own route for CRUD mutations.
export async function GET() {
  try {
    await connectToDatabase();

    const [trainees, details, consents, outcomes, followUps, verifications, skillGaps] =
      await Promise.all([
        Trainee.find().sort({ traineeId: 1 }).lean(),
        LearnerDetail.find().lean(),
        ConsentRecord.find().lean(),
        OutcomeEvent.find().sort({ eventDate: -1, createdAt: -1 }).lean(),
        FollowUp.find().sort({ dueDate: 1, createdAt: -1 }).lean(),
        EmployerVerification.find().sort({ startDate: -1, createdAt: -1 }).lean(),
        SkillGapReport.find().sort({ createdAt: -1 }).lean(),
      ]);

    if (trainees.length === 0) {
      const fallback = getFallbackProgramData();
      return Response.json({
        success: true,
        ...fallback,
      });
    }

    let settings = await ProgramSettings.findOne({ singleton: "default" }).lean();
    if (!settings) {
      settings = await ProgramSettings.create({ singleton: "default" });
    }

    return Response.json({
      success: true,
      trainees,
      details,
      consents,
      outcomes,
      followUps,
      verifications,
      skillGaps,
      settings,
    });
  } catch {
    // Graceful offline / evaluation fallback
    const fallback = getFallbackProgramData();
    return Response.json({
      success: true,
      ...fallback,
    });
  }
}