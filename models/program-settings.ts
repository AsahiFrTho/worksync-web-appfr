import { model, models, Schema } from "mongoose";

export interface INotificationRules {
  followUpSameDay?: boolean;
  overdueDigest?: string;
  consentExpiryReminderDays?: number;
  channels?: string[];
}

export interface IProgramSettings {
  singleton: string;
  programName?: string;
  districts?: string[];
  reasonCodes?: string[];
  skillTags?: string[];
  consentPolicy?: string;
  retentionPeriodMonths?: number;
  notificationRules?: INotificationRules;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationRulesSchema = new Schema<INotificationRules>(
  {
    followUpSameDay: { type: Boolean, default: true },
    overdueDigest: { type: String, trim: true },
    consentExpiryReminderDays: { type: Number, default: 30, min: 0 },
    channels: { type: [String], default: [] },
  },
  { _id: false }
);

const programSettingsSchema = new Schema<IProgramSettings>(
  {
    singleton: {
      type: String,
      default: "default",
      unique: true,
    },
    programName: {
      type: String,
      default: 'KaushalPulse — Skill Development Mission',
      trim: true,
    },
    districts: { type: [String], default: [] },
    reasonCodes: { type: [String], default: [] },
    skillTags: { type: [String], default: [] },
    consentPolicy: { type: String, default: '' },
    retentionPeriodMonths: { type: Number, default: 36, min: 0 },
    notificationRules: {
      type: notificationRulesSchema,
      default: () => ({
        followUpSameDay: true,
        overdueDigest: 'Daily 9:00 AM to coordinator',
        consentExpiryReminderDays: 30,
        channels: ['SMS', 'WhatsApp', 'Email', 'IVR'],
      }),
    },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV === "development" && models.ProgramSettings) {
  delete (models as any).ProgramSettings;
}

const ProgramSettings =
  models.ProgramSettings ||
  model<IProgramSettings>("ProgramSettings", programSettingsSchema);

export default ProgramSettings;