// Client-side demo data generator — mirrors the /api/seed/operations route
// so the operational modules (learners, follow-ups, verification, skill gaps,
// scorecard, data quality, settings) render fully populated even when no
// MongoDB server is available (hackathon / preview mode).
//
// Shape matches what /api/program-data returns (lib/types.ts).

import type {
  ProgramData,
  TraineeLite,
  LearnerDetail,
  ConsentRecord,
  OutcomeEvent,
  FollowUp,
  EmployerVerification,
  SkillGapReport,
  ProgramSettings,
} from "@/lib/types";

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

const PROVIDERS: Record<string, { name: string; district: string }> = {
  P1: { name: "Nashik Skill Academy", district: "Nashik" },
  P2: { name: "Vidarbha Training Institute", district: "Nagpur" },
  P3: { name: "Pune Kaushal Kendra", district: "Pune" },
};

const COURSES: Record<string, { name: string; durationHours: number }> = {
  C1: { name: "Retail Sales Associate", durationHours: 200 },
  C2: { name: "CNC Machine Operator", durationHours: 300 },
  C3: { name: "Digital Services Assistant", durationHours: 240 },
  C4: { name: "Self-Employed Tailor", durationHours: 180 },
};

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

const BLOCKS: Record<string, string[]> = {
  Nashik: ["Dindori", "Igatpuri", "Sinnar", "Niphad", "Nashik City"],
  Nagpur: ["Hingna", "Kamptee", "Umred", "Nagpur Rural", "Nagpur City"],
  Pune: ["Haveli", "Baramati", "Junnar", "Mulshi", "Pune City"],
};

interface OutcomeSpec {
  outcomeType: string;
  eventDate: string;
  employerName?: string;
  jobRole?: string;
  monthlyWage?: number;
  employmentType?: string;
  skillsUsed?: string[];
  relevanceToTraining?: string;
  verificationStatus?: string;
  selfEmploymentBusinessName?: string;
  selfEmploymentNature?: string;
  selfEmploymentIncome?: number;
  selfEmploymentSupport?: string;
  reasonCode?: string;
  notes?: string;
}

interface FollowUpSpec {
  offsetDays: number;
  status: "scheduled" | "completed";
  reason: string;
  attempts: number;
  notes?: string;
  channel?: string;
  employmentStatus?: string;
}

interface VerificationSpec {
  employer: string;
  role: string;
  wage: number;
  startDate: string;
  status: "verified" | "pending" | "partially_verified" | "rejected" | "employer_unreachable";
  remarks: string;
  confidence: number | null;
}

interface SkillGapSpec {
  skill: string;
  reportedBy: "employer" | "learner";
  severity: "high" | "medium" | "low";
  notes?: string;
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
  verification?: VerificationSpec;
  followUps?: FollowUpSpec[];
  skillGaps?: SkillGapSpec[];
}

const SPECS: LearnerSpec[] = [
  {
    name: "Snehal Jadhav", gender: "Female", category: "OBC", provider: "P1", batch: "RSA-N25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(17), employerName: "Vishal Mega Mart, Nashik", jobRole: "Sales Associate", monthlyWage: 11500, relevanceToTraining: "high", verificationStatus: "verified", employmentType: "Full-time", skillsUsed: ["Customer handling", "Sales skills"] },
      { outcomeType: "wage_update", eventDate: agoMonths(14), monthlyWage: 11800, notes: "Wage revision after 3 months" },
      { outcomeType: "wage_update", eventDate: agoMonths(11), monthlyWage: 12500, notes: "Wage revision after 6 months" },
      { outcomeType: "wage_update", eventDate: agoMonths(5), monthlyWage: 13800, notes: "Wage revision after 12 months" },
    ],
    verification: { employer: "Vishal Mega Mart, Nashik", role: "Sales Associate", wage: 11500, startDate: agoMonths(17), status: "verified", remarks: "HR confirmed role & wage on call.", confidence: 94 },
    followUps: [
      { offsetDays: -500, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Comfortable on shop floor." },
      { offsetDays: -60, status: "completed", reason: "12-month wage update", attempts: 1, notes: "Wage Rs13,800; considering senior sales exam." },
    ],
    skillGaps: [{ skill: "Digital payments", reportedBy: "employer", severity: "high", notes: "Struggles with UPI settlement reconciliation." }],
  },
  {
    name: "Kavita Wagh", gender: "Female", category: "ST", provider: "P1", batch: "RSA-N25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(16), employerName: "FirstCry Warehouse, Nashik", jobRole: "Inventory Assistant", monthlyWage: 12800, relevanceToTraining: "medium", verificationStatus: "pending", employmentType: "Full-time", skillsUsed: ["Data entry", "Tool handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(13), monthlyWage: 13100 },
      { outcomeType: "wage_update", eventDate: agoMonths(10), monthlyWage: 13400 },
      { outcomeType: "job_change", eventDate: agoMonths(4), employerName: "Amazon Delivery Partner", jobRole: "Ops Assistant", monthlyWage: 15200, reasonCode: "Better wage", notes: "Changed job: better wage", verificationStatus: "pending" },
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
      { outcomeType: "wage_employment", eventDate: agoMonths(11), employerName: "Sundaram Auto Components", jobRole: "CNC Operator", monthlyWage: 15500, relevanceToTraining: "high", verificationStatus: "partially_verified", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance", "Tool handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(8), monthlyWage: 16400 },
      { outcomeType: "wage_update", eventDate: agoMonths(5), monthlyWage: 17800 },
    ],
    verification: { employer: "Sundaram Auto Components", role: "CNC Operator", wage: 15500, startDate: agoMonths(11), status: "partially_verified", remarks: "Employer confirmed employment; wage not confirmed.", confidence: 62 },
    followUps: [
      { offsetDays: -330, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Machine handling confident now." },
      { offsetDays: -9, status: "completed", reason: "6-month wage update", attempts: 1, notes: "Employed at Sundaram Auto; wage Rs17,800 confirmed." },
    ],
    skillGaps: [{ skill: "Basic computer skills", reportedBy: "employer", severity: "medium", notes: "G-code editing needs supervision." }],
  },
  {
    name: "Dipti Sonawane", gender: "Female", category: "OBC", provider: "P1", batch: "CNC-N25A", consent: "r",
    notes: "Learner called in Jun 2026 and asked to stop outcome calls — consent revoked.",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(11), employerName: "Mahindra Tractors, Nashik", jobRole: "Quality Inspector", monthlyWage: 16000, relevanceToTraining: "high", verificationStatus: "pending", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(8), monthlyWage: 16800 },
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
      { outcomeType: "unemployed", eventDate: agoMonths(10), reasonCode: "No local opportunity", notes: "Willing to relocate to Pune if wage > Rs14,000." },
    ],
    followUps: [{ offsetDays: -12, status: "scheduled", reason: "3-month employment check — last status unemployed", attempts: 2, notes: "Two calls unanswered." }],
    skillGaps: [{ skill: "Machine operation", reportedBy: "learner", severity: "high", notes: "Only 2 weeks on live machine during training." }],
  },
  {
    name: "Rutuja Gaikwad", gender: "Female", category: "OBC", provider: "P1", batch: "Digi-N26A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(2), employerName: "CSC e-Gram Services, Nashik", jobRole: "Digital Services Operator", monthlyWage: 11000, relevanceToTraining: "high", verificationStatus: "verified", employmentType: "Full-time", skillsUsed: ["Digital payments", "Basic computer skills", "Data entry"] },
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
      { outcomeType: "wage_employment", eventDate: agoMonths(8), employerName: "Haldiram's, Nagpur", jobRole: "Counter Sales Executive", monthlyWage: 11800, relevanceToTraining: "high", verificationStatus: "verified", employmentType: "Full-time", skillsUsed: ["Customer handling", "Sales skills", "Digital payments"] },
      { outcomeType: "wage_update", eventDate: agoMonths(5), monthlyWage: 12400 },
      { outcomeType: "wage_update", eventDate: agoMonths(2), monthlyWage: 13100 },
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
      { outcomeType: "self_employment", eventDate: agoMonths(7), selfEmploymentBusinessName: "Maa Bhavani Tailoring Unit", selfEmploymentNature: "Stitching & alteration services", selfEmploymentIncome: 9500, selfEmploymentSupport: "Toolkit + Rs5,000 seed grant", skillsUsed: ["Tool handling", "Customer handling"] },
      { outcomeType: "wage_update", eventDate: agoMonths(1), selfEmploymentBusinessName: "Maa Bhavani Tailoring Unit", selfEmploymentIncome: 12800, notes: "Monthly income now Rs12,800" },
    ],
    followUps: [{ offsetDays: -14, status: "completed", reason: "Income update for tailoring unit", attempts: 2, notes: "Monthly income up to Rs12,800; new school uniform orders.", employmentStatus: "Self-employed" }],
    skillGaps: [{ skill: "Sales skills", reportedBy: "learner", severity: "medium", notes: "Wants help marketing on WhatsApp." }],
  },
  {
    name: "Omkar Shinde", gender: "Male", category: "OBC", provider: "P3", batch: "CNC-P25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(13), employerName: "Bajaj Auto Vendor Unit, Chakan", jobRole: "Machine Operator", monthlyWage: 16800, relevanceToTraining: "high", verificationStatus: "verified", employmentType: "Full-time", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(10), monthlyWage: 17600 },
      { outcomeType: "wage_update", eventDate: agoMonths(7), monthlyWage: 18800 },
      { outcomeType: "wage_update", eventDate: agoMonths(1), monthlyWage: 20500, notes: "Wage now Rs20,500; promoted to senior operator." },
    ],
    verification: { employer: "Bajaj Auto Vendor Unit, Chakan", role: "Machine Operator", wage: 16800, startDate: agoMonths(13), status: "verified", remarks: "HR confirmed role & wage on call.", confidence: 96 },
    followUps: [
      { offsetDays: -385, status: "completed", reason: "1-month check after placement", attempts: 1, notes: "Night shift initially, later moved to day." },
      { offsetDays: -20, status: "completed", reason: "12-month wage progression update", attempts: 1, notes: "Wage now Rs20,500; promoted to senior operator." },
    ],
    skillGaps: [{ skill: "Safety compliance", reportedBy: "employer", severity: "low", notes: "Refresher on new SOP needed." }],
  },
  {
    name: "Harshad Mulani", gender: "Male", category: "Open", provider: "P3", batch: "CNC-P25A", consent: "a",
    outcomes: [
      { outcomeType: "wage_employment", eventDate: agoMonths(12), employerName: "Godrej Interio Plant, Pune", jobRole: "Production Assistant", monthlyWage: 14200, relevanceToTraining: "medium", verificationStatus: "rejected", employmentType: "Contract", skillsUsed: ["Machine operation", "Safety compliance"] },
      { outcomeType: "wage_update", eventDate: agoMonths(9), monthlyWage: 14800 },
    ],
    verification: { employer: "Godrej Interio Plant, Pune", role: "Production Assistant", wage: 14200, startDate: agoMonths(12), status: "rejected", remarks: "Wage claimed (Rs19,000) not supported by payslip provided.", confidence: 20 },
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
      { outcomeType: "wage_employment", eventDate: agoMonths(5), employerName: "Web Werks Data Center", jobRole: "IT Support Trainee", monthlyWage: 13500, relevanceToTraining: "medium", verificationStatus: "partially_verified", employmentType: "Full-time", skillsUsed: ["Basic computer skills"] },
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

export function generateDemoData(): ProgramData {
  const trainees: TraineeLite[] = [];
  const details: LearnerDetail[] = [];
  const consents: ConsentRecord[] = [];
  const outcomes: OutcomeEvent[] = [];
  const followUps: FollowUp[] = [];
  const verifications: EmployerVerification[] = [];
  const skillGaps: SkillGapReport[] = [];
  let outcomeSeq = 0;

  SPECS.forEach((spec, i) => {
    const provider = PROVIDERS[spec.provider];
    const batch = BATCHES[spec.batch];
    const course = COURSES[batch.course];
    const block = BLOCKS[provider.district][i % BLOCKS[provider.district].length];
    const traineeId = `KS-2025-${String(1024 + i)}`;
    const enrStart = agoMonths(18, -(i % 3));
    const currentWage =
      spec.outcomes
        .filter((o) => o.outcomeType === "wage_employment" || o.outcomeType === "job_change")
        .reduce((max: number | undefined, o) => (o.monthlyWage != null ? Math.max(max ?? 0, o.monthlyWage) : max), undefined) ??
      spec.outcomes
        .filter((o) => o.outcomeType === "self_employment")
        .reduce((max: number | undefined, o) => (o.selfEmploymentIncome != null ? Math.max(max ?? 0, o.selfEmploymentIncome) : max), undefined) ??
      0;

    trainees.push({
      _id: `t-${traineeId}`,
      traineeId,
      name: spec.name,
      district: provider.district,
      course: course.name,
      status: spec.trainingStatus === "enrolled" ? "enrolled" : currentWage > 0 ? "employed" : "completed",
      monthlyWage: currentWage,
      trainingProvider: `${provider.name}, ${provider.district}`,
      trainingPeriod: {
        startDate: addMonths(enrStart, 1),
        endDate: addMonths(enrStart, 1 + Math.round(course.durationHours / 200)),
        hours: course.durationHours,
      },
      certificate: {
        certificateId: `MSD-2025-${String(1024 + i).padStart(5, "0")}`,
        issueDate: addMonths(enrStart, 3),
        nsqfLevel: 4,
        issuer: "NCVET / MSSDS",
      },
      createdAt: enrStart,
      updatedAt: enrStart,
    });

    details.push({
      _id: `d-${traineeId}`,
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
      updatedAt: enrStart,
    });

    const given = spec.consent === "a";
    const consentDate = given ? addDays(enrStart, 1) : "";
    consents.push({
      _id: `c-${traineeId}`,
      traineeId,
      consentStatus:
        spec.consent === "a" ? "active" : spec.consent === "r" ? "revoked" : spec.consent === "e" ? "expired" : "missing",
      consentDate: given ? consentDate : undefined,
      consentMethod: given ? ["Form", "In-person", "SMS", "Call"][i % 4] : undefined,
      consentPurpose: given ? ["Outcome tracking", "Employer verification", "Analytics"] : undefined,
      consentLastUpdated: given ? consentDate : spec.consent === "r" ? agoMonths(2, 5) : undefined,
    });

    spec.outcomes.forEach((o) => {
      outcomeSeq += 1;
      outcomes.push({
        _id: `oe-${outcomeSeq}`,
        traineeId,
        outcomeType: o.outcomeType as OutcomeEvent["outcomeType"],
        eventDate: o.eventDate,
        source: "Coordinator",
        tags: [],
        employerName: o.employerName,
        jobRole: o.jobRole,
        monthlyWage: o.monthlyWage,
        employmentType: o.employmentType,
        skillsUsed: o.skillsUsed,
        relevanceToTraining: o.relevanceToTraining as "high" | "medium" | "low" | undefined,
        selfEmploymentBusinessName: o.selfEmploymentBusinessName,
        selfEmploymentNature: o.selfEmploymentNature,
        selfEmploymentIncome: o.selfEmploymentIncome,
        selfEmploymentSupport: o.selfEmploymentSupport,
        reasonCode: o.reasonCode,
        notes: o.notes,
        verifiedStatus: o.verificationStatus as OutcomeEvent["verifiedStatus"],
      });
    });

    if (spec.verification) {
      verifications.push({
        _id: `v-${traineeId}`,
        traineeId,
        employerName: spec.verification.employer,
        jobRole: spec.verification.role,
        startDate: spec.verification.startDate,
        wage: spec.verification.wage,
        verificationStatus: spec.verification.status,
        verificationMethod: ["verified", "partially_verified"].includes(spec.verification.status)
          ? VERIFICATION_METHODS[i % VERIFICATION_METHODS.length]
          : "",
        verifierRemarks: spec.verification.remarks,
        confidenceScore: spec.verification.confidence ?? undefined,
        verifiedBy: spec.verification.status === "verified" ? "Arjun Pawar" : undefined,
        verifiedAt: spec.verification.status === "verified" ? ago(15 + i) : undefined,
        flagged: false,
      });
    }

    (spec.followUps || []).forEach((f) => {
      followUps.push({
        _id: `fu-${traineeId}-${f.offsetDays}`,
        traineeId,
        dueDate: addDays(TODAY, f.offsetDays),
        assignedTo: ["Sunita Wagh", "Rahul Kulkarni"][i % 2],
        channel: f.channel || "Call",
        status: f.status,
        contactAttemptCount: f.attempts,
        reason: f.reason,
        notes: f.notes || "",
        nextActionDate:
          f.status === "completed" ? undefined : addDays(TODAY, Math.max(f.offsetDays + 7, 3)),
        outcomeUpdated: f.status === "completed",
        completedAt: f.status === "completed" ? addDays(TODAY, f.offsetDays) : undefined,
        employmentStatus: f.employmentStatus || undefined,
      });
    });

    (spec.skillGaps || []).forEach((g) => {
      skillGaps.push({
        _id: `sg-${traineeId}-${g.skill}`,
        traineeId,
        courseId: batch.course,
        skillName: g.skill,
        reportedBy: g.reportedBy,
        severity: g.severity,
        notes: g.notes || "",
      });
    });
  });

  // Link verifications to the latest wage/job-change outcome for the learner
  verifications.forEach((v) => {
    const latest = outcomes
      .filter(
        (o) =>
          o.traineeId === v.traineeId &&
          ["wage_employment", "job_change"].includes(o.outcomeType)
      )
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0];
    if (latest) {
      v.outcomeEventId = latest._id;
    }
  });

  const settings: ProgramSettings = {
    _id: "settings-default",
    programName: "KaushalSetu \u2014 Skill Development Mission",
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
  };

  return { trainees, details, consents, outcomes, followUps, verifications, skillGaps, settings };
}