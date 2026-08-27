'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  followUpStatus,
  skillGaps,
  nonPlacementReasons,
} from '@/lib/mock-data'

const toneColors: Record<string, { dot: string; bar: string }> = {
  success: { dot: 'bg-success', bar: 'bg-success' },
  warning: { dot: 'bg-warning', bar: 'bg-warning' },
  destructive: { dot: 'bg-destructive', bar: 'bg-destructive' },
  neutral: { dot: 'bg-muted-foreground', bar: 'bg-muted-foreground' },
}

export function FollowUpStatus() {
  const total = followUpStatus.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Follow-Up Status</CardTitle>
        <CardDescription className="mt-0.5">
          Outcome verification audit across active cohort
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {followUpStatus.map((f) => {
          const cfg = toneColors[f.tone] || toneColors.neutral
          const pct = Math.round((f.value / total) * 100)

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
                <div
                  className={`h-full rounded-full ${cfg.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export function SkillGapIndicators() {
  const top = skillGaps.filter((s) => s.gap > 0).slice(0, 4)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skill-Gap Indicators</CardTitle>
            <CardDescription className="mt-0.5">
              High employer demand vs. low training coverage
            </CardDescription>
          </div>
          <Badge variant="destructive" className="text-[10px] px-2 py-0.2">
            Priority Alert
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 pt-4">
        {top.map((s) => (
          <div
            key={s.skill}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3 transition-colors duration-200 ease-in-out hover:bg-muted/50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{s.skill}</p>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] font-normal text-muted-foreground">
                <span className="rounded border border-border bg-primary/10 text-primary px-1.5 py-0.2">Demand: {s.demand}</span>
                <span>•</span>
                <span className="rounded border border-border bg-muted text-muted-foreground px-1.5 py-0.2">Coverage: {s.coverage}</span>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <Badge variant={s.demand === 'High' ? 'destructive' : 'warning'} className="text-xs px-2 py-0.5">
                Gap {s.gap}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function NonPlacementReasonsCard() {
  const max = Math.max(...nonPlacementReasons.map((r) => r.value))
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Non-Placement Diagnostics</CardTitle>
        <CardDescription className="mt-0.5">
          Root cause analysis: Why certified candidates remain unplaced
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {nonPlacementReasons.map((r, idx) => {
          const isTop = idx === 0
          return (
            <div key={r.reason} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className={`font-medium ${isTop ? 'text-primary' : 'text-foreground'}`}>
                  {r.reason}
                </span>
                <span className={`tabular-nums font-medium ${isTop ? 'text-primary' : 'text-foreground'}`}>
                  {r.value}%
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
        })}
      </CardContent>
    </Card>
  )
}
