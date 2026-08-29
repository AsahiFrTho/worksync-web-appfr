// WorkSync — demonstration/mock data only.
// Realistic Maharashtra-focused figures for prototype presentation.
// No backend is connected; these values are illustrative. Kept in use by
// pages that haven't yet migrated to the live MongoDB compute engine
// (see lib/compute.ts) — the Government Executive Dashboard now reads
// real data instead of this file.

export const summary = {
  totalTrainees: 48250,
  employmentRate: 68.4, // %
  retentionRate: 74.2, // % retained at 6 months
  averageWage: 14850, // monthly INR
  wageGrowth: 12.6, // % YoY
  certificationRate: 81.3, // %
  activeDistricts: 12,
  activeProviders: 96,
}

// Enrolled -> Completed -> Certified -> Employed -> Retained
export const outcomeFunnel = [
  { stage: 'Enrolled', value: 48250 },
  { stage: 'Completed', value: 41800 },
  { stage: 'Certified', value: 39230 },
  { stage: 'Employed', value: 33020 },
  { stage: 'Retained', value: 24510 },
]

export const districtPerformance = [
  { district: 'Pune', trainees: 8420, employmentRate: 74, retentionRate: 79, avgWage: 16800 },
  { district: 'Mumbai Suburban', trainees: 7650, employmentRate: 71, retentionRate: 76, avgWage: 18200 },
  { district: 'Nagpur', trainees: 5210, employmentRate: 69, retentionRate: 73, avgWage: 14100 },
  { district: 'Nashik', trainees: 4380, employmentRate: 66, retentionRate: 71, avgWage: 13600 },
  { district: 'Aurangabad', trainees: 3980, employmentRate: 63, retentionRate: 68, avgWage: 12900 },
  { district: 'Thane', trainees: 4720, employmentRate: 70, retentionRate: 75, avgWage: 15400 },
  { district: 'Kolhapur', trainees: 3110, employmentRate: 64, retentionRate: 69, avgWage: 12500 },
  { district: 'Solapur', trainees: 2680, employmentRate: 59, retentionRate: 64, avgWage: 11800 },
  { district: 'Amravati', trainees: 2240, employmentRate: 57, retentionRate: 61, avgWage: 11200 },
  { district: 'Ratnagiri', trainees: 1860, employmentRate: 61, retentionRate: 66, avgWage: 12100 },
]

export const coursePerformance = [
  { course: 'Electrician', trainees: 6820, employmentRate: 72, avgWage: 15200, demand: 'High' as const },
  { course: 'CNC Machine Operator', trainees: 3140, employmentRate: 66, avgWage: 17400, demand: 'High' as const },
  { course: 'Solar PV Installer', trainees: 2280, employmentRate: 78, avgWage: 16100, demand: 'High' as const },
  { course: 'Welding & Fabrication', trainees: 4510, employmentRate: 70, avgWage: 14800, demand: 'Medium' as const },
  { course: 'Sewing Machine Operator', trainees: 5980, employmentRate: 64, avgWage: 11300, demand: 'Medium' as const },
  { course: 'Data Entry & Digital Tools', trainees: 4870, employmentRate: 61, avgWage: 12600, demand: 'Medium' as const },
  { course: 'Retail Sales Associate', trainees: 5320, employmentRate: 67, avgWage: 12900, demand: 'Medium' as const },
  { course: 'Automotive Service Tech', trainees: 3210, employmentRate: 69, avgWage: 14200, demand: 'High' as const },
  { course: 'Healthcare Assistant', trainees: 3980, employmentRate: 73, avgWage: 13800, demand: 'High' as const },
]

export const providerPerformance = [
  { provider: 'Maharashtra State Skill Dev. Society', trainees: 12400, placementRate: 71, rating: 4.4 },
  { provider: 'Yashaswi Skill Academy', trainees: 6820, placementRate: 74, rating: 4.5 },
  { provider: 'Sahyadri Vocational Institute', trainees: 5210, placementRate: 66, rating: 4.1 },
  { provider: 'Deccan Technical Centre', trainees: 4980, placementRate: 69, rating: 4.2 },
  { provider: 'Godavari Skilling Trust', trainees: 3860, placementRate: 62, rating: 3.9 },
  { provider: 'Konkan Industrial Training', trainees: 3240, placementRate: 64, rating: 4.0 },
]

export const followUpStatus = [
  { label: 'Verified employed', value: 33020, tone: 'success' as const },
  { label: 'Follow-up pending', value: 6120, tone: 'warning' as const },
  { label: 'Unreachable', value: 3410, tone: 'destructive' as const },
  { label: 'Opted out', value: 1700, tone: 'neutral' as const },
]

export const employmentTypeSplit = [
  { type: 'Wage employment', value: 21400 },
  { type: 'Self-employment', value: 7360 },
  { type: 'Apprenticeship', value: 4260 },
]

// 6-month wage progression (INR) after placement
export const wageProgression = [
  { month: 'Month 0', wage: 11800 },
  { month: 'Month 2', wage: 12600 },
  { month: 'Month 4', wage: 13500 },
  { month: 'Month 6', wage: 14850 },
  { month: 'Month 9', wage: 15900 },
  { month: 'Month 12', wage: 17200 },
]

// ---------- Task 5: Skill Gap & Non-placement Analytics ----------

export type Level = 'High' | 'Medium' | 'Low'

export const skillGaps: {
  skill: string
  demand: Level
  coverage: Level
  demandScore: number
  coverageScore: number
  gap: number
}[] = [
  { skill: 'CNC Operation', demand: 'High', coverage: 'Low', demandScore: 88, coverageScore: 34, gap: 54 },
  { skill: 'Solar Installation', demand: 'High', coverage: 'Low', demandScore: 84, coverageScore: 38, gap: 46 },
  { skill: 'Industrial Automation / PLC', demand: 'High', coverage: 'Low', demandScore: 79, coverageScore: 36, gap: 43 },
  { skill: 'EV Maintenance', demand: 'High', coverage: 'Low', demandScore: 76, coverageScore: 41, gap: 35 },
  { skill: 'Digital Tools', demand: 'Medium', coverage: 'Medium', demandScore: 64, coverageScore: 58, gap: 6 },
  { skill: 'Welding (Advanced)', demand: 'Medium', coverage: 'Medium', demandScore: 61, coverageScore: 55, gap: 6 },
  { skill: 'Healthcare Support', demand: 'High', coverage: 'Medium', demandScore: 72, coverageScore: 60, gap: 12 },
  { skill: 'Retail POS Systems', demand: 'Medium', coverage: 'High', demandScore: 52, coverageScore: 74, gap: -22 },
]

export const employerDemandedSkills = [
  { skill: 'CNC Operation', openings: 3120 },
  { skill: 'Solar Installation', openings: 2740 },
  { skill: 'Healthcare Support', openings: 2380 },
  { skill: 'Industrial Automation / PLC', openings: 1960 },
  { skill: 'EV Maintenance', openings: 1540 },
  { skill: 'Advanced Welding', openings: 1280 },
]

export const nonPlacementReasons = [
  { reason: 'Skill mismatch', value: 34 },
  { reason: 'Lack of practical experience', value: 27 },
  { reason: 'Location / transport', value: 16 },
  { reason: 'Salary expectations', value: 13 },
  { reason: 'Other', value: 10 },
]

export const courseToSkillComparison = [
  { course: 'Electrician', trainingCoverage: 82, employerDemand: 88 },
  { course: 'CNC Operator', trainingCoverage: 34, employerDemand: 90 },
  { course: 'Solar PV Installer', trainingCoverage: 38, employerDemand: 85 },
  { course: 'Digital Tools', trainingCoverage: 58, employerDemand: 64 },
  { course: 'Healthcare Assistant', trainingCoverage: 60, employerDemand: 76 },
  { course: 'Welding', trainingCoverage: 71, employerDemand: 68 },
]

export const districts = [
  'All Districts',
  'Pune',
  'Mumbai Suburban',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Thane',
]

export const courses = [
  'All Courses',
  'Electrician',
  'CNC Machine Operator',
  'Solar PV Installer',
  'Welding & Fabrication',
  'Healthcare Assistant',
  'Digital Tools',
]

// ---------- Task 6: AI-assisted Insights (demo/prototype) ----------

export type AiInsight = {
  id: string
  title: string
  narrative: string
  skillGap: string
  employerDemand: Level
  trainingCoverage: Level
  action: string
  confidence: number
  district: string
  priority: 'High' | 'Medium' | 'Low'
}

export const aiInsights: AiInsight[] = [
  {
    id: 'ai-1',
    title: 'Solar skills recur in Electrician non-placements (Pune)',
    narrative:
      'Solar installation appears repeatedly among non-placement responses for Electrician trainees in Pune. Employers cite it as a preferred add-on skill.',
    skillGap: 'Solar Installation',
    employerDemand: 'High',
    trainingCoverage: 'Low',
    action:
      'Consider adding introductory solar installation modules or employer-linked apprenticeships to the Electrician course in Pune.',
    confidence: 82,
    district: 'Pune',
    priority: 'High',
  },
  {
    id: 'ai-2',
    title: 'CNC demand outpaces training supply (Nagpur)',
    narrative:
      'Employer openings for CNC operation in Nagpur are ~3x the number of certified trainees, and skill mismatch is the top non-placement reason for the region.',
    skillGap: 'CNC Operation',
    employerDemand: 'High',
    trainingCoverage: 'Low',
    action:
      'Scale CNC Machine Operator batches and partner with local manufacturing units for on-machine practice.',
    confidence: 78,
    district: 'Nagpur',
    priority: 'High',
  },
  {
    id: 'ai-3',
    title: 'Practical experience gap in Healthcare Assistant track',
    narrative:
      'Lack of practical experience is the leading non-placement reason for Healthcare Assistant trainees across Nashik and Aurangabad, despite solid certification rates.',
    skillGap: 'Clinical Hands-on Practice',
    employerDemand: 'High',
    trainingCoverage: 'Medium',
    action:
      'Introduce mandatory supervised clinical rotations with district hospitals before certification.',
    confidence: 71,
    district: 'Nashik',
    priority: 'Medium',
  },
]

// ---------- Trainee Passport (for journey coherence) ----------

export const traineePassport = {
  id: 'MH-SKL-2023-0098421',
  name: 'Rahul Pawar',
  district: 'Pune',
  course: 'Electrician',
  provider: 'Yashaswi Skill Academy',
  photoInitials: 'RP',
  journey: [
    { step: 'Training', status: 'complete', date: 'Jan 2024', detail: '480 hrs completed' },
    { step: 'Certification', status: 'complete', date: 'Mar 2024', detail: 'NSQF Level 4 · Score 82%' },
    { step: 'Placement', status: 'complete', date: 'Apr 2024', detail: 'Placed via campus drive' },
    { step: 'Employment', status: 'complete', date: 'Apr 2024', detail: 'Wage employment · Verified' },
    { step: 'Wage Progression', status: 'active', date: 'Ongoing', detail: '₹11,800 → ₹14,850 (6 mo)' },
    { step: 'Retention', status: 'active', date: '6 mo', detail: 'Retained · follow-up on track' },
  ],
  skills: ['Wiring & Fittings', 'Circuit Diagnostics', 'Safety Compliance', 'Basic Digital Tools'],
  employer: 'Deccan Electricals Pvt. Ltd.',
}

// ---------- Employer Verification ----------

export const employerVerifications = [
  {
    id: 'EMP-2024-3341',
    trainee: 'Rahul Pawar',
    passportId: 'MH-SKL-2023-0098421',
    course: 'Electrician',
    provider: 'Yashaswi Skill Academy',
    status: 'verified' as const,
    joinDate: 'Apr 2024',
    wage: 14850,
  },
  {
    id: 'EMP-2024-3342',
    trainee: 'Sneha Kadam',
    passportId: 'MH-SKL-2023-0101233',
    course: 'Healthcare Assistant',
    provider: 'Sahyadri Vocational Institute',
    status: 'pending' as const,
    joinDate: 'May 2024',
    wage: 13800,
  },
  {
    id: 'EMP-2024-3343',
    trainee: 'Imran Shaikh',
    passportId: 'MH-SKL-2023-0100876',
    course: 'CNC Machine Operator',
    provider: 'Deccan Technical Centre',
    status: 'verified' as const,
    joinDate: 'Mar 2024',
    wage: 17400,
  },
  {
    id: 'EMP-2024-3344',
    trainee: 'Pooja Jadhav',
    passportId: 'MH-SKL-2023-0102910',
    course: 'Sewing Machine Operator',
    provider: 'Godavari Skilling Trust',
    status: 'flagged' as const,
    joinDate: 'May 2024',
    wage: 11300,
  },
]

export const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

export const compact = (n: number) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
