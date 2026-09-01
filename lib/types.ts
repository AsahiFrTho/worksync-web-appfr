// Lean client-side shapes returned by the API routes that power the
// operational modules (learners, follow-ups, verification, skill gaps,
// scorecard, data quality, settings). These mirror the server models but
// are plain serializable objects.

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

export type OutcomeVerifiedStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "partially_verified"
  | "unreachable"
  | "not_required";

export type ConsentStatus = "active" | "expired" | "revoked" | "missing";

export type WorkflowStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "partially_verified"
  | "employer_unreachable";

export interface TraineeLite {
  _id: string;
  traineeId: string;
  name: string;
  district: string;
  course: string;
  status: string;
  monthlyWage?: number;
  trainingProvider?: string;
  trainingPeriod?: {
    startDate?: string;
    endDate?: string;
    hours?: number;
  };
  certificate?: {
    certificateId?: string;
    issueDate?: string;
    nsqfLevel?: number;
    issuer?: string;
    grade?: string;
  };
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LearnerDetail {
  _id?: string;
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
  updatedAt?: string;
}

export interface ConsentRecord {
  _id?: string;
  traineeId: string;
  consentStatus: ConsentStatus;
  consentDate?: string;
  consentMethod?: string;
  consentPurpose?: string[];
  consentLastUpdated?: string;
}

export interface OutcomeEvent {
  _id?: string;
  traineeId: string;
  outcomeType: OutcomeType;
  eventDate: string;
  source?: string;
  employerName?: string;
  jobRole?: string;
  employmentType?: string;
  monthlyWage?: number;
  skillsUsed?: string[];
  relevanceToTraining?: "high" | "medium" | "low";
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
  verifiedStatus?: OutcomeVerifiedStatus;
  tags?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowUp {
  _id?: string;
  traineeId: string;
  dueDate: string;
  assignedTo?: string;
  channel?: string;
  status: "scheduled" | "completed";
  contactAttemptCount?: number;
  reason?: string;
  notes?: string;
  nextActionDate?: string;
  outcomeUpdated?: boolean;
  employmentStatus?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployerVerification {
  _id?: string;
  outcomeEventId?: string;
  traineeId: string;
  employerName: string;
  jobRole?: string;
  startDate?: string;
  wage?: number;
  verificationStatus: WorkflowStatus;
  verificationMethod?: string;
  verifierRemarks?: string;
  confidenceScore?: number;
  verifiedBy?: string;
  verifiedAt?: string;
  flagged?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillGapReport {
  _id?: string;
  traineeId: string;
  courseId?: string;
  skillName: string;
  reportedBy: "employer" | "learner" | "course";
  severity: "high" | "medium" | "low";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationRules {
  followUpSameDay?: boolean;
  overdueDigest?: string;
  consentExpiryReminderDays?: number;
  channels?: string[];
}

export interface ProgramSettings {
  _id?: string;
  programName: string;
  districts: string[];
  reasonCodes: string[];
  skillTags: string[];
  consentPolicy: string;
  retentionPeriodMonths: number;
  notificationRules: NotificationRules;
}

export interface ProgramData {
  trainees: TraineeLite[];
  details: LearnerDetail[];
  consents: ConsentRecord[];
  outcomes: OutcomeEvent[];
  followUps: FollowUp[];
  verifications: EmployerVerification[];
  skillGaps: SkillGapReport[];
  settings: ProgramSettings | null;
}

// Merged learner view: a trainee joined with its optional operational
// detail and consent record — used by the compute engine and pages.
export interface MergedLearner extends TraineeLite {
  detail?: LearnerDetail;
  consent?: ConsentRecord;
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
  uniqueLearnerId?: string;
  consentStatus: ConsentStatus;
  consentDate?: string;
  consentMethod?: string;
  consentPurpose?: string[];
  consentLastUpdated?: string;
  trainingPeriodStart?: string;
  trainingPeriodEnd?: string;
}

// ── WorkSync Skill Gap Intelligence Engine Types ─────────────────────────────

export type SkillGapPriority = "Critical" | "High" | "Medium" | "Low";

export interface SkillGapIntelligenceItem {
  skill: string;
  demandScore: number;
  coverageScore: number;
  gapScore: number;
  priority: SkillGapPriority;
  candidatesAffected: number;
  highSeverityReports: number;
  mediumSeverityReports: number;
  lowSeverityReports: number;
  totalReports: number;
  topReportingCourse: string;
  topReportingDistrict: string;
  placementPenaltyPct: number;
  recommendedAction: string;
}

export interface CourseSkillGapProfile {
  course: string;
  traineesTracked: number;
  placedCount: number;
  placementRate: number;
  trainingCoverage: number;
  employerDemand: number;
  gap: number;
  topMissingSkills: string[];
  lowRelevancePlacedShare: number;
}

export interface DistrictSkillGapProfile {
  district: string;
  traineesTracked: number;
  gapReports: number;
  topSkillGap: string;
  priority: SkillGapPriority;
  affectedCandidates: number;
}

export interface InterventionSimulationResult {
  skillName: string;
  currentPlacementRate: number;
  projectedPlacementRate: number;
  liftPercentagePoints: number;
  additionalPlacedEstimated: number;
  affectedCandidates: number;
  targetCourses: string[];
  notes: string;
}

export interface BridgeModuleStructure {
  moduleNumber: number;
  title: string;
  durationHours: number;
  topics: string[];
}

export interface PolicyActionItem {
  step: string;
  title: string;
  description: string;
  owner: string;
  timeline: string;
}

export interface ClosedLoopMeasurementStep {
  phase: string;
  label: string;
  metric: string;
  currentValue: string;
  projectedValue: string;
}

export interface CurriculumActionPlan {
  skillName: string;
  targetCourse: string;
  priority: SkillGapPriority;
  demandScore: number;
  coverageScore: number;
  deficitScore: number;
  candidatesAffected: number;
  placementPenaltyPct: number;
  projectedPlacementRate: number;
  liftPercentagePoints: number;
  additionalPlacedEstimated: number;
  
  // Bridge module design
  moduleTitle: string;
  totalDurationHours: number;
  deliveryMode: string;
  prerequisites: string[];
  learningObjectives: string[];
  modules: BridgeModuleStructure[];
  practicalProject: string;
  assessmentMethod: string;
  successMetric: string;
  rationale: string;
  
  // Policy actions
  policyActions: PolicyActionItem[];
  
  // Closed-loop measurement
  closedLoopSteps: ClosedLoopMeasurementStep[];
  
  // Data Provenance tags
  provenance: {
    demandSource: string;
    coverageSource: string;
    deficitMetric: string;
    affectedCandidatesSource: string;
    simulationModel: string;
  };
}