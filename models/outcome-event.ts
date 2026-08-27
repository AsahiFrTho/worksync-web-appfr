import { model, models, Schema } from "mongoose";

export type OutcomeType =
  | "wage_employment"
  | "self_employment"
  | "apprenticeship"
  | "higher_education"
  | "job_change"
  | "wage_update"
  | "unemployed"
  | "not_placed"
  | "dropout";

export type VerifiedStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "partially_verified"
  | "unreachable"
  | "not_required";

export type Relevance = "high" | "medium" | "low";

export interface IOutcomeEvent {
  traineeId: string;
  outcomeType: OutcomeType;
  eventDate: string; // ISO date string YYYY-MM-DD
  source?: string;
  employerName?: string;
  jobRole?: string;
  employmentType?: string;
  monthlyWage?: number;
  skillsUsed?: string[];
  relevanceToTraining?: Relevance;
  selfEmploymentBusinessName?: string;
  selfEmploymentNature?: string;
  selfEmploymentIncome?: number;
  selfEmploymentSupport?: string;
  apprenticeshipMentor?: string;
  apprenticeshipStatus?: string;
  higherEducationInstitution?: string;
  higherEducationCourse?: string;
  reasonCode?: string;
  notes?: string;
  verifiedStatus?: VerifiedStatus;
  tags?: string[];
  followUpRequired?: boolean;
  followUpDate?: string; // ISO date string YYYY-MM-DD
  createdAt?: Date;
  updatedAt?: Date;
}

const outcomeEventSchema = new Schema<IOutcomeEvent>(
  {
    traineeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    outcomeType: {
      type: String,
      enum: [
        "wage_employment",
        "self_employment",
        "apprenticeship",
        "higher_education",
        "job_change",
        "wage_update",
        "unemployed",
        "not_placed",
        "dropout",
      ],
      required: true,
      index: true,
    },
    eventDate: {
      type: String,
      required: true,
    },
    source: { type: String, trim: true },
    employerName: { type: String, trim: true },
    jobRole: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Temporary"],
      default: "Full-time",
    },
    monthlyWage: { type: Number, min: 0 },
    skillsUsed: { type: [String], default: [] },
    relevanceToTraining: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "high",
    },
    selfEmploymentBusinessName: { type: String, trim: true },
    selfEmploymentNature: { type: String, trim: true },
    selfEmploymentIncome: { type: Number, min: 0 },
    selfEmploymentSupport: { type: String, trim: true },
    apprenticeshipMentor: { type: String, trim: true },
    apprenticeshipStatus: {
      type: String,
      enum: ["Ongoing", "Completed", "Discontinued"],
      default: "Ongoing",
    },
    higherEducationInstitution: { type: String, trim: true },
    higherEducationCourse: { type: String, trim: true },
    reasonCode: { type: String, trim: true },
    notes: { type: String, trim: true },
    verifiedStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected",
        "partially_verified",
        "unreachable",
        "not_required",
      ],
      default: "not_required",
    },
    tags: { type: [String], default: [] },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: String },
  },
  { timestamps: true }
);

outcomeEventSchema.index({ traineeId: 1, eventDate: -1 });
outcomeEventSchema.index({ outcomeType: 1, eventDate: -1 });

if (process.env.NODE_ENV === "development" && models.OutcomeEvent) {
  delete (models as any).OutcomeEvent;
}

const OutcomeEvent =
  models.OutcomeEvent || model<IOutcomeEvent>("OutcomeEvent", outcomeEventSchema);

export default OutcomeEvent;