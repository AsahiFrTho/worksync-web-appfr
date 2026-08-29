export interface ITrainingPeriodEvidence {
  startDate?: string | null;
  endDate?: string | null;
  hours?: number | null;
}

export interface ICertificateEvidence {
  certificateId?: string | null;
  issueDate?: string | null;
  nsqfLevel?: number | null;
  issuer?: string | null;
  grade?: string | null;
}

export interface ITraineeEvidence {
  traineeId: string;
  name: string;
  course: string;
  district: string;
  status: "enrolled" | "completed" | "certified" | "employed" | "retained" | string;
  trainingProvider?: string | null;
  trainingPeriod?: ITrainingPeriodEvidence | null;
  skills: string[];
  certificate?: ICertificateEvidence | null;
}

export interface IFollowUpEvidence {
  milestone: "30_day" | "90_day" | "180_day" | "365_day" | string;
  status: "pending" | "retained" | "left_job" | "wage_increased" | "unreachable" | string;
  dueDate: string;
  completedDate?: string | null;
  currentWage?: number | null;
  verifiedBy?: string | null;
  notes?: string | null;
}

export interface IVerificationMetadataEvidence {
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  method?: "employer_portal" | "hr_call" | "offer_letter" | "payslip" | "pf_uan" | string | null;
  disputeReason?: string | null;
  remarks?: string | null;
}

export interface IEmploymentEvidence {
  hasRecord: boolean;
  employerName?: string | null;
  jobRole?: string | null;
  employmentType?: "wage_employment" | "self_employment" | "apprenticeship" | string | null;
  district?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent?: boolean | null;
  startingWage?: number | null;
  latestWage?: number | null;
  trainingRelevance?: "directly_related" | "partially_related" | "unrelated" | string | null;
  verificationStatus?: "pending" | "verified" | "disputed" | "flagged" | string | null;
  verificationMetadata?: IVerificationMetadataEvidence | null;
  followUps?: IFollowUpEvidence[];
  notes?: string | null;
}

export interface IWageProgressionEvidence {
  startingWage: number;
  latestWage: number;
  wageDelta: number;
  growthPercentage: number;
}

export interface INormalizedTraineeEvidence {
  trainee: ITraineeEvidence;
  employment: IEmploymentEvidence;
  wageProgression: IWageProgressionEvidence;
  aggregatedAt: string;
}

/**
 * AI Curriculum Intelligence Result Schema
 *
 * This is the AI-written counterpart to lib/compute.ts's CurriculumInsight:
 * that interface holds the numbers (employment/wage deltas, report counts),
 * this one holds the plain-English policy narrative Gemini (or the
 * deterministic fallback) writes ABOUT those numbers. The AI is never given
 * a chance to invent the numbers themselves -- see buildPrompt() in
 * lib/ai/curriculum-intelligence.ts.
 */
export interface ICurriculumPolicyMemo {
  course: string;
  generatedAt: string;
  headline: string; // one-line summary for a policymaker scanning many of these
  diagnosis: string; // why this course was flagged, grounded in the exact numbers provided
  recommendedAction: string; // concrete, specific curriculum fix
  predictedImpact: string; // plain-language framing of the employment/wage delta as an opportunity
  confidence: "High" | "Medium" | "Low"; // driven by sample size, not vibes
  evidenceUsed: string[];
  source?: "gemini" | "evidence-fallback";
}

/**
 * AI Career Intelligence Result Schema
 */
export interface IAICareerIntelligenceResult {
  traineeId: string;
  generatedAt: string;
  careerOutcome: "Strong" | "Positive" | "Moderate" | "Needs Attention" | "At Risk";
  outcomeConfidence: number; // 0 - 100
  trainingEmploymentAlignment: "Direct Match" | "Partial Match" | "Unrelated" | "Mismatched";
  alignmentReason: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskReason: string;
  careerInsight: string;
  recommendedNextSkill: {
    skill: string;
    rationale: string;
  };
  evidenceUsed: string[];
  source?: "gemini" | "evidence-fallback";
}
