import { Info, Sparkles, Compass, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InsightCard } from '@/components/insights/insight-card'
import { aiInsights } from '@/lib/mock-data'

export default function InsightsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="MSSDS • State Skilling Intelligence"
        title="AI-Assisted Programme & Policy Insights"
        description="A preview of the predictive intelligence layer: correlating longitudinal trainee outcomes, non-placement root causes, and live employer demand to recommend high-impact curriculum interventions."
      />

      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Prototype Disclaimer Banner */}
        <div className="rounded-xl border border-border bg-card p-4.5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="text-xs sm:text-sm leading-relaxed text-slate-800">
              <p className="font-bold text-slate-950">
                AI Intelligence & Decision Support Layer (Evaluation Environment)
              </p>
              <p className="mt-1 font-medium text-slate-700">
                These insight signals are grounded in simulated cross-district outcome metrics and employer vacancy signals.
                AI recommendations serve as decision-support alerts for state directors and VTP curriculum planners, completely decoupled from verified registry evidence.
              </p>
            </div>
          </div>
        </div>

        {/* 4-Step Analytical Process Strip */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                  <Compass className="size-4" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-bold text-slate-950 uppercase tracking-wide">
                  Autonomous Signal Detection Lifecycle
                </h2>
              </div>
              <Badge variant="default" className="bg-indigo-100 text-indigo-900 border-indigo-200 text-[10px] font-bold">
                Pattern Recognition
              </Badge>
            </div>

            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: '01',
                  t: 'Read Outcome Signals',
                  d: 'Ingests batch outcomes, non-placement reasons, and active employer vacancy reports.',
                },
                {
                  n: '02',
                  t: 'Detect Gaps & Deltas',
                  d: 'Correlates recurring trade skill gaps against district training coverage capacities.',
                },
                {
                  n: '03',
                  t: 'Synthesize Evidence',
                  d: 'Summarises diagnostic patterns and root causes into concise narrative briefings for officials.',
                },
                {
                  n: '04',
                  t: 'Recommend Actions',
                  d: 'Proposes actionable curriculum modules, hospital rotations, or industry apprenticeships.',
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex flex-col justify-between gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3.5 shadow-2xs"
                >
                  <div>
                    <span className="text-xs font-medium text-primary tracking-wider">
                      STAGE {s.n}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-950 mt-0.5">{s.t}</h3>
                    <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Insight Cards Grid */}
        <section aria-label="Detected Policy Insights" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </section>
      </div>
    </AppShell>
  )
}
