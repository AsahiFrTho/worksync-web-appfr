import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { skillGaps, type Level } from '@/lib/mock-data'

function LevelBadge({ level, kind }: { level: Level; kind: 'demand' | 'coverage' }) {
  let variant: 'success' | 'warning' | 'destructive' | 'neutral' = 'neutral'
  if (kind === 'demand') {
    variant = level === 'High' ? 'destructive' : level === 'Medium' ? 'warning' : 'neutral'
  } else {
    variant = level === 'High' ? 'success' : level === 'Medium' ? 'warning' : 'destructive'
  }
  return <Badge variant={variant} className="text-[10px] px-2 py-0.5">{level}</Badge>
}

export function SkillGapMatrix() {
  const sorted = [...skillGaps].sort((a, b) => b.gap - a.gap)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top Priority Skill Gaps</CardTitle>
            <CardDescription className="mt-0.5">
              Ranked by net divergence between industry openings and trainee supply
            </CardDescription>
          </div>
          <Badge variant="default" className="text-[10px]">
            Index Ranking
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-4">
        {sorted.map((s) => {
          const positive = s.gap > 0
          return (
            <div key={s.skill} className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors duration-200 ease-in-out hover:bg-muted/50">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{s.skill}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Demand:</span>
                    <LevelBadge level={s.demand} kind="demand" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-medium text-muted-foreground">Coverage:</span>
                    <LevelBadge level={s.coverage} kind="coverage" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Demand</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${s.demandScore}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                    {s.demandScore}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Coverage</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/50"
                      style={{ width: `${s.coverageScore}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                    {s.coverageScore}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-border mt-0.5">
                {positive ? (
                  <span className="text-xs font-medium text-destructive flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-destructive inline-block" />
                    Under-served — demand outpaces training capacity by {s.gap} pts
                  </span>
                ) : (
                  <span className="text-xs font-medium text-success flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-success inline-block" />
                    Well covered — capacity exceeds demand by {Math.abs(s.gap)} pts
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
