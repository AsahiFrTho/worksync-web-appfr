// Shared "join" logic: turns the raw, per-collection ProgramData shape
// (what /api/program-data returns, and what a server-side Mongo fetch also
// produces once serialized) into the merged ComputeDB shape every selector
// in lib/compute.ts operates on.
//
// This used to live inline inside lib/use-program-data.ts's useMemo. It was
// extracted here so a server-side caller (lib/ai/curriculum-evidence.ts)
// can build the exact same ComputeDB the client dashboard sees, from the
// exact same merge rules, instead of a second hand-written copy that could
// silently drift out of sync with the client version over time.

import type { ProgramData, MergedLearner, ConsentStatus } from "@/lib/types";
import type { ComputeDB } from "@/lib/compute-types";

function toIso(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export function buildComputeDb(data: ProgramData): ComputeDB {
  const detailByTrainee = new Map(data.details.map((d) => [d.traineeId, d]));
  const consentByTrainee = new Map(data.consents.map((c) => [c.traineeId, c]));

  const learners: MergedLearner[] = data.trainees.map((t) => {
    const detail = detailByTrainee.get(t.traineeId);
    const consent = consentByTrainee.get(t.traineeId);
    return {
      ...t,
      detail,
      consent,
      gender: detail?.gender,
      category: detail?.category,
      block: detail?.block,
      phone: detail?.phone,
      alternatePhone: detail?.alternatePhone,
      email: detail?.email,
      phoneNote: detail?.phoneNote,
      locationChanged: detail?.locationChanged,
      notes: detail?.notes,
      batchName: detail?.batchName,
      batchLabel: detail?.batchLabel,
      uniqueLearnerId: detail?.uniqueLearnerId || t.traineeId,
      consentStatus: (consent?.consentStatus || "missing") as ConsentStatus,
      consentDate: consent?.consentDate,
      consentMethod: consent?.consentMethod,
      consentPurpose: consent?.consentPurpose,
      consentLastUpdated: consent?.consentLastUpdated,
      trainingPeriodStart: toIso(t.trainingPeriod?.startDate),
      trainingPeriodEnd: toIso(t.trainingPeriod?.endDate),
    };
  });

  return {
    learners,
    outcomes: data.outcomes,
    followUps: data.followUps,
    verifications: data.verifications,
    skillGaps: data.skillGaps,
    settings: data.settings,
  };
}
