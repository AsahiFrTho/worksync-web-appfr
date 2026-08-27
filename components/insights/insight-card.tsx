import { Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AiInsight, Level } from '@/lib/mock-data'

function LevelPill({ label, level }: { label: string; level: Level }) {
  const variant =
    level === 'High'
      ? label === 'Employer demand'
        ? 'success'
        : 'destructive'
      : level === 'Medium'
        ? 'warning'
        : 'neutral'
  const coverageVariant =
    label === 'Training coverage'
      ? level === 'Low'
        ? 'destructive'
        : level === 'Medium'
          ? 'warning'
          : 'success'
      : variant
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">{label}</span>
      <Badge variant={coverageVariant} className="w-fit">{level}</Badge>
    </div>
  )
}

export function InsightCard({ insight }: { insight: AiInsight }) {
  return (
    <Card className="overflow-hidden border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <span className="text-xs font-medium text-primary truncate">Detected signal</span>
        </div>
        <Badge
          variant={
            insight.priority === 'High'
              ? 'destructive'
              : insight.priority === 'Medium'
                ? 'warning'
                : 'neutral'
          }
          className="shrink-0"
        >
          {insight.priority} priority
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{insight.district}</span>
          </div>
          <h3 className="font-heading text-base font-semibold leading-snug text-foreground text-balance">{insight.title}</h3>
          <p className="text-sm leading-relaxed font-normal text-muted-foreground text-pretty">
            {insight.narrative}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground truncate">
              Detected skill gap
            </span>
            <span className="text-sm font-medium text-foreground truncate">{insight.skillGap}</span>
          </div>
          <LevelPill label="Employer demand" level={insight.employerDemand} />
          <LevelPill label="Training coverage" level={insight.trainingCoverage} />
        </div>

        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-primary/5 p-3 text-foreground">
          <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-medium text-primary">Suggested programme action</span>
            <p className="text-sm leading-relaxed font-normal text-muted-foreground text-pretty">{insight.action}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-1">
          <span>Model confidence (illustrative)</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 sm:w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
            <span className="tabular-nums font-medium text-foreground">{insight.confidence}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
