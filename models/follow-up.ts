import { model, models, Schema } from "mongoose";

export type FollowUpChannel =
  | "Call"
  | "SMS"
  | "WhatsApp"
  | "IVR"
  | "Email"
  | "Field visit";

export interface IFollowUp {
  traineeId: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  assignedTo?: string;
  channel?: FollowUpChannel;
  status: "scheduled" | "completed";
  contactAttemptCount?: number;
  reason?: string;
  notes?: string;
  nextActionDate?: string; // ISO date string YYYY-MM-DD
  outcomeUpdated?: boolean;
  employmentStatus?: string;
  completedAt?: string; // ISO date string YYYY-MM-DD
  createdAt?: Date;
  updatedAt?: Date;
}

const followUpSchema = new Schema<IFollowUp>(
  {
    traineeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    dueDate: {
      type: String,
      required: true,
      index: true,
    },
    assignedTo: { type: String, trim: true },
    channel: {
      type: String,
      enum: ["Call", "SMS", "WhatsApp", "IVR", "Email", "Field visit"],
      default: "Call",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "scheduled",
      index: true,
    },
    contactAttemptCount: { type: Number, default: 0, min: 0 },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    nextActionDate: { type: String },
    outcomeUpdated: { type: Boolean, default: false },
    employmentStatus: { type: String, trim: true },
    completedAt: { type: String },
  },
  { timestamps: true }
);

followUpSchema.index({ traineeId: 1, dueDate: 1 });
followUpSchema.index({ status: 1, dueDate: 1 });

if (process.env.NODE_ENV === "development" && models.FollowUp) {
  delete (models as any).FollowUp;
}

const FollowUp = models.FollowUp || model<IFollowUp>("FollowUp", followUpSchema);

export default FollowUp;