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

// Tone → Tailwind classes for outcome badges — mode-aware so the label
// text stays high-contrast in both light and dark themes (dark: 300-level
// on tinted 500/12; light: 700-level on tinted 500/12).
export const STATUS_COLORS: Record<string, string> = {
  emerald: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-600/25 dark:border-emerald-500/30",
  violet: "bg-violet-500/12 text-violet-700 dark:text-violet-300 border-violet-600/25 dark:border-violet-500/30",
  sky: "bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-600/25 dark:border-sky-500/30",
  indigo: "bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 border-indigo-600/25 dark:border-indigo-500/30",
  amber: "bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-600/25 dark:border-amber-500/30",
  orange: "bg-orange-500/12 text-orange-700 dark:text-orange-300 border-orange-600/25 dark:border-orange-500/30",
  rose: "bg-rose-500/12 text-rose-700 dark:text-rose-300 border-rose-600/25 dark:border-rose-500/30",
  blue: "bg-blue-500/12 text-blue-700 dark:text-blue-300 border-blue-600/25 dark:border-blue-500/30",
  teal: "bg-teal-500/12 text-teal-700 dark:text-teal-300 border-teal-600/25 dark:border-teal-500/30",
  lime: "bg-lime-500/12 text-lime-700 dark:text-lime-300 border-lime-600/25 dark:border-lime-500/30",
  slate: "bg-slate-500/12 text-slate-600 dark:text-slate-300 border-slate-500/25 dark:border-slate-500/30",
  navy: "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-200 dark:border-slate-600/50",
  saffron: "bg-amber-500/15 text-amber-700 dark:text-amber-200 border-amber-500/30 dark:border-amber-500/40",
};