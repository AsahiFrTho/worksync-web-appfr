import Link from 'next/link'
import {
  Users,
  Briefcase,
  Repeat,
  IndianRupee,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
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
import { StatCard } from '@/components/stat-card'
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
          <StatCard
            label="Total Trainees Tracked"
            value={compact(summary.totalTrainees)}
            icon={Users}
            tone="blue"
            trend={{ value: '+8.2% YoY', direction: 'up' }}
            sublabel={`${summary.totalTrainees.toLocaleString('en-IN')} across ${summary.activeDistricts} active districts`}
          />
          <StatCard
            label="Verified Employment"
            value={`${summary.employmentRate}%`}
            icon={Briefcase}
            tone="emerald"
            trend={{ value: '+3.1 pts', direction: 'up' }}
            sublabel={`Certification rate: ${summary.certificationRate}% of enrolled`}
          />
          <StatCard
            label="6-Month Retention"
            value={`${summary.retentionRate}%`}
            icon={Repeat}
            tone="violet"
            trend={{ value: '+1.4 pts', direction: 'up' }}
            sublabel="Verified sustained on-job stability"
          />
          <StatCard
            label="Median Placed Wage"
            value={inr(summary.averageWage)}
            icon={IndianRupee}
            tone="amber"
            trend={{ value: `+${summary.wageGrowth}% YoY`, direction: 'up' }}
            sublabel="Starting ₹11.8k → ₹17.2k (12-Mo median)"
          />
        </section>

        {/* ========================================================================= */}
        {/* 2. SIGNATURE LONGITUDINAL OUTCOME PIPELINE OVERVIEW RIBBON                */}
        {/* ========================================================================= */}
        <section aria-label="Longitudinal Outcome Pipeline" className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Statewide Longitudinal Outcome Pipeline
                </span>
                <Badge variant="default" className="text-[10px]">
                  Audit Lifecycle
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cohort progression from vocational intake to sustained 6-month employment stability
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
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
                      ? 'border-success/30 bg-success/5 shadow-soft'
                      : idx >= 3
                      ? 'border-primary/25 bg-primary/5'
                      : 'border-border bg-muted/40'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Stage 0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1.5 py-0.5 text-[10px] font-bold',
                        isLast
                          ? 'bg-success/15 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {stage.stage}
                    </p>
                    <p className="text-lg font-bold text-foreground tabular-nums mt-0.5">
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Policy Signals & Programme Interventions
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI-assisted actionable insights identifying curriculum mismatches and scaling opportunities across districts
                </p>
              </div>
            </div>

            <Link
              href="/insights"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft transition-all duration-300 ease-premium hover:shadow-card-hover hover:border-primary/30"
            >
              <span>Explore All Policy Insights</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-soft transition-all duration-300 ease-premium hover:border-primary/30 hover:shadow-card-hover"
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

                  <h4 className="mt-2 text-xs font-semibold text-foreground leading-snug">
                    {insight.title}
                  </h4>

                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {insight.narrative}
                  </p>
                </div>

                <div className="mt-3.5 border-t border-border pt-3">
                  <div className="flex items-start gap-1.5 text-[11px] font-semibold text-foreground">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-700" />
                    <span><strong className="text-foreground">Action:</strong> {insight.action}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>Confidence Score</span>
                    <span className="font-bold text-primary">{insight.confidence}% Grounded</span>
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
