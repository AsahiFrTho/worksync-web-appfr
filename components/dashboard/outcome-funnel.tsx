'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { outcomeFunnel as mockOutcomeFunnel } from '@/lib/mock-data'
import { compact } from '@/lib/compute'
import { TrendingUp } from 'lucide-react'

const barOpacities = ['bg-primary/90', 'bg-primary/75', 'bg-primary/60', 'bg-primary/45', 'bg-primary/30']

interface FunnelStage {
  stage: string
  value: number
}

// `stages` is optional so this component keeps working, unchanged, on the
// Training Provider Analytics page (which hasn't migrated to live data in
// this phase). The Government Dashboard always passes real computed stages
// from lib/compute.ts's outcomeFunnel(); if a caller omits the prop, we fall
// back to the illustrative demo array instead of crashing.
export function OutcomeFunnel({ stages = mockOutcomeFunnel }: { stages?: FunnelStage[] }) {
  const max = stages[0]?.value || 1
  const netYield = Math.round(((stages[stages.length - 1]?.value || 0) / max) * 100)

  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Longitudinal Outcome Funnel</CardTitle>
              <Badge variant="default" className="text-[10px] px-2 py-0.2">
                5-Stage Audit
              </Badge>
            </div>
            <CardDescription className="mt-0.5">
              Enrolled → Completed → Certified → Employed → Retained
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs font-medium text-foreground">
            <TrendingUp className="size-3.5 text-primary" />
            <span>Net Yield: {netYield}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pt-4">
        {stages.map((stage, i) => {
          const pct = Math.round((stage.value / max) * 100)
          const conversion =
            i === 0 ? 100 : Math.round((stage.value / (stages[i - 1].value || 1)) * 100)
          const dropOff = i === 0 ? 0 : stages[i - 1].value - stage.value

          return (
            <div key={stage.stage} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="font-medium text-foreground">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  {i > 0 && dropOff > 0 && (
                    <span className="hidden sm:inline text-[11px] font-normal text-muted-foreground">
                      (-{dropOff.toLocaleString('en-IN')})
                    </span>
                  )}
                  <span className="tabular-nums font-medium text-foreground">
                    {stage.value.toLocaleString('en-IN')}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {i === 0 ? `${pct}% intake` : `${conversion}% retention`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="h-6 w-full overflow-hidden rounded-md bg-muted border border-border p-0.5">
                <div
                  className={`flex h-full items-center justify-end rounded px-2 text-[11px] font-medium text-foreground transition-all duration-200 ease-in-out ${barOpacities[i]}`}
                  style={{ width: `${Math.max(pct, 14)}%` }}
                >
                  <span className="tabular-nums">{compact(stage.value)} ({pct}%)</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
