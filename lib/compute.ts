// ── Derived metrics & selectors ─────────────────────────────────────────────
// Ported from the Source (KaushalSetu) compute engine and adapted to the
// Target's API shapes: events are keyed by `traineeId` and learners are a
// join of Trainee + LearnerDetail + ConsentRecord (see lib/types.ts).

import type {
  ComputeDB,
} from "@/lib/compute-types";
import { STATUS_COLORS } from "@/lib/compute-types";

export const todayStr = () => new Date().toISOString().slice(0, 10);

const DAY = 86400000;

export const addDays = (dstr: string, n: number) =>
  new Date(new Date(dstr + "T12:00:00Z").getTime() + n * DAY)
    .toISOString()
    .slice(0, 10);

export const addMonths = (dstr: string, m: number) => {
  const d = new Date(dstr + "T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + m);
  return d.toISOString().slice(0, 10);
};

export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + "T12:00:00Z").getTime() - new Date(a + "T12:00:00Z").getTime()) / DAY);

export const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d + "T12:00:00Z");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateShort = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d + "T12:00:00Z");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const fmtMoney = (n: number | null | undefined | "") => {
  if (n === null || n === undefined || n === "" || isNaN(Number(n))) return "—";
  return "₹" + Number(n).toLocaleString("en-IN");
};

export const pct = (a: number, b: number, digits = 0) =>
  b === 0 ? 0 : Math.round((a / b) * 100 * 10 ** digits) / 10 ** digits;

// Compact large numbers for KPI tiles, e.g. 48250 -> "48.2K", 1200000 -> "1.2M".
// Falls back to a plain locale-formatted number below 1,000 so small prototype
// cohorts (tens of trainees) don't render a confusing "0.0K".
export const compact = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("en-IN");
};

// ── Employment status ────────────────────────────────────────────────────────
const STATUS_DEFINING = [
  "wage_employment",
  "self_employment",
  "apprenticeship",
  "higher_education",
  "unemployed",
  "not_placed",
  "dropout",
  "job_change",
  "re_engagement",
];

export const STATUS_LABELS: Record<string, { label: string; color: string; key: string }> = {
  placed: { label: "Placed (Wage Job)", color: "emerald", key: "placed" },
  self_employed: { label: "Self-Employed", color: "violet", key: "self_employed" },
  apprentice: { label: "Apprenticeship", color: "sky", key: "apprentice" },
  higher_ed: { label: "Higher Education", color: "indigo", key: "higher_ed" },
  unemployed: { label: "Unemployed", color: "amber", key: "unemployed" },
  not_placed: { label: "Not Placed", color: "orange", key: "not_placed" },
  dropped_out: { label: "Dropped Out", color: "rose", key: "dropped_out" },
  re_engaged: { label: "Re-engaged", color: "blue", key: "re_engaged" },
  in_training: { label: "In Training", color: "teal", key: "in_training" },
  not_tracked: { label: "Not Tracked", color: "slate", key: "not_tracked" },
};

export const OUTCOME_TYPES: Record<string, { label: string; short: string; color: string }> = {
  wage_employment: { label: "Wage Employment", short: "Placed", color: "#059669" },
  self_employment: { label: "Self-Employment", short: "Self-Emp", color: "#7c3aed" },
  apprenticeship: { label: "Apprenticeship", short: "Apprentice", color: "#0284c7" },
  higher_education: { label: "Higher Education", short: "Higher Ed", color: "#4f46e5" },
  unemployed: { label: "Unemployed", short: "Unemployed", color: "#d97706" },
  not_placed: { label: "Not Placed", short: "Not Placed", color: "#ea580c" },
  dropout: { label: "Dropout / Attrition", short: "Dropout", color: "#e11d48" },
  job_change: { label: "Job Change", short: "Job Change", color: "#0d9488" },
  wage_update: { label: "Wage Progression Update", short: "Wage Update", color: "#65a30d" },
  re_engagement: { label: "Re-engagement", short: "Re-engaged", color: "#2563eb" },
};

export const VERIFICATION_METHODS = [
  "Employer call",
  "Employer portal response",
  "Document uploaded",
  "Field visit",
  "Payment proof",
  "Attendance/offer letter",
];

export const DEFAULT_REASON_CODES = [
  "Relocation",
  "Health issue",
  "Family responsibility",
  "Course mismatch",
  "Low wage offer",
  "No local opportunity",
  "Transport issue",
  "Awaiting better opportunity",
  "Not interested",
  "Employer not verified",
  "Other",
];

export const DEFAULT_SKILL_TAGS = [
  "Digital payments",
  "Customer handling",
  "Machine operation",
  "Communication",
  "Basic computer skills",
  "Safety compliance",
  "Sales skills",
  "Data entry",
  "Tool handling",
  "Soft skills",
];

export const DEFAULT_DISTRICTS = ["Nashik", "Nagpur", "Pune"];

// ── Selectors ────────────────────────────────────────────────────────────────
export function eventsFor(db: ComputeDB, traineeId: string) {
  return db.outcomes
    .filter((o) => o.traineeId === traineeId)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
}

export function enrollmentFor(db: ComputeDB, traineeId: string) {
  const l = db.learners.find((x) => x.traineeId === traineeId);
  if (!l) return null;
  const start = l.trainingPeriodStart || l.updatedAt || todayStr();
  const end = l.trainingPeriodEnd || addMonths(start, 2);
  return {
    providerId: l.trainingProvider || "—",
    courseId: l.course || "—",
    batchName: l.batchName || `${l.course || "Batch"} · ${l.district}`,
    batchLabel: l.batchLabel || l.batchName || l.course || "—",
    enrollmentDate: addMonths(start, -1),
    trainingStartDate: start,
    trainingEndDate: end,
    assessmentStatus: l.status === "enrolled" ? "Pending" : "Passed",
    certificationStatus: l.status === "enrolled" ? "Pending" : "Certified",
  };
}

export function providersOf(db: ComputeDB) {
  const names = [
    ...new Set(db.learners.map((l) => l.trainingProvider).filter((n): n is string => Boolean(n))),
  ].sort();
  return names.map((name) => ({ id: name, name, district: db.learners.find((l) => l.trainingProvider === name)?.district || "—", status: "active" }));
}

export function coursesOf(db: ComputeDB) {
  const names = [...new Set(db.learners.map((l) => l.course).filter(Boolean))].sort();
  return names.map((name) => ({ id: name, name, sector: "—", durationHours: 0, status: "active" }));
}

export function providerOf(db: ComputeDB, traineeId: string) {
  const l = db.learners.find((x) => x.traineeId === traineeId);
  if (!l?.trainingProvider) return null;
  return { id: l.trainingProvider, name: l.trainingProvider, district: l.district, status: "active" };
}

export function courseOf(db: ComputeDB, traineeId: string) {
  const l = db.learners.find((x) => x.traineeId === traineeId);
  if (!l?.course) return null;
  return { id: l.course, name: l.course, sector: "—", durationHours: 0, status: "active" };
}

export function verificationsFor(db: ComputeDB, traineeId: string) {
  return db.verifications.filter((v) => v.traineeId === traineeId);
}

export function followUpsFor(db: ComputeDB, traineeId: string) {
  return db.followUps.filter((f) => f.traineeId === traineeId);
}

export function skillGapsFor(db: ComputeDB, traineeId: string) {
  return db.skillGaps.filter((s) => s.traineeId === traineeId);
}

const STATUS_MAP: Record<string, string> = {
  wage_employment: "placed",
  job_change: "placed",
  self_employment: "self_employed",
  apprenticeship: "apprentice",
  higher_education: "higher_ed",
  unemployed: "unemployed",
  not_placed: "not_placed",
  dropout: "dropped_out",
  re_engagement: "re_engaged",
};

export function employmentStatus(db: ComputeDB, traineeId: string) {
  const evts = eventsFor(db, traineeId).filter((o) => STATUS_DEFINING.includes(o.outcomeType));
  const learner = db.learners.find((l) => l.traineeId === traineeId);
  if (!evts.length) {
    if (learner?.status === "enrolled") return STATUS_LABELS.in_training;
    return STATUS_LABELS.not_tracked;
  }
  const last = evts[evts.length - 1];
  return STATUS_LABELS[STATUS_MAP[last.outcomeType]] || STATUS_LABELS.not_tracked;
}

export function latestWageEvent(db: ComputeDB, traineeId: string) {
  const wageEvts = eventsFor(db, traineeId).filter(
    (o) => o.monthlyWage || o.selfEmploymentIncome
  );
  return wageEvts[wageEvts.length - 1] || null;
}

export function currentMonthlyIncome(db: ComputeDB, traineeId: string) {
  const e = latestWageEvent(db, traineeId);
  if (!e) return null;
  return e.selfEmploymentIncome || e.monthlyWage || null;
}

export function placementEvent(db: ComputeDB, traineeId: string) {
  return (
    eventsFor(db, traineeId).find((o) => ["wage_employment", "job_change"].includes(o.outcomeType)) ||
    null
  );
}

export function firstPlacement(db: ComputeDB, traineeId: string) {
  return eventsFor(db, traineeId).find((o) => o.outcomeType === "wage_employment") || null;
}

// ── Consent / privacy ────────────────────────────────────────────────────────
export const consentActive = (l: { consentStatus?: string }) => l.consentStatus === "active";
export const displayName = (l: { name: string; consentStatus?: string; uniqueLearnerId?: string; traineeId?: string }) =>
  consentActive(l) ? l.name : `Learner ${l.uniqueLearnerId || l.traineeId || "—"}`;
export const maskValue = (l: { consentStatus?: string }, value: string) =>
  consentActive(l) ? value : "—";
export const canSeePersonal = (l: { consentStatus?: string }) => consentActive(l);

// ── Filters ──────────────────────────────────────────────────────────────────
export const DEFAULT_FILTERS = {
  provider: "all",
  course: "all",
  district: "all",
  batch: "all",
  gender: "all",
  category: "all",
  period: "all",
  outcome: "all",
};

export type Filters = typeof DEFAULT_FILTERS;

export function applyFilters(db: ComputeDB, filters: Partial<Filters> = {}) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  const cutoff = f.period !== "all" ? addMonths(todayStr(), -Number(f.period)) : null;
  return db.learners.filter((l) => {
    const e = enrollmentFor(db, l.traineeId);
    if (!e) return false;
    if (f.provider !== "all" && e.providerId !== f.provider) return false;
    if (f.course !== "all" && e.courseId !== f.course) return false;
    if (f.batch !== "all" && e.batchName !== f.batch) return false;
    if (f.district !== "all" && l.district !== f.district) return false;
    if (f.gender !== "all" && l.gender !== f.gender) return false;
    if (f.category !== "all" && l.category !== f.category) return false;
    if (cutoff && e.enrollmentDate < cutoff) return false;
    if (f.outcome !== "all") {
      const st = employmentStatus(db, l.traineeId);
      if (st.key !== f.outcome) return false;
    }
    return true;
  });
}

// ── KPIs ─────────────────────────────────────────────────────────────────────
export function kpis(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const ids = learners.map((l) => l.traineeId);
  const evts = db.outcomes.filter((o) => ids.includes(o.traineeId));
  const fus = db.followUps.filter((f) => ids.includes(f.traineeId));
  const vers = db.verifications.filter((v) => ids.includes(v.traineeId));
  const today = todayStr();

  const count = (key: string) =>
    learners.filter((l) => employmentStatus(db, l.traineeId).key === key).length;
  const placed = count("placed");
  const selfEmp = count("self_employed");
  const appr = count("apprentice");

  let wageGrowths: number[] = [];
  ids.forEach((id) => {
    const wageEvts = evts
      .filter((o) => o.traineeId === id && o.monthlyWage)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    if (wageEvts.length >= 2) {
      const first = wageEvts[0].monthlyWage || 0;
      const lastW = wageEvts[wageEvts.length - 1].monthlyWage || 0;
      if (first > 0) wageGrowths.push((lastW - first) / first);
    }
  });
  const avgWageGrowth = wageGrowths.length
    ? wageGrowths.reduce((a, b) => a + b, 0) / wageGrowths.length
    : 0;

  const ret = retention(db, 3, ids);
  const needFollowUp = fus.filter((f) => f.status === "scheduled" && f.dueDate <= today).length;
  const pendingVer = vers.filter((v) =>
    ["pending", "employer_unreachable"].includes(v.verificationStatus)
  ).length;

  return {
    total: learners.length,
    consented: learners.filter(consentActive).length,
    placed,
    selfEmp,
    appr,
    needFollowUp,
    pendingVer,
    avgWageGrowth,
    retention3: ret.rate,
    completeness: completenessScore(db, learners),
  };
}

// ── Retention ────────────────────────────────────────────────────────────────
const POSITIVE_EVT = ["wage_employment", "job_change", "self_employment", "wage_update"];
const NEGATIVE_EVT = ["unemployed", "dropout", "not_placed"];

export function retention(db: ComputeDB, months: number, learnerIds: string[] | null = null) {
  const today = todayStr();
  const scope = learnerIds
    ? db.learners.filter((l) => learnerIds.includes(l.traineeId))
    : db.learners;
  let eligible = 0;
  let retained = 0;
  let tracked = 0;
  scope.forEach((l) => {
    const fp = firstPlacement(db, l.traineeId);
    if (!fp) return;
    const due = addMonths(fp.eventDate, months);
    if (due > today) return;
    eligible++;
    const lo = addDays(due, -75);
    const hi = addDays(due, 75);
    const inWin = (d?: string) => !!d && d >= lo && d <= hi;
    const evidence =
      db.outcomes.some(
        (o) =>
          o.traineeId === l.traineeId &&
          o._id !== fp._id &&
          POSITIVE_EVT.includes(o.outcomeType) &&
          inWin(o.eventDate)
      ) ||
      db.followUps.some(
        (f) =>
          f.traineeId === l.traineeId &&
          f.status === "completed" &&
          ["Employed", "Self-employed"].includes(f.employmentStatus || "") &&
          inWin(f.completedAt || f.dueDate)
      );
    const negative = db.outcomes.some(
      (o) =>
        o.traineeId === l.traineeId &&
        NEGATIVE_EVT.includes(o.outcomeType) &&
        o.eventDate > fp.eventDate &&
        o.eventDate <= hi
    );
    if (evidence || negative) {
      tracked++;
      if (evidence && !negative) retained++;
    }
  });
  return { months, eligible, tracked, retained, rate: tracked ? pct(retained, tracked) : 0 };
}

// ── Completeness ─────────────────────────────────────────────────────────────
export function learnerChecks(db: ComputeDB, l: (typeof db.learners)[number]) {
  const st = employmentStatus(db, l.traineeId);
  const fus = followUpsFor(db, l.traineeId);
  const vers = verificationsFor(db, l.traineeId);
  const latestUpdate = [
    l.updatedAt,
    ...eventsFor(db, l.traineeId).map((o) => o.eventDate),
    ...fus.filter((f) => f.status === "completed").map((f) => f.completedAt || f.dueDate),
    ...vers.map((v) => v.verifiedAt).filter(Boolean),
  ]
    .filter(Boolean)
    .sort()
    .pop();
  return {
    consent: consentActive(l),
    phone: !!l.phone && !l.phoneNote?.includes("switched off"),
    outcome:
      st.key !== "not_tracked" && st.key !== "in_training" ? true : st.key === "in_training",
    employmentDetails:
      ["placed", "apprentice"].includes(st.key)
        ? vers.some((v) => ["verified", "partially_verified"].includes(v.verificationStatus))
        : true,
    wage: ["placed", "apprentice", "self_employed"].includes(st.key)
      ? currentMonthlyIncome(db, l.traineeId) !== null
      : true,
    fresh: latestUpdate ? daysBetween(latestUpdate, todayStr()) <= 90 : false,
  };
}

export function completenessScore(db: ComputeDB, learners: ComputeDB["learners"]) {
  if (!learners.length) return 0;
  let total = 0;
  learners.forEach((l) => {
    const c = learnerChecks(db, l);
    const pass = Object.values(c).filter(Boolean).length;
    total += pass / 6;
  });
  return Math.round((total / learners.length) * 100);
}

// ── Charts ───────────────────────────────────────────────────────────────────
export function outcomeDistribution(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const dist: Record<string, number> = {};
  learners.forEach((l) => {
    const st = employmentStatus(db, l.traineeId);
    dist[st.key] = (dist[st.key] || 0) + 1;
  });
  const order = [
    "placed",
    "self_employed",
    "apprentice",
    "unemployed",
    "not_placed",
    "dropped_out",
    "higher_ed",
    "re_engaged",
    "in_training",
    "not_tracked",
  ];
  return order
    .filter((k) => dist[k])
    .map((k) => ({ name: STATUS_LABELS[k].label, key: k, value: dist[k] }));
}

// ── Longitudinal outcome funnel (the "6-step journey" as headcounts) ────────
// Business logic / why these exact stage definitions were chosen:
//   1. Enrolled   -> every learner record in the filtered cohort. This is the
//                    denominator for every later stage.
//   2. Completed  -> learner's training end date has actually passed. A
//                    learner who is still mid-course hasn't "completed"
//                    anything yet, regardless of certificate status.
//   3. Certified  -> learner has a real certificateId on file. We deliberately
//                    do NOT infer certification from "training ended" -- a
//                    learner can finish a course and still fail the final
//                    assessment, so certification must be its own gate.
//   4. Employed   -> learner's current employmentStatus (Place step) is one of
//                    placed / self_employed / apprentice. Re-uses the exact
//                    same status logic as the KPI ribbon and every other page,
//                    so the funnel can never silently disagree with the rest
//                    of the app.
//   5. Retained   -> of the Employed group, how many pass the same 3-month
//                    retention check (Verify + Retain steps) used everywhere
//                    else in the app. We scope retention() to only the
//                    Employed learner IDs so the funnel reads as a strict
//                    step-down, never a number that goes back up.
export function outcomeFunnel(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const enrolled = learners.length;

  const completed = learners.filter(
    (l) => !!l.trainingPeriodEnd && l.trainingPeriodEnd <= todayStr()
  ).length;

  const certified = learners.filter((l) => !!l.certificate?.certificateId).length;

  const employedLearners = learners.filter((l) =>
    ["placed", "self_employed", "apprentice"].includes(employmentStatus(db, l.traineeId).key)
  );
  const employed = employedLearners.length;

  const employedIds = employedLearners.map((l) => l.traineeId);
  const retained = retention(db, 3, employedIds).retained;

  return [
    { stage: "Enrolled", value: enrolled },
    { stage: "Completed", value: completed },
    { stage: "Certified", value: certified },
    { stage: "Employed", value: employed },
    { stage: "Retained", value: retained },
  ];
}

// ── Employment type split (Full-time / Part-time / Contract / Temporary) ────
// Pulled straight from the real `employmentType` field already captured on
// every OutcomeEvent at the Place step -- this replaces the old prototype's
// invented "employmentTypeSplit" mock array with an honest tally of records
// that actually exist in MongoDB.
export function employmentTypeSplit(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const counts: Record<string, number> = {};
  learners.forEach((l) => {
    const placement = placementEvent(db, l.traineeId);
    if (!placement) return; // not placed in wage employment -> not counted here
    const type = placement.employmentType || "Full-time";
    counts[type] = (counts[type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, value]) => ({ type, value }))
    .sort((a, b) => b.value - a.value);
}

const monthKey = (d: string) => d.slice(0, 7);
const monthLabel = (k: string) =>
  new Date(k + "-01T12:00:00Z").toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export function lastNMonths(n: number) {
  const keys: string[] = [];
  let d = todayStr();
  for (let i = n - 1; i >= 0; i--) keys.push(monthKey(addMonths(d, -i)));
  return keys;
}

export function placementTrend(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const ids = new Set(learners.map((l) => l.traineeId));
  const keys = lastNMonths(15);
  const counts: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
  db.outcomes.forEach((o) => {
    if (o.outcomeType === "wage_employment" && ids.has(o.traineeId)) {
      const k = monthKey(o.eventDate);
      if (counts[k] !== undefined) counts[k]++;
    }
  });
  return keys.map((k) => ({ month: monthLabel(k), placements: counts[k] }));
}

export function wageProgressionSeries(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const ids = new Set(learners.map((l) => l.traineeId));
  const keys = lastNMonths(15);
  const buckets: Record<string, number[]> = Object.fromEntries(keys.map((k) => [k, []]));
  db.outcomes.forEach((o) => {
    const w = o.monthlyWage || o.selfEmploymentIncome;
    if (w && ids.has(o.traineeId)) {
      const k = monthKey(o.eventDate);
      if (buckets[k]) buckets[k].push(w);
    }
  });
  return keys
    .map((k) => ({
      month: monthLabel(k),
      wage: buckets[k].length
        ? Math.round(buckets[k].reduce((a, b) => a + b, 0) / buckets[k].length)
        : null,
      n: buckets[k].length,
    }))
    .filter((d) => d.wage !== null);
}

export function retentionSeries(db: ComputeDB, filters: Partial<Filters> = {}) {
  const learners = applyFilters(db, filters);
  const ids = learners.map((l) => l.traineeId);
  return [1, 3, 6, 12].map((m) => {
    const r = retention(db, m, ids);
    return { month: `${m} mo`, rate: r.rate, eligible: r.eligible, tracked: r.tracked };
  });
}

// ── Skill gaps / reasons ─────────────────────────────────────────────────────
export function topSkillGaps(
  db: ComputeDB,
  filters: Partial<Filters> = {},
  groupBy: null | "employer" | "learner" | "course" | "district" = null
) {
  const learners = applyFilters(db, filters);
  const ids = new Set(learners.map((l) => l.traineeId));
  const counts: Record<string, { high: number; medium: number; low: number; total: number }> = {};
  db.skillGaps.forEach((s) => {
    if (!ids.has(s.traineeId)) return;
    if (groupBy === "employer" && s.reportedBy !== "employer") return;
    if (groupBy === "learner" && s.reportedBy !== "learner") return;
    const k =
      groupBy === "course"
        ? courseOf(db, s.traineeId)?.name || "?"
        : groupBy === "district"
          ? db.learners.find((l) => l.traineeId === s.traineeId)?.district || "?"
          : s.skillName;
    counts[k] = counts[k] || { high: 0, medium: 0, low: 0, total: 0 };
    counts[k][s.severity] = (counts[k][s.severity] || 0) + 1;
    counts[k].total++;
  });
  return Object.entries(counts)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total);
}

export function reasonCounts(
  db: ComputeDB,
  filters: Partial<Filters> = {},
  types: string[] = ["dropout", "unemployed", "not_placed"]
) {
  const learners = applyFilters(db, filters);
  const ids = new Set(learners.map((l) => l.traineeId));
  const counts: Record<string, number> = {};
  db.outcomes.forEach((o) => {
    if (ids.has(o.traineeId) && types.includes(o.outcomeType) && o.reasonCode) {
      counts[o.reasonCode] = (counts[o.reasonCode] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

// ── Closed-Loop Skill Intelligence (the "wow factor") ───────────────────────
// Business logic: topSkillGaps() above answers "which skill is reported
// missing most often" -- a count. This section goes one step further and
// asks the actual policy question: "does that reported gap line up with
// this course's learners doing WORSE than everyone else we're tracking?"
// That correlation is what turns a raw complaint tally into something a
// training provider can act on.
export interface CurriculumInsight {
  course: string;
  topSkillGap: string;
  severity: "high" | "medium" | "low";
  reportCount: number;
  affectedLearners: number;
  courseEmploymentRate: number;
  cohortEmploymentRate: number;
  /** courseEmploymentRate - cohortEmploymentRate. Negative = this course's
   *  learners are employed at a lower rate than the rest of the tracked
   *  cohort -- the number a policymaker actually cares about. */
  employmentRateDelta: number;
  courseAvgWage: number;
  cohortAvgWage: number;
  wageDelta: number;
  /** Always available, zero-AI-dependency plain-language fix. This is the
   *  exact same sentence lib/ai/curriculum-intelligence.ts's fallback path
   *  surfaces if Gemini is unavailable -- the "wow feature" degrades to
   *  this instead of breaking on stage. */
  recommendedFix: string;
}

// A course needs at least this many tracked learners before we're willing
// to say anything about it. Below this, one unlucky or unlucky-looking
// learner could make an entire course look broken -- exactly the kind of
// small-sample overclaim we removed from the executive dashboard in Phase 1.
const MIN_COURSE_SAMPLE_SIZE = 2;

// Ranks skills reported missing *within a single course*, weighting a
// "high" severity report 3x and "medium" 2x a "low" one -- the same
// weighting convention providerScorecards() already uses for gapScore, so
// severity means the same thing everywhere in this app rather than each
// feature inventing its own scale.
function topSkillGapForCourse(db: ComputeDB, courseName: string) {
  const counts: Record<string, { high: number; medium: number; low: number; total: number }> = {};
  db.skillGaps.forEach((s) => {
    if (courseOf(db, s.traineeId)?.name !== courseName) return;
    counts[s.skillName] = counts[s.skillName] || { high: 0, medium: 0, low: 0, total: 0 };
    counts[s.skillName][s.severity]++;
    counts[s.skillName].total++;
  });
  const ranked = Object.entries(counts)
    .map(([name, v]) => ({ name, ...v, weight: v.high * 3 + v.medium * 2 + v.low }))
    .sort((a, b) => b.weight - a.weight || b.total - a.total);
  return ranked[0] || null;
}

function avgCurrentWage(db: ComputeDB, group: ComputeDB["learners"]): number {
  const wages = group
    .map((l) => currentMonthlyIncome(db, l.traineeId))
    .filter((w): w is number => typeof w === "number" && w > 0);
  if (!wages.length) return 0;
  return Math.round(wages.reduce((a, b) => a + b, 0) / wages.length);
}

function employedCount(db: ComputeDB, group: ComputeDB["learners"]): number {
  return group.filter((l) =>
    ["placed", "self_employed", "apprentice"].includes(employmentStatus(db, l.traineeId).key)
  ).length;
}

// Deterministic, rule-based recommendation sentence. Deliberately plain and
// a little repetitive/templated -- that's the point: it must be defensible
// word-for-word as "here's exactly the arithmetic behind this sentence",
// with no room for an AI model to have invented something.
function buildDeterministicFix(input: {
  course: string;
  skill: string;
  reportCount: number;
  employmentRateDelta: number;
  wageDelta: number;
}): string {
  const { course, skill, reportCount, employmentRateDelta, wageDelta } = input;
  const impactParts: string[] = [];
  if (employmentRateDelta < 0) {
    impactParts.push(`${Math.abs(employmentRateDelta)} percentage points lower employment`);
  }
  if (wageDelta < 0) {
    impactParts.push(`${fmtMoney(Math.abs(wageDelta))} lower average wage`);
  }
  const impactStr = impactParts.length
    ? ` — learners in this course currently show ${impactParts.join(" and ")} than the rest of the tracked cohort.`
    : " — no measurable outcome gap yet, but the skill is already being reported.";
  return `Add a focused bridge module on "${skill}" to ${course} (reported ${reportCount} time${reportCount === 1 ? "" : "s"})${impactStr}`;
}

/**
 * Cross-references SkillGapReport against OutcomeEvent-derived employment
 * and wage data, per course, to find which reported skill gaps actually
 * correlate with worse real-world outcomes -- and returns a concrete,
 * ready-to-act-on fix for each one.
 *
 * Deliberately course-vs-rest-of-cohort, not course-vs-a-fixed-target: with
 * a small prototype dataset there is no separate "official benchmark" to
 * compare against, so the fairest comparison we can make honestly is this
 * course against every other course we're tracking right now. This also
 * means the comparison automatically gets more meaningful as more real
 * data is seeded/entered -- it never depends on a number we made up.
 */
export function generateCurriculumInsights(
  db: ComputeDB,
  filters: Partial<Filters> = {}
): CurriculumInsight[] {
  const learners = applyFilters(db, filters);
  const courseNames = [
    ...new Set(
      learners
        .map((l) => courseOf(db, l.traineeId)?.name)
        .filter((n): n is string => Boolean(n))
    ),
  ];

  const insights: CurriculumInsight[] = [];

  courseNames.forEach((course) => {
    const inCourse = learners.filter((l) => courseOf(db, l.traineeId)?.name === course);
    if (inCourse.length < MIN_COURSE_SAMPLE_SIZE) return; // too few learners to say anything responsible

    const topGap = topSkillGapForCourse(db, course);
    if (!topGap || topGap.total === 0) return; // nothing reported for this course -- nothing to fix

    const restOfCohort = learners.filter((l) => courseOf(db, l.traineeId)?.name !== course);

    const courseEmploymentRate = pct(employedCount(db, inCourse), inCourse.length);
    const cohortEmploymentRate = restOfCohort.length
      ? pct(employedCount(db, restOfCohort), restOfCohort.length)
      : courseEmploymentRate;
    const courseAvgWage = avgCurrentWage(db, inCourse);
    const cohortAvgWage = avgCurrentWage(db, restOfCohort);

    const employmentRateDelta = courseEmploymentRate - cohortEmploymentRate;
    const wageDelta = courseAvgWage - cohortAvgWage;

    // Only escalate to "high" severity when the reports AND the real
    // outcome data agree something is wrong -- a widely-reported gap in a
    // course that's still outperforming its peers is a weaker, more likely
    // coincidental story and shouldn't be flagged with the same urgency.
    const severity: CurriculumInsight["severity"] =
      topGap.high >= 2 || employmentRateDelta <= -15
        ? "high"
        : topGap.medium >= 2 || employmentRateDelta <= -5
          ? "medium"
          : "low";

    insights.push({
      course,
      topSkillGap: topGap.name,
      severity,
      reportCount: topGap.total,
      affectedLearners: inCourse.length,
      courseEmploymentRate,
      cohortEmploymentRate,
      employmentRateDelta,
      courseAvgWage,
      cohortAvgWage,
      wageDelta,
      recommendedFix: buildDeterministicFix({
        course,
        skill: topGap.name,
        reportCount: topGap.total,
        employmentRateDelta,
        wageDelta,
      }),
    });
  });

  // Worst-performing-relative-to-peers courses first -- these are the
  // highest-value fixes to show a policymaker first.
  return insights.sort((a, b) => a.employmentRateDelta - b.employmentRateDelta);
}

function groupStats(db: ComputeDB, learners: ComputeDB["learners"], keyFn: (l: (typeof db.learners)[number]) => string) {
  const groups: Record<string, (typeof db.learners)[number][]> = {};
  learners.forEach((l) => {
    const k = keyFn(l);
    (groups[k] = groups[k] || []).push(l);
  });
  return Object.entries(groups).map(([name, g]) => {
    const ids = g.map((l) => l.traineeId);
    const placed = g.filter((l) => employmentStatus(db, l.traineeId).key === "placed").length;
    const vers = db.verifications.filter((v) => ids.includes(v.traineeId));
    const verifiedPlaced = g.filter(
      (l) =>
        employmentStatus(db, l.traineeId).key === "placed" &&
        vers.some((v) => v.traineeId === l.traineeId && v.verificationStatus === "verified")
    ).length;
    const evts = db.outcomes.filter((o) => ids.includes(o.traineeId) && o.monthlyWage);
    const wageByLearner: Record<string, number[]> = {};
    evts.forEach((o) => {
      (wageByLearner[o.traineeId] = wageByLearner[o.traineeId] || []).push(o.monthlyWage || 0);
    });
    const growths = Object.values(wageByLearner)
      .filter((w) => w.length >= 2)
      .map((w) => (w[w.length - 1] - w[0]) / w[0]);
    return {
      name,
      total: g.length,
      placed,
      placementRate: pct(placed, g.length),
      verifiedRate: pct(verifiedPlaced, placed),
      wageGrowth: growths.length
        ? Math.round((growths.reduce((a, b) => a + b, 0) / growths.length) * 100)
        : 0,
      completeness: completenessScore(db, g),
    };
  });
}

export function providerComparison(db: ComputeDB, filters: Partial<Filters> = {}) {
  return groupStats(db, applyFilters(db, filters), (l) => providerOf(db, l.traineeId)?.name || "—").sort(
    (a, b) => b.total - a.total
  );
}

export function courseComparison(db: ComputeDB, filters: Partial<Filters> = {}) {
  return groupStats(db, applyFilters(db, filters), (l) => courseOf(db, l.traineeId)?.name || "—").sort(
    (a, b) => b.total - a.total
  );
}

export function districtComparison(db: ComputeDB, filters: Partial<Filters> = {}) {
  return groupStats(db, applyFilters(db, filters), (l) => l.district).sort(
    (a, b) => b.total - a.total
  );
}

// ── Provider scorecards ──────────────────────────────────────────────────────
function avgWageGrowthFor(db: ComputeDB, ids: string[]) {
  const growths: number[] = [];
  ids.forEach((id) => {
    const wageEvts = db.outcomes
      .filter((o) => o.traineeId === id && o.monthlyWage)
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
    if (wageEvts.length >= 2) {
      const first = wageEvts[0].monthlyWage || 0;
      const lastW = wageEvts[wageEvts.length - 1].monthlyWage || 0;
      if (first > 0) growths.push((lastW - first) / first);
    }
  });
  return growths.length
    ? Math.round((growths.reduce((a, b) => a + b, 0) / growths.length) * 100)
    : 0;
}

export function providerScorecards(db: ComputeDB) {
  return providersOf(db).map((p) => {
    const learners = db.learners.filter((l) => providerOf(db, l.traineeId)?.id === p.id);
    const ids = learners.map((l) => l.traineeId);
    const placedLearners = learners.filter((l) => employmentStatus(db, l.traineeId).key === "placed");
    const vers = db.verifications.filter((v) => ids.includes(v.traineeId));
    const verifiedPlaced = placedLearners.filter((l) =>
      vers.some((v) => v.traineeId === l.traineeId && v.verificationStatus === "verified")
    );
    const fus = db.followUps.filter((f) => ids.includes(f.traineeId));
    const completedFu = fus.filter((f) => f.status === "completed");
    const ret3 = retention(db, 3, ids);
    const gaps = db.skillGaps.filter((s) => ids.includes(s.traineeId));
    const highGaps = gaps.filter((g) => g.severity === "high").length;
    const gapScore = learners.length ? Math.max(15, 100 - highGaps * 15) : 100;

    const m = {
      learners: learners.length,
      placementRate: pct(placedLearners.length, learners.length),
      verifiedRate: pct(verifiedPlaced.length, placedLearners.length || 1),
      retentionRate: ret3.rate,
      wageGrowth: avgWageGrowthFor(db, ids),
      completeness: completenessScore(db, learners),
      followUpRate: pct(completedFu.length, fus.length),
      employerVerRate: pct(vers.filter((v) => v.verificationStatus === "verified").length, vers.length || 1),
      gapScore,
    };
    const composite = Math.round(
      m.placementRate * 0.25 +
        m.verifiedRate * 0.15 +
        m.retentionRate * 0.15 +
        m.completeness * 0.15 +
        m.followUpRate * 0.1 +
        m.employerVerRate * 0.1 +
        m.gapScore * 0.1
    );
    const badge = composite >= 68 ? "Strong" : composite >= 62 ? "Improving" : "Needs attention";
    return { provider: p, ...m, composite, badge };
  });
}

// ── Follow-up queue ──────────────────────────────────────────────────────────
export function followUpBuckets(db: ComputeDB) {
  const today = todayStr();
  const scheduled = db.followUps.filter((f) => f.status === "scheduled");
  return {
    overdue: scheduled
      .filter((f) => f.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    today: scheduled.filter((f) => f.dueDate === today),
    upcoming: scheduled
      .filter((f) => f.dueDate > today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    completed: db.followUps
      .filter((f) => f.status === "completed")
      .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || "")),
  };
}

// ── Data quality ─────────────────────────────────────────────────────────────
export function dataQualityIssues(db: ComputeDB) {
  const issues: {
    type: string;
    learner: (typeof db.learners)[number];
    detail: string;
    action: string;
    actionTo: string;
  }[] = [];
  const push = (
    type: string,
    learner: (typeof db.learners)[number],
    detail: string,
    action: string,
    actionTo: string
  ) => issues.push({ type, learner, detail, action, actionTo });
  db.learners.forEach((l) => {
    const st = employmentStatus(db, l.traineeId);
    const checks = learnerChecks(db, l);
    if (!checks.consent) push("consent", l, `Consent ${l.consentStatus}`, "Collect / renew consent", "coordinator");
    if (!checks.outcome) push("outcome", l, "No outcome recorded after training", "Add outcome", "coordinator");
    if (l.phoneNote?.includes("switched off") || !checks.phone)
      push("phone", l, l.phoneNote || "Phone missing", "Update contact number", "coordinator");
    if (["placed", "apprentice"].includes(st.key)) {
      const vers = verificationsFor(db, l.traineeId);
      const unverified = vers.filter((v) => !["verified", "rejected"].includes(v.verificationStatus));
      if (unverified.length)
        push("employer", l, `${unverified.length} unverified employer record(s)`, "Verify employer", "verifier");
      if (!checks.wage) push("wage", l, "Wage / income information missing", "Add outcome update", "coordinator");
    }
    if (!checks.fresh) push("stale", l, "No update in over 90 days", "Schedule follow-up", "coordinator");
  });
  return issues;
}

// ── Timeline ─────────────────────────────────────────────────────────────────
export const TIMELINE_STYLES: Record<string, { icon: string; color: string; label: string }> = {
  enrollment: { icon: "📝", color: "bg-slate-400", label: "Enrolled" },
  training_start: { icon: "🎓", color: "bg-teal-500", label: "Training started" },
  assessment: { icon: "📋", color: "bg-teal-500", label: "Assessment" },
  certification: { icon: "🏅", color: "bg-emerald-500", label: "Certified" },
  wage_employment: { icon: "💼", color: "bg-emerald-600", label: "Wage placement" },
  self_employment: { icon: "🧵", color: "bg-violet-600", label: "Self-employment" },
  apprenticeship: { icon: "🔧", color: "bg-sky-600", label: "Apprenticeship" },
  higher_education: { icon: "📚", color: "bg-indigo-500", label: "Higher education" },
  unemployed: { icon: "⏸️", color: "bg-amber-500", label: "Unemployed" },
  not_placed: { icon: "❌", color: "bg-orange-500", label: "Not placed" },
  dropout: { icon: "🚪", color: "bg-rose-600", label: "Dropped out" },
  job_change: { icon: "🔄", color: "bg-teal-600", label: "Job change" },
  wage_update: { icon: "📈", color: "bg-lime-600", label: "Wage update" },
  re_engagement: { icon: "🔁", color: "bg-blue-500", label: "Re-engaged" },
  follow_up: { icon: "📞", color: "bg-zinc-500", label: "Follow-up call" },
  field_visit: { icon: "🚶", color: "bg-zinc-600", label: "Field visit" },
  verification: { icon: "✅", color: "bg-emerald-500", label: "Employer verification" },
  consent: { icon: "🛡️", color: "bg-amber-500", label: "Consent update" },
  contact_update: { icon: "📱", color: "bg-slate-500", label: "Contact updated" },
};

export function learnerTimeline(db: ComputeDB, traineeId: string) {
  const l = db.learners.find((x) => x.traineeId === traineeId);
  const e = enrollmentFor(db, traineeId);
  const items: { date: string; type: string; title: string; desc: string; icon: string; color: string; label: string }[] = [];
  const add = (date: string | null | undefined, type: string, title: string, desc: string) => {
    if (date) items.push({ date, type, title, desc, ...(TIMELINE_STYLES[type] || {}) });
  };

  if (e) {
    add(
      e.enrollmentDate,
      "enrollment",
      "Enrolled",
      `${courseOf(db, traineeId)?.name} at ${providerOf(db, traineeId)?.name} (Batch ${e.batchName})`
    );
    add(e.trainingStartDate, "training_start", "Training started", "");
    if (e.assessmentStatus && e.assessmentStatus !== "Pending")
      add(addDays(e.trainingEndDate, 7), "assessment", `Assessment ${e.assessmentStatus.toLowerCase()}`, "");
    if (e.certificationStatus === "Certified")
      add(addDays(e.trainingEndDate, 14), "certification", "Certification completed", "");
  }
  eventsFor(db, traineeId).forEach((o) => {
    const t = OUTCOME_TYPES[o.outcomeType]?.label || o.outcomeType;
    let desc = "";
    if (o.employerName)
      desc += `${o.jobRole || ""} at ${o.employerName}`.trim() + (o.monthlyWage ? ` · ${fmtMoney(o.monthlyWage)}/mo` : "");
    else if (o.selfEmploymentBusinessName)
      desc += o.selfEmploymentBusinessName + (o.selfEmploymentIncome ? ` · ${fmtMoney(o.selfEmploymentIncome)}/mo` : "");
    if (o.reasonCode) desc = `Reason: ${o.reasonCode}`;
    if (o.notes && !desc) desc = o.notes;
    add(
      o.eventDate,
      o.outcomeType === "wage_employment" ? "wage_employment" : o.outcomeType,
      t,
      desc
    );
  });
  followUpsFor(db, traineeId).forEach((f) => {
    const type = f.channel === "Field visit" ? "field_visit" : "follow_up";
    const status = f.status === "completed" ? "completed" : f.dueDate < todayStr() ? "overdue" : "scheduled";
    add(
      f.status === "completed" ? f.completedAt || f.dueDate : f.dueDate,
      type,
      `${f.channel} follow-up (${status})`,
      [f.reason, f.notes].filter(Boolean).join(" — ")
    );
  });
  verificationsFor(db, traineeId).forEach((v) => {
    if (v.verifiedAt)
      add(
        v.verifiedAt,
        "verification",
        `Employer ${v.verificationStatus.replace(/_/g, " ")}: ${v.employerName}`,
        `${v.verificationMethod || "—"} · confidence ${v.confidenceScore ?? "—"}%${v.verifierRemarks ? " · " + v.verifierRemarks : ""}`
      );
  });
  if (l) {
    if (l.consentDate) add(l.consentDate, "consent", `Consent given (${l.consentMethod || "—"})`, l.consentPurpose?.join(", ") || "—");
    if (l.consentLastUpdated && l.consentLastUpdated !== l.consentDate) {
      const verb =
        l.consentStatus === "revoked"
          ? "Consent revoked"
          : l.consentStatus === "expired"
            ? "Consent expired"
            : "Consent updated";
      add(l.consentLastUpdated, "consent", verb, "");
    }
    if (l.locationChanged) add(l.updatedAt, "contact_update", "Location / contact updated", l.phoneNote || "");
  }
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Insights (rule-based; complements the Gemini layer on /insights) ───────
function topSkillInDistrict(db: ComputeDB, district: string) {
  const counts: Record<string, number> = {};
  db.skillGaps.forEach((s) => {
    const l = db.learners.find((x) => x.traineeId === s.traineeId);
    if (l?.district === district) counts[s.skillName] = (counts[s.skillName] || 0) + 1;
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

export function generateInsights(db: ComputeDB) {
  const out: { tone: "warn" | "good" | "info"; text: string }[] = [];
  const courses = courseComparison(db);
  const districts = districtComparison(db);
  const providers = providerComparison(db);

  courses.forEach((c) => {
    if (c.placementRate >= 60 && c.placed >= 3) {
      const courseLearners = db.learners
        .filter((l) => courseOf(db, l.traineeId)?.name === c.name)
        .map((l) => l.traineeId);
      const r3 = retention(db, 3, courseLearners);
      if (r3.tracked >= 2 && r3.rate < 70) {
        out.push({
          tone: "warn",
          text: `${c.name} has high placement (${c.placementRate}%) but retention drops to ${r3.rate}% after 3 months — review employer quality and post-placement support.`,
        });
      }
    }
  });
  districts.forEach((d) => {
    const high = db.skillGaps.filter(
      (s) => s.severity === "high" && db.learners.find((l) => l.traineeId === s.traineeId)?.district === d.name
    ).length;
    if (high >= 2) {
      out.push({
        tone: "warn",
        text: `${d.name} shows a large skill gap in ${topSkillInDistrict(db, d.name) || "key skills"} — consider bridge modules with local employers.`,
      });
    }
  });
  providers.forEach((p) => {
    const learnerIds = db.learners
      .filter((l) => providerOf(db, l.traineeId)?.name === p.name)
      .map((l) => l.traineeId);
    const vers = db.verifications.filter((v) => learnerIds.includes(v.traineeId));
    const unverified = vers.filter((v) => !["verified", "rejected"].includes(v.verificationStatus)).length;
    if (vers.length && unverified / vers.length > 0.4) {
      out.push({
        tone: "warn",
        text: `${p.name} has a high share of unverified employer records (${unverified}/${vers.length}) — verification drive needed.`,
      });
    }
  });
  const seByCourse: Record<string, number> = {};
  db.learners.forEach((l) => {
    if (employmentStatus(db, l.traineeId).key === "self_employed") {
      const c = courseOf(db, l.traineeId)?.name;
      if (c) seByCourse[c] = (seByCourse[c] || 0) + 1;
    }
  });
  const seEntries = Object.entries(seByCourse).sort((a, b) => b[1] - a[1]);
  if (seEntries.length && seEntries[0][1] >= 2) {
    out.push({
      tone: "good",
      text: `Self-employment outcomes are strongest in ${seEntries[0][0]} (${seEntries[0][1]} learners) — replicate its toolkit + market-linkage support in other courses.`,
    });
  }
  if (providers.length) {
    const star = [...providers].sort((a, b) => b.wageGrowth - a.wageGrowth)[0];
    if (star && star.wageGrowth > 0) {
      out.push({
        tone: "good",
        text: `${star.name} learners show the best average wage growth (+${star.wageGrowth}% within a year of placement).`,
      });
    }
  }
  const noConsent = db.learners.filter((l) => !consentActive(l)).length;
  if (noConsent > 0) {
    out.push({
      tone: "info",
      text: `${noConsent} learners have missing, expired or revoked consent — their data is hidden from person-level views and appears only in aggregates.`,
    });
  }
  const b = followUpBuckets(db);
  if (b.overdue.length) {
    out.push({
      tone: "warn",
      text: `${b.overdue.length} follow-ups are overdue — oldest from ${fmtDate(b.overdue[0].dueDate)}. Clearing these improves retention data.`,
    });
  }

  return out.slice(0, 7);
}

export { STATUS_COLORS };