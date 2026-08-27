import Link from 'next/link'
import {
  Users,
  Briefcase,
  Repeat,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Activity,
  Layers,
  Compass,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OutcomeFunnel } from '@/components/dashboard/outcome-funnel'
import { WageProgressionChart } from '@/components/dashboard/wage-progression-chart'
import { EmploymentTypeChart } from '@/components/dashboard/employment-type-chart'
import {
  DistrictTable,
  CourseTable,
  ProviderTable,
} from '@/components/dashboard/performance-tables'
import {
  FollowUpStatus,
  SkillGapIndicators,
  NonPlacementReasonsCard,
} from '@/components/dashboard/signals'
import { summary, inr, compact, outcomeFunnel, aiInsights } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const maxFunnel = outcomeFunnel[0].value
  const netYield = Math.round((outcomeFunnel[outcomeFunnel.length - 1].value / maxFunnel) * 100)

  return (
    <AppShell>
      <PageHeader
        eyebrow="MSSDS • State Skilling Directorate"
        title="Skilling Outcomes & Policy Intelligence Command Center"
        description="Statewide longitudinal oversight monitoring Maharashtra vocational training programmes — from intake and NSQF certification through employer-verified employment, wage progression, and 6-month retention audits."
      />

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* ========================================================================= */}
        {/* 1. EXECUTIVE KPI RIBBON (4 High-Contrast Semantic Operational Metrics)    */}
        {/* ========================================================================= */}
        <section aria-label="Executive Key Performance Indicators" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Trainees (Blue / Government Navy) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-2 border-l-primary bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Total Trainees Tracked
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-primary">
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
                  +8.2% YoY
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-blue-900/80">
                {summary.totalTrainees.toLocaleString('en-IN')} across {summary.activeDistricts} active districts
              </p>
            </div>
          </div>

          {/* Card 2: Employment Rate (Emerald / Verified Placements) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Verified Employment
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-primary">
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
                Certification rate: {summary.certificationRate}% of enrolled
              </p>
            </div>
          </div>

          {/* Card 3: Retention Rate (Purple / Longitudinal Stability) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                6-Month Retention
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                <Repeat className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {summary.retentionRate}%
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-purple-100 px-1.5 py-0.5 text-[11px] font-bold text-purple-900">
                  <TrendingUp className="size-3 text-purple-700 stroke-[2.5]" />
                  +1.4 pts
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-purple-900/80">
                Verified sustained on-job stability
              </p>
            </div>
          </div>

          {/* Card 4: Average Placed Wage (Amber / Economic Progression) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 ease-in-out hover:bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Median Placed Wage
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                <IndianRupee className="size-4.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 tabular-nums">
                  {inr(summary.averageWage)}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-900">
                  <TrendingUp className="size-3 text-amber-700 stroke-[2.5]" />
                  +{summary.wageGrowth}% YoY
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-amber-900/80">
                Starting ₹11.8k → ₹17.2k (12-Mo median)
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. SIGNATURE LONGITUDINAL OUTCOME PIPELINE OVERVIEW RIBBON                */}
        {/* ========================================================================= */}
        <section aria-label="Longitudinal Outcome Pipeline" className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Statewide Longitudinal Outcome Pipeline
                </span>
                <Badge variant="default" className="text-[10px] font-bold bg-blue-100 text-blue-950 border-blue-200">
                  Audit Lifecycle
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cohort progression from vocational intake to sustained 6-month employment stability
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
        {/* 3. CORE ANALYTICAL ROW 1: OUTCOME FUNNEL & WAGE PROGRESSION TRAJECTORY     */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <OutcomeFunnel />
          <WageProgressionChart />
        </section>

        {/* ========================================================================= */}
        {/* 4. OPERATIONAL SIGNALS & ROOT CAUSE DIAGNOSTICS (Requires Attention)       */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <FollowUpStatus />
          <EmploymentTypeChart />
          <NonPlacementReasonsCard />
        </section>

        {/* ========================================================================= */}
        {/* 5. GEOGRAPHIC & SKILL GAP INTELLIGENCE                                    */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DistrictTable />
          </div>
          <SkillGapIndicators />
        </section>

        {/* ========================================================================= */}
        {/* 6. VOCATIONAL TRADE & TRAINING PROVIDER BENCHMARKS                         */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CourseTable />
          <ProviderTable />
        </section>

        {/* ========================================================================= */}
        {/* 7. ACTIONABLE POLICY SIGNALS & AI INTELLIGENCE ADVISORY STRIP             */}
        {/* ========================================================================= */}
        <section aria-label="Actionable Policy Insights" className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Policy Signals & Programme Interventions
                </h3>
                <p className="text-xs text-slate-600">
                  AI-assisted actionable insights identifying curriculum mismatches and scaling opportunities across districts
                </p>
              </div>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs font-bold text-indigo-900 shadow-2xs hover:bg-indigo-50 transition-colors"
            >
              <span>Explore All Policy Insights</span>
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
