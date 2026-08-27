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
    <Card className="border border-slate-200/90 bg-white shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/70 pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-950 font-sans">
              Batch Training Volume & Demand
            </CardTitle>
            <CardDescription className="text-xs font-normal text-slate-500 mt-0.5">
              Active vocational candidate capacity mapped to trade demand
            </CardDescription>
          </div>
          <Badge variant="default" className="bg-blue-100 text-blue-950 border-blue-200 font-bold text-[10px]">
            {view.length} Active Tracks
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3.5 pt-4">
        {view.map((c) => (
          <div key={c.course} className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 p-2.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="flex items-center gap-2 font-bold text-slate-950">
                {c.course}
                <Badge
                  variant={c.demand === 'High' ? 'destructive' : c.demand === 'Medium' ? 'warning' : 'neutral'}
                  className="font-bold text-[10px] px-1.5 py-0.2"
                >
                  {c.demand} Demand
                </Badge>
              </span>
              <span className="tabular-nums font-bold text-slate-900">
                {c.trainees.toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-slate-500">enrolled</span>
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
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-primary bg-card p-5 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                Trainees Enrolled
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shadow-2xs">
                <Users className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {compact(summary.totalTrainees)}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-100 px-1.5 py-0.5 text-[11px] font-bold text-blue-900">
                  <TrendingUp className="size-3 text-blue-700 stroke-[2.5]" />
                  Active Cohort
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-blue-900/80">
                {summary.totalTrainees.toLocaleString('en-IN')} across 96 affiliated centres
              </p>
            </div>
          </div>

          {/* Card 2: Certification Rate (Purple / Assessment Yield) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-violet-500/70 bg-card p-5 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-950">
                Certification Rate
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 shadow-2xs">
                <Award className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {summary.certificationRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-100 px-1.5 py-0.5 text-[11px] font-bold text-purple-900">
                  NSQF L4
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-purple-900/80">
                44,600 candidates certified via SSC assessment
              </p>
            </div>
          </div>

          {/* Card 3: Verified Placement (Emerald / Confirmed Outcomes) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-emerald-500/70 bg-card p-5 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                Verified Placement
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shadow-2xs">
                <Briefcase className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {summary.employmentRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-900">
                  <TrendingUp className="size-3 text-emerald-700 stroke-[2.5]" />
                  +3.1 pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-900/80">
                Employer-verified wage & job placement
              </p>
            </div>
          </div>

          {/* Card 4: 6-Month Retention (Amber / Longitudinal Stability) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-amber-500/70 bg-card p-5 shadow-soft transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                6-Month Retention
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shadow-2xs">
                <Repeat className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {summary.retentionRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">
                  +1.4 pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-amber-900/80">
                Verified sustained on-job stability
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SIGNATURE LONGITUDINAL OUTCOME PIPELINE OVERVIEW RIBBON                */}
        {/* ========================================================================= */}
        <section aria-label="Longitudinal Outcome Pipeline" className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Provider Trainee Progression Pipeline
                </span>
                <Badge variant="default" className="text-[10px] font-bold bg-blue-100 text-blue-950 border-blue-200">
                  MSSDS Verified
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Conversion and drop-off audits from batch enrolment through 6-month on-job retention
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950">
              <TrendingUp className="size-4 text-emerald-700" />
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
                      ? 'border-emerald-300 bg-emerald-50/50 shadow-2xs'
                      : idx >= 3
                      ? 'border-blue-200 bg-blue-50/30'
                      : 'border-slate-200 bg-slate-50/60'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      Stage 0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-bold',
                        isLast
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-slate-200/80 text-slate-700'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {stage.stage}
                    </p>
                    <p className="text-lg font-black text-slate-950 tabular-nums mt-0.5">
                      {compact(stage.value)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
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
        <Card className="border border-slate-200/90 bg-white shadow-xs rounded-xl">
          <CardContent className="flex flex-wrap items-end gap-4 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
              <Filter className="size-4 text-blue-700" aria-hidden="true" />
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
            <div className="ml-auto flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Active Scope:</span>
              <Badge variant="default" className="bg-blue-100 text-blue-900 border-blue-200">{district}</Badge>
              <Badge variant="default" className="bg-indigo-100 text-indigo-900 border-indigo-200">{course}</Badge>
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
        <section aria-label="Employer Verification Audit Queue" className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="size-4.5 text-blue-700" />
                <span className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Employer Placement & Verification Roster
                </span>
                <Badge variant="default" className="bg-emerald-100 text-emerald-950 border-emerald-200 text-[10px] font-bold">
                  Live Audit Feed
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Outcome claims submitted to hiring partners for wage and employment authentication
              </p>
            </div>

            <Link
              href="/employer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 shadow-2xs hover:bg-blue-100 transition-colors"
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
                    'flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition-all',
                    isVerified && 'border-emerald-200 bg-emerald-50/30 border-l-[4px] border-l-emerald-600',
                    isPending && 'border-amber-200 bg-amber-50/30 border-l-[4px] border-l-amber-600',
                    isFlagged && 'border-rose-200 bg-rose-50/30 border-l-[4px] border-l-rose-600'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-slate-500">
                        {item.id}
                      </span>
                      <Badge
                        variant={isVerified ? 'success' : isPending ? 'warning' : 'destructive'}
                        className="text-[10px] font-bold uppercase px-1.5 py-0.2"
                      >
                        {item.status}
                      </Badge>
                    </div>

                    <h4 className="mt-2 text-sm font-bold text-slate-950">
                      {item.trainee}
                    </h4>
                    <p className="text-xs font-medium text-slate-600">{item.course}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{item.provider}</p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                    <span className="font-bold text-slate-950 tabular-nums">
                      {inr(item.wage)}/mo
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
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
        <section aria-label="Provider Intelligence Advisory" className="rounded-xl border border-indigo-200/90 bg-indigo-50/40 p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-700 text-white shadow-2xs">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Provider Curriculum & Placement Intelligence
                </h3>
                <p className="text-xs text-slate-600">
                  AI-assisted actionable insights identifying skill demand surges and placement optimization recommendations
                </p>
              </div>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-900 shadow-2xs hover:bg-indigo-50 transition-colors"
            >
              <span>Explore All Insights</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-900 uppercase">
                      <Compass className="size-3 text-indigo-700" />
                      {insight.district}
                    </span>
                    <Badge
                      variant={insight.priority === 'High' ? 'destructive' : 'warning'}
                      className="text-[10px] font-bold px-1.5 py-0.2"
                    >
                      {insight.priority} Priority
                    </Badge>
                  </div>

                  <h4 className="mt-2 text-xs font-bold text-slate-950 leading-snug">
                    {insight.title}
                  </h4>

                  <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                    {insight.narrative}
                  </p>
                </div>

                <div className="mt-3.5 border-t border-slate-100 pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] font-semibold text-slate-800">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
                    <span><strong className="text-slate-950">Action:</strong> {insight.action}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span>Confidence Score</span>
                    <span className="text-indigo-900 font-extrabold">{insight.confidence}% Grounded</span>
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
