import {
  Check,
  Clock,
  MapPin,
  GraduationCap,
  Building2,
  BadgeCheck,
  AlertTriangle,
  Award,
  ShieldCheck,
  Calendar,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  Sparkles,
  FileCheck2,
  ArrowRight,
  UserCheck,
  FileBadge,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { connectToDatabase } from '@/lib/mongodb'
import Trainee, { type ITrainee } from '@/models/trainee'
import EmploymentRecord, { type IEmploymentRecord } from '@/models/employment-record'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { CareerIntelligenceCard } from '@/components/trainee/career-intelligence-card'

const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

const relevanceLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral'; description: string }> = {
  directly_related: {
    label: 'Direct Trade Alignment',
    variant: 'success',
    description: 'Current job role matches certified trade curriculum.',
  },
  partially_related: {
    label: 'Partially Related',
    variant: 'warning',
    description: 'Job role utilizes adjacent technical & vocational skills.',
  },
  unrelated: {
    label: 'Unrelated Sector',
    variant: 'neutral',
    description: 'Job role operates outside certified trade specialization.',
  },
}

const milestoneLabels: Record<string, string> = {
  '30_day': '30-Day Retention Milestone',
  '90_day': '90-Day Retention Milestone',
  '180_day': '180-Day (6-Mo) Retention Audit',
  '365_day': '365-Day (1-Yr) Career Milestone',
}

const methodLabels: Record<string, string> = {
  employer_portal: 'Employer Direct Verification Portal',
  hr_call: 'HR Telephonic Verification Cell',
  offer_letter: 'Offer Letter & Joining Audit',
  payslip: 'Monthly Payslip Verification',
  pf_uan: 'EPFO / UAN Confirmation',
}

export default async function TraineePage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>
}) {
  const resolvedParams = searchParams ? await searchParams : {}
  const currentId = (resolvedParams.id || 'KP-0001').trim()

  let trainee: ITrainee | null = null
  let allTrainees: ITrainee[] = []
  let employmentRecord: IEmploymentRecord | null = null
  let dbError: string | null = null

  try {
    await connectToDatabase()

    allTrainees = (await Trainee.find().sort({ traineeId: 1 }).lean()) as ITrainee[]

    trainee = (await Trainee.findOne({
      traineeId: currentId,
    }).lean()) as ITrainee | null

    // Fallback to first trainee if requested id is not found
    if (!trainee && allTrainees.length > 0) {
      trainee = allTrainees[0]
    }

    if (trainee) {
      employmentRecord = (await EmploymentRecord.findOne({
        traineeId: trainee.traineeId,
        isCurrent: true,
      }).lean()) as IEmploymentRecord | null
    }
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Database connection failed'
  }

  if (dbError || !trainee) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Trainee Passport"
          title="Trainee Outcome Passport"
          description="A single, verifiable record that follows a trainee across the entire journey."
        />
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <AlertTriangle className="size-10 text-amber-700" />
              <p className="text-base font-bold text-slate-950">
                {dbError ? 'Database Connection Unavailable' : 'Trainee Record Not Found'}
              </p>
              <p className="max-w-md text-xs font-medium text-slate-600">
                {dbError || `No record found for trainee ID '${currentId}'. Please ensure database is seeded.`}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const isVerified = employmentRecord?.verificationStatus === 'verified'
  const isPendingVerification = employmentRecord?.verificationStatus === 'pending'
  const isDisputed =
    employmentRecord?.verificationStatus === 'disputed' ||
    employmentRecord?.verificationStatus === 'flagged'

  const relevanceInfo = employmentRecord?.trainingRelevance
    ? relevanceLabels[employmentRecord.trainingRelevance] || relevanceLabels.directly_related
    : null

  const formatMonthYear = (d?: Date | string) => {
    if (!d) return null
    const parsed = new Date(d)
    return isNaN(parsed.getTime())
      ? null
      : parsed.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  const formatFullDate = (d?: Date | string) => {
    if (!d) return null
    const parsed = new Date(d)
    return isNaN(parsed.getTime())
      ? null
      : parsed.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
  }

  const formattedStartDate = employmentRecord?.startDate
    ? formatMonthYear(employmentRecord.startDate) || 'Recent'
    : 'Recent'

  const trainingStart = formatMonthYear(trainee.trainingPeriod?.startDate)
  const trainingEnd = formatMonthYear(trainee.trainingPeriod?.endDate)
  const trainingHours = trainee.trainingPeriod?.hours

  const formattedTrainingPeriod =
    trainingStart && trainingEnd
      ? `${trainingStart} – ${trainingEnd}${trainingHours ? ` · ${trainingHours} hrs` : ''}`
      : trainingHours
      ? `${trainingHours} hrs completed`
      : 'Training completed'

  const formattedCertDate = trainee.certificate?.issueDate
    ? formatFullDate(trainee.certificate.issueDate)
    : null

  const providerName = trainee.trainingProvider || 'Maharashtra State Skill Development Society'

  // Verification metadata
  const verifiedAtStr = formatFullDate(employmentRecord?.verificationMetadata?.verifiedAt)
  const verificationMethod = employmentRecord?.verificationMetadata?.method
  const methodLabel = verificationMethod
    ? methodLabels[verificationMethod] || verificationMethod.replace(/_/g, ' ')
    : 'Employer Portal Verification'
  const verifiedByStr = employmentRecord?.verificationMetadata?.verifiedBy
  const employerRemarks = employmentRecord?.verificationMetadata?.remarks
  const disputeReasonStr = employmentRecord?.verificationMetadata?.disputeReason

  // Follow-up retention and wage progression calculations
  const followUps = Array.isArray(employmentRecord?.followUps) ? employmentRecord.followUps : []
  const startingWage = employmentRecord?.monthlyWage || 0
  const completedFollowUps = followUps.filter((f) => f.status === 'retained' && f.currentWage)
  const latestFollowUpWithWage =
    completedFollowUps.length > 0 ? completedFollowUps[completedFollowUps.length - 1] : null
  const latestWage = latestFollowUpWithWage?.currentWage || startingWage
  const wageDiff = latestWage - startingWage
  const wageGrowthPct =
    startingWage > 0 ? ((wageDiff / startingWage) * 100).toFixed(1) : '0'

  // 5-Stage Longitudinal Journey Definition
  const journey = [
    {
      step: 'Training Completed',
      subtitle: 'Vocational Curriculum',
      date: trainingEnd || 'Completed',
      detail: `${trainee.course} · ${providerName}`,
      subDetail: `${formattedTrainingPeriod}`,
      status: 'complete' as const,
      stageNumber: '01',
    },
    {
      step: 'NSQF Certification',
      subtitle: 'Government Assessed',
      date: formattedCertDate || 'Certified',
      detail: trainee.certificate?.certificateId
        ? `NSQF Level ${trainee.certificate.nsqfLevel || 4} · ${trainee.certificate.certificateId}`
        : 'NSQF Level 4 Qualification Certified',
      subDetail: `Issued by ${trainee.certificate?.issuer || 'NCVET'}${trainee.certificate?.grade ? ` · Grade: ${trainee.certificate.grade}` : ''}`,
      status: 'complete' as const,
      stageNumber: '02',
    },
    {
      step: 'Industry Placement',
      subtitle: 'Campus / Direct Hire',
      date: employmentRecord ? formattedStartDate : 'Pending',
      detail: employmentRecord
        ? `${employmentRecord.employerName} · ${employmentRecord.jobRole}`
        : 'Awaiting placement confirmation',
      subDetail: employmentRecord
        ? `Placement District: ${employmentRecord.district || trainee.district} · ${employmentRecord.employmentType?.replace(/_/g, ' ')}`
        : 'Placement cell active',
      status: employmentRecord ? ('complete' as const) : ('pending' as const),
      stageNumber: '03',
    },
    {
      step: 'Employer Verification',
      subtitle: 'Outcome Confirmation',
      date: isVerified
        ? verifiedAtStr || 'Confirmed'
        : isDisputed
        ? 'Disputed'
        : isPendingVerification
        ? 'In Review'
        : 'Upcoming',
      detail: isVerified
        ? `Confirmed by ${verifiedByStr || 'Employer HR'} via ${methodLabel}`
        : isPendingVerification
        ? 'Pending employer confirmation in verification queue'
        : isDisputed
        ? `Verification Flagged: ${disputeReasonStr || 'Disputed by employer'}`
        : 'Verification not initiated',
      subDetail: isVerified && employerRemarks ? `"${employerRemarks}"` : undefined,
      status: isVerified ? ('complete' as const) : ('pending' as const),
      stageNumber: '04',
    },
    {
      step: 'Retention & Wage Growth',
      subtitle: 'Longitudinal Tracking',
      date: employmentRecord ? 'Active Audit' : 'Upcoming',
      detail: employmentRecord
        ? `Current Verified Wage: ${inr(latestWage)}/mo`
        : 'Retention tracking initiates upon placement',
      subDetail:
        wageDiff > 0
          ? `+${inr(wageDiff)} monthly increment (+${wageGrowthPct}% growth from joining)`
          : 'Baseline entry wage recorded',
      status: isVerified ? ('complete' as const) : ('pending' as const),
      stageNumber: '05',
    },
  ]

  const t = {
    photoInitials: trainee.name
      .split(' ')
      .map((part: string) => part[0])
      .join(''),
    name: trainee.name,
    id: trainee.traineeId,
    district: trainee.district,
    course: trainee.course,
    provider: providerName,
    trainingPeriodStr: formattedTrainingPeriod,
    journey,
    skills: Array.isArray(trainee.skills) && trainee.skills.length > 0 ? trainee.skills : [],
    certificate: trainee.certificate,
    employer: employmentRecord ? employmentRecord.employerName : 'Not placed yet',
    jobRole: employmentRecord?.jobRole,
    wage: latestWage,
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Trainee Passport"
        title="Verifiable Digital Outcome Passport"
        description="A single, government-verified credential following a trainee across the full longitudinal trajectory — training, NSQF certification, employer verification, 30/90/180-day retention, and wage progression."
      />

      {/* Expanded Desktop Canvas Container (1180–1240px wide for optimal visual pacing) */}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Candidate Switcher (Demo Sandboxing) */}
        {allTrainees.length > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <UserCheck className="size-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Demonstration Passport Selector:
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {allTrainees.map((tr) => {
                const active = tr.traineeId === trainee.traineeId
                return (
                  <Link
                    key={tr.traineeId}
                    href={`/trainee?id=${tr.traineeId}`}
                    className={cn(
                      'rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs',
                      active
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <span>{tr.name}</span>
                    <span className={cn('ml-1.5 font-mono text-[11px]', active ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      ({tr.traineeId})
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* 1. WHO IS THIS PERSON? — Official Digital Passport Identity Card */}
        <Card className="overflow-hidden border border-border bg-card shadow-xs">
          {/* Official Header Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span className="font-bold tracking-wider text-foreground uppercase text-[10px] sm:text-xs">
                Government of Maharashtra • Department of Skills, Employment & Innovation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded border border-border">
                OFFICIAL RECORD REF: MSSDS/KP/{t.id}
              </span>
            </div>
          </div>

          <CardContent className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity Profile Group */}
            <div className="flex items-start sm:items-center gap-4.5 min-w-0 flex-1">
              <div className="relative flex size-18 sm:size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-2xl font-black text-primary-foreground shadow-sm border-2 border-border ring-2 ring-primary/20">
                <span>{t.photoInitials}</span>
                <span
                  className="absolute -bottom-1.5 -right-1.5 flex size-6.5 items-center justify-center rounded-full bg-success text-success-foreground ring-2 ring-card shadow-2xs"
                  title="NSQF Level 4 Certified"
                >
                  <Check className="size-4 stroke-[3]" />
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                    {t.name}
                  </h2>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/25">
                    {t.id}
                  </span>
                </div>

                {/* Primary Outcome Status Hero */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {isVerified ? (
                    <Badge variant="success" className="text-xs px-2.5 py-1 font-bold shadow-2xs">
                      <BadgeCheck className="size-3.5 mr-1 text-success" aria-hidden="true" />
                      <span>Verified Employment Outcome</span>
                    </Badge>
                  ) : isPendingVerification ? (
                    <Badge variant="warning" className="text-xs px-2.5 py-1 font-bold shadow-2xs">
                      <Clock className="size-3.5 mr-1 text-warning" aria-hidden="true" />
                      <span>Employment Verification Pending</span>
                    </Badge>
                  ) : isDisputed ? (
                    <Badge variant="destructive" className="text-xs px-2.5 py-1 font-bold shadow-2xs">
                      <AlertTriangle className="size-3.5 mr-1 text-destructive" aria-hidden="true" />
                      <span>Verification Flagged / Disputed</span>
                    </Badge>
                  ) : (
                    <Badge variant="neutral" className="text-xs px-2.5 py-1 font-bold">
                      Training Completed
                    </Badge>
                  )}

                  {relevanceInfo && (
                    <Badge variant={relevanceInfo.variant} className="text-xs px-2.5 py-1 font-bold shadow-2xs">
                      {relevanceInfo.label}
                    </Badge>
                  )}
                </div>

                {/* Metadata Strip */}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-foreground font-semibold">{t.district} District</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-foreground font-semibold">{t.course}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-primary shrink-0" aria-hidden="true" />
                    <span className="truncate">{t.provider}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="size-3.5 text-muted-foreground/70 shrink-0" aria-hidden="true" />
                    <span>{t.trainingPeriodStr}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Outcome Status Badge Box */}
            {employmentRecord && (
              <div className="flex shrink-0 flex-col justify-center rounded-xl border border-border bg-muted/30 p-4 text-left lg:text-right lg:min-w-[220px] shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current Verified Wage
                </span>
                <span className="mt-0.5 text-2xl sm:text-3xl font-black tracking-tight text-foreground tabular-nums">
                  {inr(latestWage)}<span className="text-xs font-semibold text-muted-foreground">/mo</span>
                </span>
                <span className="mt-0.5 text-xs font-semibold text-muted-foreground truncate">
                  {employmentRecord.employerName}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2-COLUMN BALANCED COMMAND GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT COLUMN: PRIMARY LONGITUDINAL TRAJECTORY (7 of 12 Columns) */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* 2. SIGNATURE LONGITUDINAL OUTCOME JOURNEY */}
            <Card className="overflow-hidden border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border bg-muted/20 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-primary shadow-xs">
                      <Layers className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                        Longitudinal Outcome Journey
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Training → Certification → Placement → Verification → Retention & Wage Growth
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="default" className="text-[11px] font-bold shrink-0">
                    5-Stage Audit Trail
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                <ol className="relative flex flex-col gap-5">
                  {t.journey.map((j, i) => {
                    const done = j.status === 'complete'
                    const isLast = i === t.journey.length - 1
                    return (
                      <li key={j.step} className="relative flex items-start gap-4">
                        {/* Connecting Line Track */}
                        {!isLast ? (
                          <span
                            className={cn(
                              'absolute left-[16px] top-9 h-[calc(100%+6px)] w-0.5 rounded-full transition-colors',
                              done ? 'bg-success' : 'bg-muted',
                            )}
                            aria-hidden="true"
                          />
                        ) : null}

                        {/* Milestone Node Badge */}
                        <div
                          className={cn(
                            'z-10 flex size-8.5 shrink-0 items-center justify-center rounded-full border shadow-2xs font-bold text-xs transition-transform duration-200',
                            done
                              ? 'border-success bg-success text-success-foreground ring-4 ring-success/20'
                              : 'border-warning bg-warning text-warning-foreground ring-4 ring-warning/20',
                          )}
                        >
                          {done ? (
                            <Check className="size-4.5 stroke-[3]" aria-hidden="true" />
                          ) : (
                            <Clock className="size-4 stroke-[2.5]" aria-hidden="true" />
                          )}
                        </div>

                        {/* Milestone Detailed Box */}
                        <div className="flex flex-1 flex-col gap-1 rounded-xl border border-border bg-muted/20 p-4 text-xs shadow-2xs transition-colors hover:border-border/80">
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">
                                {j.step}
                              </span>
                              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                                STAGE {j.stageNumber}
                              </span>
                            </div>
                            <span className="font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 shadow-2xs">
                              {j.date}
                            </span>
                          </div>

                          <p className="font-semibold text-foreground text-xs sm:text-[13px] leading-normal pt-0.5">
                            {j.detail}
                          </p>

                          {j.subDetail && (
                            <p className="text-xs font-medium text-muted-foreground leading-normal">
                              {j.subDetail}
                            </p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </CardContent>
            </Card>

            {/* 3. POST-PLACEMENT RETENTION & WAGE PROGRESSION */}
            <Card className="overflow-hidden border border-border bg-card shadow-xs">
              <CardHeader className="border-b border-border bg-muted/20 px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success/20 text-success shadow-xs">
                      <TrendingUp className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                        Post-Placement Retention & Wage Progression
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Longitudinal on-job retention audits at 30, 90, 180, and 365 days
                      </CardDescription>
                    </div>
                  </div>

                  {/* Wage Progression Indicator */}
                  {startingWage > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs shadow-2xs">
                      <span className="font-bold text-muted-foreground">Wage Delta:</span>
                      {wageDiff > 0 ? (
                        <div className="flex items-center gap-1.5 font-bold text-success">
                          <span>{inr(startingWage)}</span>
                          <span>→</span>
                          <span>{inr(latestWage)}</span>
                          <Badge variant="success" className="text-[10px] py-0 px-1.5 font-bold">
                            +{inr(wageDiff)} (+{wageGrowthPct}%)
                          </Badge>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">{inr(startingWage)}/mo</span>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                {followUps.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {followUps.map((f, idx) => {
                      const isRetained = f.status === 'retained' || f.status === 'wage_increased'
                      const isLeft = f.status === 'left_job'
                      const isPending = f.status === 'pending'
                      const completedDateStr = formatMonthYear(f.completedDate)
                      const dueDateStr = formatMonthYear(f.dueDate)

                      return (
                        <div
                          key={f.milestone || idx}
                          className={cn(
                            'flex flex-col justify-between rounded-xl border p-4 text-xs transition-all shadow-2xs',
                            isRetained
                              ? 'border-success/30 bg-success/10 text-foreground hover:border-success/40 hover:shadow-xs'
                              : isLeft
                              ? 'border-destructive/30 bg-destructive/10 text-foreground hover:border-destructive/40 hover:shadow-xs'
                              : 'border-border bg-muted/20 text-foreground hover:border-border/80',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                              {milestoneLabels[f.milestone] || f.milestone.replace(/_/g, ' ')}
                            </span>
                            {isRetained ? (
                              <Badge variant="success" className="text-[10px] py-0.5 font-bold">
                                <CheckCircle2 className="size-3 mr-1 text-success" /> Retained
                              </Badge>
                            ) : isLeft ? (
                              <Badge variant="destructive" className="text-[10px] py-0.5 font-bold">
                                <XCircle className="size-3 mr-1 text-destructive" /> Discontinued
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] py-0.5 font-bold">
                                <Clock className="size-3 mr-1 text-muted-foreground" /> Scheduled
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 text-muted-foreground font-medium mt-1 border-t border-border/80 pt-2.5">
                            {isRetained && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground font-semibold">Verified Wage:</span>
                                  <span className="font-bold text-foreground tabular-nums">
                                    {f.currentWage ? `${inr(f.currentWage)}/mo` : `${inr(startingWage)}/mo`}
                                  </span>
                                </div>
                                {completedDateStr && (
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Audit Date:</span>
                                    <span className="font-semibold text-foreground">{completedDateStr}</span>
                                  </div>
                                )}
                                {f.notes && (
                                  <p className="mt-1 text-[11px] text-foreground italic bg-background/60 p-2 rounded border border-success/25">
                                    &ldquo;{f.notes}&rdquo;
                                  </p>
                                )}
                              </>
                            )}

                            {isLeft && (
                              <>
                                <p className="text-destructive text-[11px] font-bold">
                                  {f.notes || 'Candidate did not join or left role'}
                                </p>
                                {dueDateStr && (
                                  <span className="text-[11px] text-muted-foreground">Milestone audit: {dueDateStr}</span>
                                )}
                              </>
                            )}

                            {isPending && (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Audit Status:</span>
                                  <span className="text-foreground font-bold">Scheduled Follow-up</span>
                                </div>
                                {dueDateStr && (
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-muted-foreground">Target Due Date:</span>
                                    <span className="font-semibold text-foreground">{dueDateStr}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 text-center text-xs font-semibold text-muted-foreground">
                    <p>Post-placement retention tracking activates upon employer verification.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. AI CAREER INTELLIGENCE (Decision Support) */}
            <CareerIntelligenceCard traineeId={trainee.traineeId} />
          </div>

          {/* RIGHT COLUMN: COHESIVE EVIDENCE & CREDENTIALS DOSSIER (5 of 12 Columns) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            {/* Unified Government Verified Evidence Dossier Card (Reduces "card wall" effect) */}
            <Card className="overflow-hidden border border-border bg-card shadow-xs">
              {/* Dossier Header */}
              <CardHeader className="border-b border-border bg-muted/20 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-primary shadow-xs">
                      <FileBadge className="size-4.5" />
                    </span>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground">
                        Verified Evidence Dossier
                      </CardTitle>
                      <CardDescription className="text-xs font-medium text-muted-foreground">
                        Official credentials, skill assessments & employer records
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px] font-bold">
                    Official Evidence
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="divide-y divide-border p-0">
                {/* Dossier Section 1: Qualification Certificate */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <FileCheck2 className="size-4 text-success" />
                      <span>NSQF Qualification Certificate</span>
                    </span>
                    {t.certificate?.grade && (
                      <Badge variant="success" className="text-[11px] font-bold">
                        Grade {t.certificate.grade}
                      </Badge>
                    )}
                  </div>

                  {t.certificate?.certificateId ? (
                    <div className="flex flex-col gap-2 rounded-lg bg-muted/30 p-3 text-xs border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-semibold">Certificate ID:</span>
                        <span className="font-mono font-bold text-primary">{t.certificate.certificateId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-semibold">Framework Level:</span>
                        <span className="font-bold text-foreground">NSQF Level {t.certificate.nsqfLevel || 4}</span>
                      </div>
                      {t.certificate.issuer && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-semibold">Awarding Body:</span>
                          <span className="font-bold text-foreground">{t.certificate.issuer}</span>
                        </div>
                      )}
                      {formattedCertDate && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground font-semibold">Issue Date:</span>
                          <span className="font-semibold text-foreground">{formattedCertDate}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">Certificate information pending issuance.</p>
                  )}
                </div>

                {/* Dossier Section 2: Certified Competencies */}
                <div className="p-5">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    <Award className="size-4 text-primary" />
                    <span>Certified Competencies</span>
                  </span>
                  {t.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {t.skills.map((s: string) => (
                        <Badge key={s} variant="neutral" className="px-2.5 py-1 text-xs font-bold shadow-2xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-medium text-muted-foreground">No certified skills listed.</p>
                  )}
                </div>

                {/* Dossier Section 3: Employer Placement & Trade Alignment */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Briefcase className="size-4 text-primary" />
                      <span>Current Employer Placement</span>
                    </span>
                    {isVerified && (
                      <Badge variant="success" className="text-[10px] font-bold">
                        <Check className="size-3 mr-0.5" /> Verified
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3 border border-border">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <Building2 className="size-5" aria-hidden="true" />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="text-sm font-bold text-foreground">{t.employer}</p>
                      {t.jobRole && (
                        <p className="text-xs font-semibold text-muted-foreground">{t.jobRole}</p>
                      )}
                      {relevanceInfo && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Badge variant={relevanceInfo.variant} className="text-[11px] font-bold">
                            {relevanceInfo.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dossier Section 4: Employer Verification Evidence Audit Box */}
                {employmentRecord && (
                  <div className="p-5">
                    <div
                      className={cn(
                        'flex flex-col gap-2.5 rounded-xl border p-4 text-xs shadow-2xs',
                        isVerified
                          ? 'border-success/30 bg-success/10 text-foreground'
                          : isDisputed
                          ? 'border-destructive/30 bg-destructive/10 text-foreground'
                          : 'border-warning/30 bg-warning/10 text-foreground',
                      )}
                    >
                      <div className="flex items-center justify-between border-b border-border/80 pb-2">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          {isVerified ? (
                            <>
                              <BadgeCheck className="size-4 text-success" />
                              <span>Employer Verification Evidence</span>
                            </>
                          ) : isDisputed ? (
                            <>
                              <AlertTriangle className="size-4 text-destructive" />
                              <span>Verification Disputed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="size-4 text-warning" />
                              <span>Verification In Progress</span>
                            </>
                          )}
                        </span>
                        {isVerified ? (
                          <Badge variant="success" className="text-[10px] py-0 font-bold">
                            Confirmed
                          </Badge>
                        ) : isDisputed ? (
                          <Badge variant="destructive" className="text-[10px] py-0 font-bold">
                            Disputed
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px] py-0 font-bold">
                            Pending
                          </Badge>
                        )}
                      </div>

                      {isVerified && (
                        <div className="flex flex-col gap-1.5 text-muted-foreground font-medium">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Verified By:</span>
                            <span className="font-bold text-foreground">{verifiedByStr || 'Employer HR'}</span>
                          </div>
                          {verifiedAtStr && (
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">Verified On:</span>
                              <span className="font-bold text-foreground">{verifiedAtStr}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">Audit Channel:</span>
                            <span className="font-bold text-foreground">{methodLabel}</span>
                          </div>
                          {employerRemarks && (
                            <div className="mt-1.5 rounded-lg bg-background/60 p-2.5 text-[11px] font-medium text-foreground italic border border-success/20">
                              &ldquo;{employerRemarks}&rdquo;
                            </div>
                          )}
                        </div>
                      )}

                      {isDisputed && (
                        <div className="flex flex-col gap-1.5 text-muted-foreground font-medium">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-destructive">Dispute Reason:</span>
                            <span className="font-semibold text-foreground">
                              {disputeReasonStr || 'Trainee did not join on scheduled date'}
                            </span>
                          </div>
                          {employerRemarks && (
                            <div className="mt-1.5 rounded-lg bg-background/60 p-2.5 text-[11px] font-medium text-foreground italic border border-destructive/20">
                              &ldquo;{employerRemarks}&rdquo;
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-muted-foreground">Channel:</span>
                            <span className="font-bold text-foreground">{methodLabel}</span>
                          </div>
                        </div>
                      )}

                      {isPendingVerification && (
                        <div className="flex flex-col gap-1.5 text-muted-foreground font-medium">
                          <p className="text-[11px] text-muted-foreground leading-normal">
                            Awaiting confirmation on the employer verification queue.
                          </p>
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-muted-foreground">Channel:</span>
                            <span className="font-bold text-foreground">{methodLabel}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
