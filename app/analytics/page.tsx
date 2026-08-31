'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  GraduationCap,
  Award,
  Briefcase,
  Repeat,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Filter,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Users,
  Building2,
  Clock,
  ChevronRight,
  Compass,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SkillGapMatrix } from '@/components/analytics/skill-gap-matrix'
import { EmployerDemandChart } from '@/components/analytics/employer-demand-chart'
import { NonPlacementChart } from '@/components/analytics/non-placement-chart'
import { CoverageComparisonChart } from '@/components/analytics/coverage-comparison-chart'
import { OutcomeFunnel } from '@/components/dashboard/outcome-funnel'
import { WageProgressionChart } from '@/components/dashboard/wage-progression-chart'
import { CourseTable, ProviderTable } from '@/components/dashboard/performance-tables'
import {
  summary,
  inr,
  compact,
  districts,
  courses,
  coursePerformance,
  outcomeFunnel,
  employerVerifications,
  aiInsights,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-bold uppercase tracking-wider text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-44 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

function TrainingCoverageCard({ courseFilter }: { courseFilter: string }) {
  const rows =
    courseFilter === 'All Courses'
      ? coursePerformance
      : coursePerformance.filter((c) => c.course === courseFilter)
  const view = rows.length ? rows : coursePerformance
  const max = Math.max(...coursePerformance.map((x) => x.trainees))

  return (
    <Card className="border border-border bg-card shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border bg-muted/20 pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground font-sans">
              Batch Training Volume & Demand
            </CardTitle>
            <CardDescription className="text-xs font-normal text-muted-foreground mt-0.5">
              Active vocational candidate capacity mapped to trade demand
            </CardDescription>
          </div>
          <Badge variant="default" className="font-bold text-[10px]">
            {view.length} Active Tracks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5 pt-4">
        {view.map((c) => (
          <div key={c.course} className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-bold text-foreground">
                {c.course}
                <Badge
                  variant={c.demand === 'High' ? 'destructive' : c.demand === 'Medium' ? 'warning' : 'neutral'}
                  className="font-bold text-[10px] px-1.5 py-0.2"
                >
                  {c.demand} Demand
                </Badge>
              </span>
              <span className="tabular-nums font-bold text-foreground">
                {c.trainees.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-muted-foreground">enrolled</span>
              </span>
            </div>
            <Progress value={(c.trainees / max) * 100} indicatorClassName="bg-primary" className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [district, setDistrict] = useState(districts[0])
  const [course, setCourse] = useState(courses[0])

  const maxFunnel = outcomeFunnel[0].value
  const netYield = Math.round((outcomeFunnel[outcomeFunnel.length - 1].value / maxFunnel) * 100)

  return (
    <AppShell>
      <PageHeader
        eyebrow="TRAINING PROVIDER • PERFORMANCE & OUTCOMES"
        title="Training Performance & Placement Command Center"
        description="Monitor trainee progression from enrolment and certification through placement, employer verification, retention, and wage outcomes across your training programmes."
      />

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. TOP KPI RIBBON (4 Distinct Semantic Operational Metrics)               */}
        {/* ========================================================================= */}
        <section aria-label="Key Performance Indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Trainees Enrolled (Blue / Government Navy) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-primary bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Trainees Enrolled
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-2xs">
                <Users className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                  {compact(summary.totalTrainees)}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  <TrendingUp className="size-3 text-primary stroke-[2.5]" />
                  Active Cohort
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {summary.totalTrainees.toLocaleString('en-IN')} across 96 affiliated centres
              </p>
            </div>
          </div>

          {/* Card 2: Certification Rate (Purple / Assessment Yield) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-purple-500 bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Certification Rate
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-2xs">
                <Award className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                  {summary.certificationRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md border border-purple-500/20 bg-purple-500/10 px-1.5 py-0.5 text-[11px] font-bold text-purple-400">
                  NSQF L4
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                44,600 candidates certified via SSC assessment
              </p>
            </div>
          </div>

          {/* Card 3: Verified Placement (Emerald / Confirmed Outcomes) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-success bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Verified Placement
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-success/20 bg-success/10 text-success shadow-2xs">
                <Briefcase className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                  {summary.employmentRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md border border-success/20 bg-success/10 px-1.5 py-0.5 text-[11px] font-bold text-success">
                  <TrendingUp className="size-3 text-success stroke-[2.5]" />
                  +3.1 pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Employer-verified wage & job placement
              </p>
            </div>
          </div>

          {/* Card 4: 6-Month Retention (Amber / Longitudinal Stability) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-warning bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                6-Month Retention
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-warning/20 bg-warning/10 text-warning shadow-2xs">
                <Repeat className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground tabular-nums">
                  {summary.retentionRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md border border-warning/20 bg-warning/10 px-1.5 py-0.5 text-[11px] font-bold text-warning">
                  +1.4 pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Verified sustained on-job stability
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SIGNATURE LONGITUDINAL OUTCOME PIPELINE OVERVIEW RIBBON                */}
        {/* ========================================================================= */}
        <section aria-label="Longitudinal Outcome Pipeline" className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Provider Trainee Progression Pipeline
                </span>
                <Badge variant="default" className="text-[10px] font-bold">
                  MSSDS Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Conversion and drop-off audits from batch enrolment through 6-month on-job retention
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <TrendingUp className="size-4 text-success" />
              <span>Net Pipeline Yield: {netYield}%</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {outcomeFunnel.map((stage, idx) => {
              const isLast = idx === outcomeFunnel.length - 1
              const pct = Math.round((stage.value / maxFunnel) * 100)

              return (
                <div
                  key={stage.stage}
                  className={cn(
                    'relative flex flex-col justify-between rounded-lg border p-3.5 transition-all',
                    isLast
                      ? 'border-success/30 bg-success/10 shadow-2xs'
                      : idx >= 3
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border bg-muted/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      Stage 0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-bold',
                        isLast
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-bold text-foreground truncate">
                      {stage.stage}
                    </p>
                    <p className="text-lg font-black text-foreground tabular-nums mt-0.5">
                      {compact(stage.value)}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {stage.value.toLocaleString('en-IN')} candidates
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. DIAGNOSTIC FILTERS BAR                                                 */}
        {/* ========================================================================= */}
        <Card className="border border-border bg-card shadow-xs rounded-xl">
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Filter className="size-4 text-primary" aria-hidden="true" />
              <span>Diagnostic Filters</span>
            </div>
            <FilterSelect
              label="District Filter"
              value={district}
              options={districts}
              onChange={setDistrict}
            />
            <FilterSelect
              label="Vocational Trade / Course"
              value={course}
              options={courses}
              onChange={setCourse}
            />
            <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span>Active Scope:</span>
              <Badge variant="default">{district}</Badge>
              <Badge variant="default">{course}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 4. MAIN ANALYTICAL ROW 1: OUTCOME FUNNEL & WAGE PROGRESSION TRAJECTORY     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OutcomeFunnel />
          <WageProgressionChart />
        </section>

        {/* ========================================================================= */}
        {/* 5. SKILL GAP MATRIX & INDUSTRY DEMAND                                     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkillGapMatrix />
          <div className="flex flex-col gap-6">
            <EmployerDemandChart />
            <TrainingCoverageCard courseFilter={course} />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. OPERATIONAL ATTENTION: ROOT CAUSE DIAGNOSTICS & SKILL ALIGNMENT        */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CoverageComparisonChart courseFilter={course} />
          <NonPlacementChart />
        </section>

        {/* ========================================================================= */}
        {/* 7. EMPLOYER OUTCOME & VERIFICATION STATUS QUEUE                           */}
        {/* ========================================================================= */}
        <section aria-label="Employer Verification Audit Queue" className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4.5 text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Employer Placement & Verification Roster
                </span>
                <Badge variant="success" className="text-[10px] font-bold">
                  Live Audit Feed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Outcome claims submitted to hiring partners for wage and employment authentication
              </p>
            </div>

            <Link
              href="/employer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <span>View Employer Command Center</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {employerVerifications.map((item) => {
              const isVerified = item.status === 'verified'
              const isPending = item.status === 'pending'
              const isFlagged = item.status === 'flagged'

              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition-all bg-card',
                    isVerified && 'border-border border-l-[4px] border-l-success',
                    isPending && 'border-border border-l-[4px] border-l-warning',
                    isFlagged && 'border-border border-l-[4px] border-l-destructive'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground">
                        {item.id}
                      </span>
                      <Badge
                        variant={isVerified ? 'success' : isPending ? 'warning' : 'destructive'}
                        className="text-[10px] font-bold uppercase px-1.5 py-0.2"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-foreground">
                      {item.trainee}
                    </h4>
                    <p className="text-xs font-medium text-muted-foreground">{item.course}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground/80 mt-0.5">{item.provider}</p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                    <span className="font-bold text-foreground tabular-nums">
                      {inr(item.wage)}/mo
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Joined {item.joinDate}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. COURSE & PROVIDER PERFORMANCE BENCHMARKS                               */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseTable />
          <ProviderTable />
        </section>

        {/* ========================================================================= */}
        {/* 9. PROVIDER INTELLIGENCE & ACTIONABLE POLICY SIGNALS                      */}
        {/* ========================================================================= */}
        <section aria-label="Provider Intelligence Advisory" className="rounded-xl border border-primary/30 bg-primary/10 p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                  Provider Curriculum & Placement Intelligence
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI-assisted actionable insights identifying skill demand surges and placement optimization recommendations
                </p>
              </div>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-colors"
            >
              <span>Explore All Insights</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-2xs hover:border-primary/40 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                      <Compass className="size-3 text-primary" />
                      {insight.district}
                    </span>
                    <Badge
                      variant={insight.priority === 'High' ? 'destructive' : 'warning'}
                      className="text-[10px] font-bold px-1.5 py-0.2"
                    >
                      {insight.priority} Priority
                    </Badge>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-foreground leading-snug">
                    {insight.title}
                  </h4>

                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {insight.narrative}
                  </p>
                </div>

                <div className="mt-3.5 border-t border-border pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] font-semibold text-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                    <span><strong className="text-foreground">Action:</strong> {insight.action}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Confidence Score</span>
                    <span className="text-primary font-extrabold">{insight.confidence}% Grounded</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
