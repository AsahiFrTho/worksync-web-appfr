import { model, models, Schema } from "mongoose";

export interface ILearnerDetail {
  traineeId: string;
  uniqueLearnerId?: string;
  gender?: string;
  category?: string;
  block?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  phoneNote?: string;
  locationChanged?: boolean;
  notes?: string;
  batchName?: string;
  batchLabel?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const learnerDetailSchema = new Schema<ILearnerDetail>(
  {
    traineeId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    uniqueLearnerId: { type: String, trim: true },
    gender: { type: String, trim: true },
    category: { type: String, trim: true },
    block: { type: String, trim: true },
    phone: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true },
    phoneNote: { type: String, trim: true },
    locationChanged: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    batchName: { type: String, trim: true },
    batchLabel: { type: String, trim: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development" && models.LearnerDetail) {
  delete (models as any).LearnerDetail;
}

const LearnerDetail =
  models.LearnerDetail || model<ILearnerDetail>("LearnerDetail", learnerDetailSchema);

export default LearnerDetail;