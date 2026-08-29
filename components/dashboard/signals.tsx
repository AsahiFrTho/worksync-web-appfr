'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const toneColors: Record<string, { dot: string; bar: string }> = {
  success: { dot: 'bg-success', bar: 'bg-success' },
  warning: { dot: 'bg-warning', bar: 'bg-warning' },
  destructive: { dot: 'bg-destructive', bar: 'bg-destructive' },
  neutral: { dot: 'bg-muted-foreground', bar: 'bg-muted-foreground' },
}

// All three components below are rendered only from the Government
// Dashboard, so props are required -- there's no legacy page depending on
// a mock-data fallback here. Every prop is computed from real MongoDB
// collections in app/dashboard/page.tsx via lib/compute.ts.

// ── Follow-Up Status (the "Retain" step, made visible) ──────────────────────
interface FollowUpStatusDatum {
  label: string
  value: number
  tone: 'success' | 'warning' | 'destructive' | 'neutral'
}

export function FollowUpStatus({ data }: { data: FollowUpStatusDatum[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Follow-Up Status</CardTitle>
        <CardDescription className="mt-0.5">
          Live queue of 30/90/180-day retention check-ins across the cohort
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {!total ? (
          <p className="text-sm text-muted-foreground">No follow-ups scheduled yet.</p>
        ) : (
          data.map((f) => {
            const cfg = toneColors[f.tone] || toneColors.neutral
            const pct = total ? Math.round((f.value / total) * 100) : 0

            return (
              <div key={f.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span className={`size-2 rounded-full ${cfg.dot}`} aria-hidden="true" />
                    {f.label}
                  </span>
                  <span className="tabular-nums font-medium text-foreground">
                    {f.value.toLocaleString('en-IN')}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">({pct}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border p-0.5">
                  <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

// ── Skill-Gap Indicators (real reported gaps, ranked by report volume) ──────
interface SkillGapDatum {
  name: string
  total: number
  high: number
  medium: number
  low: number
}

export function SkillGapIndicators({ data }: { data: SkillGapDatum[] }) {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skill-Gap Indicators</CardTitle>
            <CardDescription className="mt-0.5">
              Skills most reported missing, by employers, learners and trainers
            </CardDescription>
          </div>
          {data.length > 0 && (
            <Badge variant="destructive" className="text-[10px] px-2 py-0.2">
              Priority Alert
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 pt-4">
        {!data.length ? (
          <p className="text-sm text-muted-foreground">No skill-gap reports filed yet.</p>
        ) : (
          data.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors duration-200 ease-in-out hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] font-normal text-muted-foreground">
                  <span className="rounded border border-border bg-destructive/10 text-destructive px-1.5 py-0.2">
                    {s.high} high
                  </span>
                  <span className="rounded border border-border bg-warning/10 text-warning px-1.5 py-0.2">
                    {s.medium} med
                  </span>
                  <span className="rounded border border-border bg-muted text-muted-foreground px-1.5 py-0.2">
                    {s.low} low
                  </span>
                </div>
              </div>
              <Badge variant={s.high > 0 ? 'destructive' : 'warning'} className="text-xs px-2 py-0.5 shrink-0">
                {s.total} report{s.total === 1 ? '' : 's'}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

// ── Non-Placement Diagnostics (real reasonCode tallies) ─────────────────────
interface ReasonDatum {
  name: string
  value: number
}

export function NonPlacementReasonsCard({ data }: { data: ReasonDatum[] }) {
  const max = Math.max(...data.map((r) => r.value), 1)
  const total = data.reduce((s, r) => s + r.value, 0)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Non-Placement Diagnostics</CardTitle>
        <CardDescription className="mt-0.5">
          Recorded reason codes for unemployed / not-placed / dropout outcomes
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {!data.length ? (
          <p className="text-sm text-muted-foreground">
            No non-placement outcomes with a reason code recorded yet.
          </p>
        ) : (
          data.map((r, idx) => {
            const isTop = idx === 0
            const sharePct = total ? Math.round((r.value / total) * 100) : 0
            return (
              <div key={r.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={`font-medium ${isTop ? 'text-primary' : 'text-foreground'}`}>
                    {r.name}
                  </span>
                  <span className={`tabular-nums font-medium ${isTop ? 'text-primary' : 'text-foreground'}`}>
                    {r.value} ({sharePct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted border border-border p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ease-in-out ${
                      isTop ? 'bg-primary' : idx === 1 ? 'bg-primary/50' : 'bg-muted-foreground/50'
                    }`}
                    style={{ width: `${(r.value / max) * 100}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
