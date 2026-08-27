import { model, models, Schema } from "mongoose";

export type SkillGapReporter = "employer" | "learner" | "course";
export type SkillGapSeverity = "high" | "medium" | "low";

export interface ISkillGapReport {
  traineeId: string;
  courseId?: string;
  skillName: string;
  reportedBy: SkillGapReporter;
  severity: SkillGapSeverity;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const skillGapReportSchema = new Schema<ISkillGapReport>(
  {
    traineeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseId: { type: String, trim: true },
    skillName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    reportedBy: {
      type: String,
      enum: ["employer", "learner", "course"],
      default: "learner",
    },
    severity: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

skillGapReportSchema.index({ skillName: 1, severity: 1 });
skillGapReportSchema.index({ courseId: 1, createdAt: -1 });

if (process.env.NODE_ENV === "development" && models.SkillGapReport) {
  delete (models as any).SkillGapReport;
}

const SkillGapReport =
  models.SkillGapReport ||
  model<ISkillGapReport>("SkillGapReport", skillGapReportSchema);

export default SkillGapReport;