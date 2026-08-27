import { model, models, Schema } from "mongoose";

export type ConsentStatus = "active" | "expired" | "revoked" | "missing";

export interface IConsentRecord {
  traineeId: string;
  consentStatus: ConsentStatus;
  consentDate?: string; // ISO date string YYYY-MM-DD
  consentMethod?: string;
  consentPurpose?: string[];
  consentLastUpdated?: string; // ISO date string YYYY-MM-DD
  createdAt?: Date;
  updatedAt?: Date;
}

const consentRecordSchema = new Schema<IConsentRecord>(
  {
    traineeId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    consentStatus: {
      type: String,
      enum: ["active", "expired", "revoked", "missing"],
      default: "missing",
      index: true,
    },
    consentDate: { type: String },
    consentMethod: { type: String, trim: true },
    consentPurpose: { type: [String], default: [] },
    consentLastUpdated: { type: String },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development" && models.ConsentRecord) {
  delete (models as any).ConsentRecord;
}

const ConsentRecord =
  models.ConsentRecord ||
  model<IConsentRecord>("ConsentRecord", consentRecordSchema);

export default ConsentRecord;