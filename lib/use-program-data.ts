'use client'

// Shared data hook for the operational modules. Fetches the aggregate
// /api/program-data endpoint once and exposes a joined, memoized
// ComputeDB plus refresh / seed helpers used by every page.

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  ProgramData,
  MergedLearner,
  ConsentStatus,
} from "@/lib/types";
import type { ComputeDB } from "@/lib/compute-types";

const EMPTY: ProgramData = {
  trainees: [],
  details: [],
  consents: [],
  outcomes: [],
  followUps: [],
  verifications: [],
  skillGaps: [],
  settings: null,
};

function toIso(v: unknown): string | undefined {
  if (!v) return undefined;
  if (typeof v === "string") return v.slice(0, 10);
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export interface UseProgramDataResult {
  data: ProgramData;
  db: ComputeDB;
  loading: boolean;
  error: string | null;
  seeded: boolean;
  refresh: () => Promise<void>;
  seed: () => Promise<void>;
}

export function useProgramData(): UseProgramDataResult {
  const [data, setData] = useState<ProgramData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/program-data", { cache: "no-store" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not load programme data");
      setData({
        trainees: json.trainees || [],
        details: json.details || [],
        consents: json.consents || [],
        outcomes: json.outcomes || [],
        followUps: json.followUps || [],
        verifications: json.verifications || [],
        skillGaps: json.skillGaps || [],
        settings: json.settings || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load programme data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const seed = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/seed/operations", { method: "POST" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not seed demo data");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not seed demo data");
    }
  }, [refresh]);

  const db = useMemo<ComputeDB>(() => {
    const detailByTrainee = new Map(
      data.details.map((d) => [d.traineeId, d])
    );
    const consentByTrainee = new Map(
      data.consents.map((c) => [c.traineeId, c])
    );

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
  }, [data]);

  const seeded = data.trainees.length > 0;

  return { data, db, loading, error, seeded, refresh, seed };
}