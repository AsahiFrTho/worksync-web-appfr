import { connectToDatabase } from "@/lib/mongodb";
import Trainee from "@/models/trainee";
import LearnerDetail from "@/models/learner-detail";
import ConsentRecord from "@/models/consent-record";
import OutcomeEvent from "@/models/outcome-event";
import FollowUp from "@/models/follow-up";
import EmployerVerification from "@/models/employer-verification";
import SkillGapReport from "@/models/skill-gap-report";
import ProgramSettings from "@/models/program-settings";

// ── Date helpers (relative to "today" so the demo always looks current) ──
const DAY = 86400000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (dstr: string, n: number) =>
  iso(new Date(new Date(dstr + "T12:00:00Z").getTime() + n * DAY));
const addMonths = (dstr: string, m: number) => {
  const d = new Date(dstr + "T12:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + m);
  return iso(d);
};
const TODAY = iso(new Date());
const ago = (days: number) => addDays(TODAY, -days);
const agoMonths = (m: number, jitter = 0) => addDays(addMonths(TODAY, -m), jitter);

// ── Static reference data (ported from KaushalSetu seed) ──────────────────
const PROVIDERS = [
  { id: "P1", name: "Nashik Skill Academy", district: "Nashik", status: "active" },
  { id: "P2", name: "Vidarbha Training Institute", district: "Nagpur", status: "active" },
  { id: "P3", name: "Pune Kaushal Kendra", district: "Pune", status: "active" },
];

const COURSES = [
  { id: "C1", name: "Retail Sales Associate", sector: "Retail", durationHours: 200, status: "active" },
  { id: "C2", name: "CNC Machine Operator", sector: "Manufacturing", durationHours: 300, status: "active" },
  { id: "C3", name: "Digital Services Assistant", sector: "IT-ITeS", durationHours: 240, status: "active" },
  { id: "C4", name: "Self-Employed Tailor", sector: "Apparel", durationHours: 180, status: "active" },
];

const REASON_CODES = [
  "Relocation", "Health issue", "Family responsibility", "Course mismatch", "Low wage offer",
  "No local opportunity", "Transport issue", "Awaiting better opportunity", "Not interested",
  "Employer not verified", "Other",
];

const SKILL_TAGS = [
  "Digital payments", "Customer handling", "Machine operation", "Communication", "Basic computer skills",
  "Safety compliance", "Sales skills", "Data entry", "Tool handling", "Soft skills",
];

const VERIFICATION_METHODS = [
  "Employer call", "Employer portal response", "Document uploaded", "Field visit", "Payment proof", "Attendance/offer letter",
];

const BATCHES: Record<string, { provider: string; course: string; label: string }> = {
  "RSA-N25A": { provider: "P1", course: "C1", label: "RSA Nashik 2025-A" },
  "CNC-N25A": { provider: "P1", course: "C2", label: "CNC Nashik 2025-B" },
  "Digi-N26A": { provider: "P1", course: "C3", label: "Digital Nashik 2026-A" },
  "Digi-N26B": { provider: "P1", course: "C3", label: "Digital Nashik 2026-B (in training)" },
  "RSA-NG25A": { provider: "P2", course: "C1", label: "RSA Nagpur 2025-A" },
  "Tailor-NG25A": { provider: "P2", course: "C4", label: "Tailor Nagpur 2025-A" },
  "CNC-P25A": { provider: "P3", course: "C2", label: "CNC Pune 2025-A" },
  "Digi-P26A": { provider: "P3", course: "C3", label: "Digital Pune 2026-A" },
  "Tailor-P26A": { provider: "P3", course: "C4", label: "Tailor Pune 2026-A" },
};

const BLOCKS: Record<string, string[]> = {
  Nashik: ["Dindori", "Igatpuri", "Sinnar", "Niphad", "Nashik City"],
  Nagpur: ["Hingna", "Kamptee", "Umred", "Nagpur Rural", "Nagpur City"],
  Pune: ["Haveli", "Baramati", "Junnar", "Mulshi", "Pune City"],
};

interface OutcomeSpec {
  outcomeType: string;
  eventDate: string;
  [key: string]: unknown;
}

interface LearnerSpec {
  name: string;
  gender: string;
  category: string;
  provider: string;
  batch: string;
  consent: "a" | "r" | "e" | "n";
  notes?: string;
  phoneNote?: string;
  locationChanged?: boolean;
  trainingStatus?: string;
  outcomes: OutcomeSpec[];
  verification?: {
    employer: string;
    role: string;
    wage: number;
    startDate: string;
    status: "verified" | "pending" | "partially_verified" | "rejected" | "employer_unreachable";
    remarks: string;
    confidence: number | null;
  };
  followUps?: { offsetDays: number; status: "scheduled" | "completed"; reason: string; attempts: number; notes?: string; channel?: string; employmentStatus?: string }[];
  skillGaps?: { skill: string; reportedBy: "employer" | "learner"; severity: "high" | "medium" | "low"; notes?: string }[];
}

// Specs are relative to TODAY: event dates via agoMonths/ago, follow-up
// offsets via dueDate = TODAY + offsetDays (negative = overdue).
const SPECS: LearnerSpec[] = [
  {
    name: "Snehal Jadhav", gender: "Female", category: "OBC", provider: "P1", batch: "RSA-N25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(17), employerName: "Vishal Mega Mart, Nashik", jobRole: "Sales Associate", monthlyWage: 11500, relevanceToTraining: "high", verifiedStatus: "verified", employmentType: "Full-time", skillsUsed: ["Customer handling", "Sales skills"] },
      { outcomeType: "wage_update", eventDate: agoMonths(14), employerName: "Vishal Mega Mart, Nashik", monthlyWage: 11800, notes: "Wage revision after 3 months" },
      { outcomeType: "wage_update", eventDate: agoMonths(11), employerName: "Vishal Mega Mart, Nashik", monthlyWage: 12500, notes: "Wage revision after 6 months" },
      { outcomeType: "wage_update", eventDate: agoMonths(5), employerName: "Vishal Mega Mart, Nashik", monthlyWage: 13800, notes: "Wage revision after 12 months" },
    ],
    verification: { employer: "Vishal Mega Mart, Nashik", role: "Sales Associate", wage: 11500, startDate: agoMonths(17), status: "verified", remarks: "HR confirmed role & wage on call.", confidence: 94 },
    followUps: [
      { offsetDays: -500, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Comfortable on shop floor." },
      { offsetDays: -60, status: "completed", reason: "12-month wage update", attempts: 1, notes: "Wage ₹13,800; considering senior sales exam." },
    ],
    skillGaps: [{ skill: "Digital payments", reportedBy: "employer", severity: "high", notes: "Struggles with UPI settlement reconciliation." }],
  },
  {
    name: "Kavita Wagh", gender: "Female", category: "ST", provider: "P1", batch: "RSA-N25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(16), employerName: "FirstCry Warehouse, Nashik", jobRole: "Inventory Assistant", monthlyWage: 12800, relevanceToTraining: "medium", verifiedStatus: "pending", employmentType: "Full-time", skillsUsed: ["Data entry", "Tool handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(13), employerName: "FirstCry Warehouse, Nashik", monthlyWage: 13100 },
      { outcomeType: "wage_update", eventDate: agoMonths(10), employerName: "FirstCry Warehouse, Nashik", monthlyWage: 13400 },
      { outcomeType: "job_change", eventDate: agoMonths(4), employerName: "Amazon Delivery Partner", jobRole: "Ops Assistant", monthlyWage: 15200, reasonCode: "Better wage", notes: "Changed job: better wage", verifiedStatus: "pending" },
    ],
    verification: { employer: "Amazon Delivery Partner", role: "Ops Assistant", wage: 15200, startDate: agoMonths(4), status: "pending", remarks: "Awaiting verifier action.", confidence: null },
    followUps: [
      { offsetDays: -465, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Learning warehouse software." },
      { offsetDays: -16, status: "completed", reason: "Check after job change", attempts: 1, notes: "Happy with Amazon ops role; shift allowance helps.", channel: "WhatsApp" },
    ],
    skillGaps: [{ skill: "Communication", reportedBy: "learner", severity: "medium", notes: "Hesitant speaking with customers." }],
  },
  {
    name: "Rohit Deore", gender: "Male", category: "OBC", provider: "P1", batch: "CNC-N25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(11), employerName: "Sundaram Auto Components", jobRole: "CNC Operator", monthlyWage: 15500, relevanceToTraining: "high", verifiedStatus: "partially_verified", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance", "Tool handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(8), employerName: "Sundaram Auto Components", monthlyWage: 16400 },
      { outcomeType: "wage_update", eventDate: agoMonths(5), employerName: "Sundaram Auto Components", monthlyWage: 17800 },
    ],
    verification: { employer: "Sundaram Auto Components", role: "CNC Operator", wage: 15500, startDate: agoMonths(11), status: "partially_verified", remarks: "Employer confirmed employment; wage not confirmed.", confidence: 62 },
    followUps: [
      { offsetDays: -330, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Machine handling confident now." },
      { offsetDays: -9, status: "completed", reason: "6-month wage update", attempts: 1, notes: "Employed at Sundaram Auto; wage ₹17,800 confirmed." },
    ],
    skillGaps: [{ skill: "Basic computer skills", reportedBy: "employer", severity: "medium", notes: "G-code editing needs supervision." }],
  },
  {
    name: "Dipti Sonawane", gender: "Female", category: "OBC", provider: "P1", batch: "CNC-N25A", consent: "r",
    notes: "Learner called in Jun 2026 and asked to stop outcome calls — consent revoked.",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(11), employerName: "Mahindra Tractors, Nashik", jobRole: "Quality Inspector", monthlyWage: 16000, relevanceToTraining: "high", verifiedStatus: "pending", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(8), employerName: "Mahindra Tractors, Nashik", monthlyWage: 16800 },
    ],
    verification: { employer: "Mahindra Tractors, Nashik", role: "Quality Inspector", wage: 16000, startDate: agoMonths(11), status: "pending", remarks: "Awaiting verifier action.", confidence: null },
    followUps: [
      { offsetDays: -325, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Quality checks learning phase." },
      { offsetDays: 21, status: "scheduled", reason: "Quarterly consent refresh + wage update", attempts: 0 },
    ],
  },
  {
    name: "Ganesh Pawar", gender: "Male", category: "SC", provider: "P1", batch: "CNC-N25A", consent: "a",
    outcomes: [
      { outcomeType: "unemployed", eventDate: agoMonths(10), reasonCode: "No local opportunity", notes: "Willing to relocate to Pune if wage > ₹14,000." },
    ],
    followUps: [{ offsetDays: -12, status: "scheduled", reason: "3-month employment check — last status unemployed", attempts: 2, notes: "Two calls unanswered." }],
    skillGaps: [{ skill: "Machine operation", reportedBy: "learner", severity: "high", notes: "Only 2 weeks on live machine during training." }],
  },
  {
    name: "Rutuja Gaikwad", gender: "Female", category: "OBC", provider: "P1", batch: "Digi-N26A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(2), employerName: "CSC e-Gram Services, Nashik", jobRole: "Digital Services Operator", monthlyWage: 11000, relevanceToTraining: "high", verifiedStatus: "verified", employmentType: "Full-time", skillsUsed: ["Digital payments", "Basic computer skills", "Data entry"] },
    ],
    verification: { employer: "CSC e-Gram Services, Nashik", role: "Digital Services Operator", wage: 11000, startDate: agoMonths(2), status: "verified", remarks: "Salary credit confirmed via bank proof.", confidence: 91 },
    followUps: [
      { offsetDays: -30, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Settled well at CSC centre; learning fast." },
      { offsetDays: 4, status: "scheduled", reason: "2-month employment check after placement", attempts: 0, channel: "WhatsApp" },
    ],
    skillGaps: [{ skill: "Digital payments", reportedBy: "employer", severity: "high", notes: "Aadhaar-enabled payment errors." }],
  },
  {
    name: "Anjali Chaudhari", gender: "Female", category: "ST", provider: "P1", batch: "Digi-N26B", consent: "a",
    trainingStatus: "enrolled",
    outcomes: [],
    followUps: [{ offsetDays: 8, status: "scheduled", reason: "Mid-training attendance check", attempts: 0, channel: "SMS", employmentStatus: "In training" }],
  },
  {
    name: "Prachi Meshram", gender: "Female", category: "OBC", provider: "P2", batch: "RSA-NG25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(8), employerName: "Haldiram's, Nagpur", jobRole: "Counter Sales Executive", monthlyWage: 11800, relevanceToTraining: "high", verifiedStatus: "verified", employmentType: "Full-time", skillsUsed: ["Customer handling", "Sales skills", "Digital payments"] },
      { outcomeType: "wage_update", eventDate: agoMonths(5), employerName: "Haldiram's, Nagpur", monthlyWage: 12400 },
      { outcomeType: "wage_update", eventDate: agoMonths(2), employerName: "Haldiram's, Nagpur", monthlyWage: 13100 },
    ],
    verification: { employer: "Haldiram's, Nagpur", role: "Counter Sales Executive", wage: 11800, startDate: agoMonths(8), status: "verified", remarks: "Offer letter verified against records.", confidence: 89 },
    followUps: [
      { offsetDays: -235, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Counter sales going well." },
      { offsetDays: -7, status: "completed", reason: "3-month retention check", attempts: 1, notes: "Happy with role; considering team-lead track.", channel: "WhatsApp" },
    ],
    skillGaps: [{ skill: "Sales skills", reportedBy: "employer", severity: "low", notes: "Upselling ability below peers." }],
  },
  {
    name: "Sanika Gabhane", gender: "Female", category: "Open", provider: "P2", batch: "RSA-NG25A", consent: "e",
    notes: "Consent expired Apr 2026 — renewal SMS scheduled but not responded.",
    phoneNote: "Relocated within district; number updated on call.", locationChanged: true,
    outcomes: [
      { outcomeType: "unemployed", eventDate: agoMonths(7), reasonCode: "Family responsibility" },
    ],
    followUps: [{ offsetDays: -5, status: "scheduled", reason: "Consent renewal (expired)", attempts: 1, notes: "Renewal SMS sent, no response.", channel: "SMS" }],
  },
  {
    name: "Ayesha Khan", gender: "Female", category: "OBC", provider: "P2", batch: "RSA-NG25A", consent: "n",
    notes: "Did not sign consent form at enrolment; counsellor to revisit.",
    outcomes: [
      { outcomeType: "not_placed", eventDate: agoMonths(7), reasonCode: "Awaiting better opportunity" },
    ],
    followUps: [{ offsetDays: 15, status: "scheduled", reason: "Consent counselling visit", attempts: 0, channel: "Field visit" }],
  },
  {
    name: "Manisha Ingle", gender: "Female", category: "SC", provider: "P2", batch: "Tailor-NG25A", consent: "a",
    outcomes: [
      { outcomeType: "self_employment", eventDate: agoMonths(7), selfEmploymentBusinessName: "Maa Bhavani Tailoring Unit", selfEmploymentNature: "Stitching & alteration services", selfEmploymentIncome: 9500, selfEmploymentSupport: "Toolkit + ₹5,000 seed grant", skillsUsed: ["Tool handling", "Customer handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(1), selfEmploymentBusinessName: "Maa Bhavani Tailoring Unit", selfEmploymentIncome: 12800, notes: "Monthly income now ₹12,800" },
    ],
    followUps: [{ offsetDays: -14, status: "completed", reason: "Income update for tailoring unit", attempts: 2, notes: "Monthly income up to ₹12,800; new school uniform orders.", employmentStatus: "Self-employed" }],
    skillGaps: [{ skill: "Sales skills", reportedBy: "learner", severity: "medium", notes: "Wants help marketing on WhatsApp." }],
  },
  {
    name: "Omkar Shinde", gender: "Male", category: "OBC", provider: "P3", batch: "CNC-P25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(13), employerName: "Bajaj Auto Vendor Unit, Chakan", jobRole: "Machine Operator", monthlyWage: 16800, relevanceToTraining: "high", verifiedStatus: "verified", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(10), employerName: "Bajaj Auto Vendor Unit, Chakan", monthlyWage: 17600 },
      { outcomeType: "wage_update", eventDate: agoMonths(7), employerName: "Bajaj Auto Vendor Unit, Chakan", monthlyWage: 18800 },
      { outcomeType: "wage_update", eventDate: agoMonths(1), employerName: "Bajaj Auto Vendor Unit, Chakan", monthlyWage: 20500, notes: "Wage now ₹20,500; promoted to senior operator." },
    ],
    verification: { employer: "Bajaj Auto Vendor Unit, Chakan", role: "Machine Operator", wage: 16800, startDate: agoMonths(13), status: "verified", remarks: "HR confirmed role & wage on call.", confidence: 96 },
    followUps: [
      { offsetDays: -385, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Night shift initially, later moved to day." },
      { offsetDays: -20, status: "completed", reason: "12-month wage progression update", attempts: 1, notes: "Wage now ₹20,500; promoted to senior operator." },
    ],
    skillGaps: [{ skill: "Safety compliance", reportedBy: "employer", severity: "low", notes: "Refresher on new SOP needed." }],
  },
  {
    name: "Harshad Mulani", gender: "Male", category: "Open", provider: "P3", batch: "CNC-P25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(12), employerName: "Godrej Interio Plant, Pune", jobRole: "Production Assistant", monthlyWage: 14200, relevanceToTraining: "medium", verifiedStatus: "rejected", employmentType: "Contract", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(9), employerName: "Godrej Interio Plant, Pune", monthlyWage: 14800 },
    ],
    verification: { employer: "Godrej Interio Plant, Pune", role: "Production Assistant", wage: 14200, startDate: agoMonths(12), status: "rejected", remarks: "Wage claimed (₹19,000) not supported by payslip provided.", confidence: 20 },
    followUps: [{ offsetDays: -350, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Contract role; hopes for absorption." }],
    skillGaps: [{ skill: "Machine operation", reportedBy: "employer", severity: "medium", notes: "Multi-axis exposure missing." }],
  },
  {
    name: "Vaishnavi Kale", gender: "Female", category: "OBC", provider: "P3", batch: "CNC-P25A", consent: "a",
    outcomes: [
      { outcomeType: "higher_education", eventDate: agoMonths(12), notes: "Admitted to Government Polytechnic Diploma (Mechanical). Pursuing higher education." },
    ],
    followUps: [{ offsetDays: -11, status: "completed", reason: "Confirm higher-education status", attempts: 1, notes: "Diploma 1st year going well.", employmentStatus: "Higher education" }],
  },
  {
    name: "Amit Bhosale", gender: "Male", category: "SC", provider: "P3", batch: "Digi-P26A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(5), employerName: "Web Werks Data Center", jobRole: "IT Support Trainee", monthlyWage: 13500, relevanceToTraining: "medium", verifiedStatus: "partially_verified", employmentType: "Full-time", skillsUsed: ["Basic computer skills"] },
      { outcomeType: "unemployed", eventDate: agoMonths(2), reasonCode: "Transport issue", notes: "Workplace 30 km away; no reliable transport after shift. Open to roles within city limits." },
    ],
    verification: { employer: "Web Werks Data Center", role: "IT Support Trainee", wage: 13500, startDate: agoMonths(5), status: "partially_verified", remarks: "Employer confirmed employment; wage not confirmed.", confidence: 58 },
    followUps: [
      { offsetDays: -140, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Networking basics being taught on the job." },
      { offsetDays: -4, status: "completed", reason: "Check after exit from job", attempts: 1, notes: "Left due to transport; wants roles within city limits. Sharing 2 vacancies.", channel: "WhatsApp", employmentStatus: "Unemployed" },
    ],
    skillGaps: [{ skill: "Communication", reportedBy: "employer", severity: "high", notes: "Client interaction confidence low." }],
  },
  {
    name: "Pooja Shirodkar", gender: "Female", category: "Open", provider: "P3", batch: "Digi-P26A", consent: "r",
    notes: "Moved to Mumbai after marriage; does not wish to be contacted.",
    outcomes: [
      { outcomeType: "unemployed", eventDate: agoMonths(4), reasonCode: "Not interested", notes: "Moved to Mumbai after marriage; does not wish to be contacted." },
    ],
    followUps: [{ offsetDays: 0, status: "scheduled", reason: "Confirm exit from tracking (consent revoked)", attempts: 0, channel: "SMS" }],
  },
  {
    name: "Kiran Jagtap", gender: "Male", category: "OBC", provider: "P3", batch: "Digi-P26A", consent: "n",
    notes: "Phone number on record is wrong — needs alternate contact from family.",
    phoneNote: "Number switched off since Jun 2026",
    outcomes: [
      { outcomeType: "not_placed", eventDate: agoMonths(4), reasonCode: "No local opportunity" },
    ],
    followUps: [{ offsetDays: -8, status: "scheduled", reason: "Consent pending + phone not reachable", attempts: 3, notes: "Number switched off. Try alternate contact.", channel: "IVR" }],
  },
  {
    name: "Neha Kadam", gender: "Female", category: "OBC", provider: "P3", batch: "Tailor-P26A", consent: "a",
    outcomes: [
      { outcomeType: "self_employment", eventDate: agoMonths(3), selfEmploymentBusinessName: "Neha Creations", selfEmploymentNature: "Ladies wear stitching", selfEmploymentIncome: 7800, selfEmploymentSupport: "Toolkit + market linkage", skillsUsed: ["Customer handling", "Digital payments"] },
      { outcomeType: "wage_update", eventDate: agoMonths(2), selfEmploymentBusinessName: "Neha Creations", selfEmploymentIncome: 8600 },
    ],
    followUps: [{ offsetDays: 7, status: "scheduled", reason: "Income update for self-employment", attempts: 0 }],
    skillGaps: [{ skill: "Digital payments", reportedBy: "learner", severity: "medium", notes: "Started UPI; wants QR display setup help." }],
  },
];

export async function POST() {
  try {
    await connectToDatabase();

    // Idempotent: wipe only the NEW collections, keep existing Trainee /
    // EmploymentRecord data (KP-* passport & employer workflows) intact.
    await Promise.all([
      LearnerDetail.deleteMany({}),
      ConsentRecord.deleteMany({}),
      OutcomeEvent.deleteMany({}),
      FollowUp.deleteMany({}),
      EmployerVerification.deleteMany({}),
      SkillGapReport.deleteMany({}),
      ProgramSettings.deleteMany({}),
    ]);

    const settings = await ProgramSettings.create({
      singleton: "default",
      programName: "KaushalSetu — Skill Development Mission",
      districts: ["Nashik", "Nagpur", "Pune"],
      reasonCodes: REASON_CODES,
      skillTags: SKILL_TAGS,
      consentPolicy:
        "Learner consent is taken before enrolment completes and covers outcome tracking, employer verification and programme analytics. Consent is valid for 24 months and can be revoked any time via call, SMS or in person. When consent is not active, personal identifiers are hidden and the learner appears only in aggregate, pseudonymised form.",
      retentionPeriodMonths: 36,
      notificationRules: {
        followUpSameDay: true,
        overdueDigest: "Daily 9:00 AM to coordinator",
        consentExpiryReminderDays: 30,
        channels: ["SMS", "WhatsApp", "Email", "IVR"],
      },
    });

    let okTrainees = 0;
    for (let i = 0; i < SPECS.length; i++) {
      const spec = SPECS[i];
      const provider = PROVIDERS.find((p) => p.id === spec.provider)!;
      const batch = BATCHES[spec.batch];
      const course = COURSES.find((c) => c.id === batch.course)!;
      const traineeId = `KS-2025-${String(1024 + i)}`;
      const blockList = BLOCKS[provider.district];
      const block = blockList[i % blockList.length];
      const enrStart = agoMonths(18, -i % 3);
      const given = spec.consent === "a";

      const currentWage =
        spec.outcomes
          .filter((o) => o.outcomeType === "wage_employment" || o.outcomeType === "job_change")
          .reduce((acc: number | undefined, o) => (o.monthlyWage != null ? Math.max(acc ?? 0, Number(o.monthlyWage)) : acc), undefined) ??
        spec.outcomes
          .filter((o) => o.outcomeType === "self_employment")
          .reduce((acc: number | undefined, o) => (o.selfEmploymentIncome != null ? Math.max(acc ?? 0, Number(o.selfEmploymentIncome)) : acc), undefined) ??
        0;

      const trainee = await Trainee.findOneAndUpdate(
        { traineeId },
        {
          name: spec.name,
          district: provider.district,
          course: course.name,
          status: spec.trainingStatus === "enrolled"
            ? "enrolled"
            : currentWage > 0
              ? "employed"
              : "completed",
          monthlyWage: currentWage,
          trainingProvider: `${provider.name}, ${provider.district}`,
          trainingPeriod: {
            startDate: new Date(addMonths(enrStart, 1)),
            endDate: new Date(addMonths(enrStart, 1 + Math.round(course.durationHours / 200))),
            hours: course.durationHours,
          },
          skills: spec.outcomes.flatMap((o) => ((o.skillsUsed as string[]) || []).slice(0, 6)),
          certificate: {
            certificateId: `MSD-2025-${String(1024 + i).padStart(5, "0")}`,
            issueDate: new Date(addMonths(enrStart, 3)),
            nsqfLevel: 4,
            issuer: "NCVET / MSSDS",
          },
        },
        { new: true, upsert: true }
      );
      okTrainees++;

      await LearnerDetail.create({
        traineeId,
        uniqueLearnerId: traineeId,
        gender: spec.gender,
        category: spec.category,
        block,
        phone: `9${String(100000000 + i * 1379).slice(0, 10)}`,
        alternatePhone: i % 4 === 0 ? `9${String(700000000 + i * 331).slice(0, 10)}` : "",
        email: `${spec.name.split(" ")[0].toLowerCase()}${i}@example.com`,
        phoneNote: spec.phoneNote || "",
        locationChanged: !!spec.locationChanged,
        notes: spec.notes || "",
        batchName: spec.batch,
        batchLabel: batch.label,
      });

      const consentDate = given ? addDays(enrStart, 1) : "";
      await ConsentRecord.create({
        traineeId,
        consentStatus: spec.consent === "a" ? "active" : spec.consent === "r" ? "revoked" : spec.consent === "e" ? "expired" : "missing",
        consentDate: given ? consentDate : "",
        consentMethod: given ? (["Form", "In-person", "SMS", "Call"][i % 4]) : "",
        consentPurpose: given ? ["Outcome tracking", "Employer verification", "Analytics"] : [],
        consentLastUpdated: given ? consentDate : spec.consent === "r" ? agoMonths(2, 5) : "",
      });

      for (const o of spec.outcomes) {
        const { outcomeType, eventDate, ...rest } = o;
        await OutcomeEvent.create({
          traineeId,
          outcomeType,
          eventDate,
          source: "Coordinator",
          tags: [],
          ...rest,
        } as never);
      }

      if (spec.verification) {
        await EmployerVerification.create({
          outcomeEventId: null, // linked below
          traineeId,
          employerName: spec.verification.employer,
          jobRole: spec.verification.role,
          startDate: spec.verification.startDate,
          wage: spec.verification.wage,
          verificationStatus: spec.verification.status,
          verificationMethod:
            ["verified", "partially_verified"].includes(spec.verification.status)
              ? VERIFICATION_METHODS[i % VERIFICATION_METHODS.length]
              : "",
          verifierRemarks: spec.verification.remarks,
          confidenceScore: spec.verification.confidence,
          verifiedBy: spec.verification.status === "verified" ? "Arjun Pawar" : "",
          verifiedAt: spec.verification.status === "verified" ? ago(15 + i) : "",
          flagged: false,
        });
      }

      for (const f of spec.followUps || []) {
        await FollowUp.create({
          traineeId,
          dueDate: addDays(TODAY, f.offsetDays),
          assignedTo: ["Sunita Wagh", "Rahul Kulkarni"][i % 2],
          channel: f.channel || "Call",
          status: f.status,
          contactAttemptCount: f.attempts,
          reason: f.reason,
          notes: f.notes || "",
          nextActionDate: f.status === "completed" ? "" : addDays(TODAY, Math.max(f.offsetDays + 7, 3)),
          outcomeUpdated: f.status === "completed",
          completedAt: f.status === "completed" ? addDays(TODAY, f.offsetDays) : "",
          employmentStatus: f.employmentStatus || "",
        });
      }

      for (const g of spec.skillGaps || []) {
        await SkillGapReport.create({
          traineeId,
          courseId: course.id,
          skillName: g.skill,
          reportedBy: g.reportedBy,
          severity: g.severity,
          notes: g.notes || "",
        });
      }
    }

    // Link the latest wage-employment outcome event to its verification only
    // when the verification record's outcomeEventId is still null — keeps the
    // profile's verification block honest.
    const verifications = await EmployerVerification.find({ outcomeEventId: null }).lean();
    for (const v of verifications) {
      const latest = await OutcomeEvent.findOne({
        traineeId: v.traineeId,
        outcomeType: { $in: ["wage_employment", "job_change"] },
      }).sort({ eventDate: -1 });
      if (latest) {
        await EmployerVerification.updateOne(
          { _id: v._id },
          { $set: { outcomeEventId: latest._id.toString() } }
        );
        if (latest.verifiedStatus === "not_required") {
          await OutcomeEvent.updateOne(
            { _id: latest._id },
            {
              $set: {
                verifiedStatus:
                  v.verificationStatus === "employer_unreachable"
                    ? "unreachable"
                    : v.verificationStatus,
              },
            }
          );
        }
      }
    }

    return Response.json({
      success: true,
      seeded: {
        trainees: okTrainees,
        details: await LearnerDetail.countDocuments(),
        consents: await ConsentRecord.countDocuments(),
        outcomes: await OutcomeEvent.countDocuments(),
        followUps: await FollowUp.countDocuments(),
        verifications: await EmployerVerification.countDocuments(),
        skillGaps: await SkillGapReport.countDocuments(),
        settings: !!settings,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Could not seed programme data",
      },
      { status: 500 }
    );
  }
}