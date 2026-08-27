import { model, models, Schema } from "mongoose";

export type VerificationWorkflowStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "partially_verified"
  | "employer_unreachable";

export interface IEmployerVerification {
  outcomeEventId?: string;
  traineeId: string;
  employerName: string;
  jobRole?: string;
  startDate?: string; // ISO date string YYYY-MM-DD
  wage?: number;
  verificationStatus: VerificationWorkflowStatus;
  verificationMethod?: string;
  verifierRemarks?: string;
  confidenceScore?: number;
  verifiedBy?: string;
  verifiedAt?: string; // ISO date string YYYY-MM-DD
  flagged?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const employerVerificationSchema = new Schema<IEmployerVerification>(
  {
    outcomeEventId: {
      type: String,
      trim: true,
      index: true,
    },
    traineeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    employerName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    jobRole: { type: String, trim: true },
    startDate: { type: String },
    wage: { type: Number, min: 0 },
    verificationStatus: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected",
        "partially_verified",
        "employer_unreachable",
      ],
      default: "pending",
      index: true,
    },
    verificationMethod: { type: String, trim: true },
    verifierRemarks: { type: String, trim: true },
    confidenceScore: { type: Number, min: 0, max: 100 },
    verifiedBy: { type: String, trim: true },
    verifiedAt: { type: String },
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

employerVerificationSchema.index({ verificationStatus: 1, startDate: -1 });
employerVerificationSchema.index({ traineeId: 1, createdAt: -1 });

if (process.env.NODE_ENV === "development" && models.EmployerVerification) {
  delete (models as any).EmployerVerification;
}

const EmployerVerification =
  models.EmployerVerification ||
  model<IEmployerVerification>("EmployerVerification", employerVerificationSchema);

export default EmployerVerification;