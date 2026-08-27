// Types for the compute engine — the "joined" database view used by all
// analytics selectors. Learners are a merge of Trainee + LearnerDetail +
// ConsentRecord (see lib/types.ts MergedLearner).

import type {
  MergedLearner,
  OutcomeEvent,
  FollowUp,
  EmployerVerification,
  SkillGapReport,
  ProgramSettings,
} from "@/lib/types";

export interface ComputeDB {
  learners: MergedLearner[];
  outcomes: OutcomeEvent[];
  followUps: FollowUp[];
  verifications: EmployerVerification[];
  skillGaps: SkillGapReport[];
  settings: ProgramSettings | null;
}

// Tone → Tailwind classes for outcome badges (dark-theme friendly).
export const STATUS_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  violet: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  sky: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  orange: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  rose: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  teal: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  lime: "bg-lime-500/15 text-lime-300 border-lime-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  navy: "bg-blue-900/20 text-blue-200 border-blue-700/40",
  saffron: "bg-amber-500/20 text-amber-200 border-amber-500/40",
};