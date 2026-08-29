'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { wageProgression as mockWageProgression } from '@/lib/mock-data'
import { fmtMoney } from '@/lib/compute'
import { TrendingUp } from 'lucide-react'

interface WagePoint {
  month: string
  wage: number
}

// Optional prop, same reasoning as OutcomeFunnel: this chart is still used
// by the (not-yet-migrated) Provider Analytics page, so it keeps a mock
// fallback. The Dashboard always supplies real monthly wage averages
// computed from actual OutcomeEvent records via wageProgressionSeries().
export function WageProgressionChart({ data = mockWageProgression }: { data?: WagePoint[] }) {
  // Guard against an empty real series (e.g. a freshly-seeded, very small
  // cohort with no wage-bearing outcomes yet) so the chart never divides by
  // zero or renders blank without explanation.
  if (!data.length) {
    return (
      <Card className="border border-border bg-card rounded-xl overflow-hidden">
        <CardHeader className="border-b border-border pb-3.5">
          <CardTitle>Post-Placement Wage Progression</CardTitle>
          <CardDescription className="mt-0.5">
            Longitudinal median monthly wage trajectory across verified candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            No wage-bearing outcome events yet for this cohort. Record an employment or
            wage-update outcome for a trainee to populate this chart.
          </p>
        </CardContent>
      </Card>
    )
  }

  const startWage = data[0].wage
  const endWage = data[data.length - 1].wage
  const growthPct = startWage > 0 ? (((endWage - startWage) / startWage) * 100).toFixed(1) : '0.0'

  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Post-Placement Wage Progression</CardTitle>
              <Badge variant="default" className="text-[10px] px-2 py-0.2">
                Live Cohort Trend
              </Badge>
            </div>
            <CardDescription className="mt-0.5">
              Longitudinal median monthly wage trajectory across verified candidates
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <TrendingUp className="size-3.5" />
            <span>{growthPct.startsWith('-') ? '' : '+'}{growthPct}% across window</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="wageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C5A059" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#C5A059" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={58}
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ stroke: '#6B6B70', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#121212',
                  color: '#F5F5F7',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 10px',
                }}
                formatter={(v) => [typeof v === 'number' ? fmtMoney(v) : String(v ?? ''), 'Avg Wage']}
              />
              <Area
                type="monotone"
                dataKey="wage"
                stroke="#C5A059"
                strokeWidth={2}
                dot={{ fill: '#C5A059', r: 3.5, strokeWidth: 1.5, stroke: '#121212' }}
                activeDot={{ r: 5.5, stroke: '#C5A059', strokeWidth: 2, fill: '#121212' }}
                fill="url(#wageFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Earliest Recorded</span>
            <span className="font-medium text-foreground tabular-nums text-sm">{fmtMoney(startWage)}/mo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Data Points</span>
            <span className="font-medium text-foreground tabular-nums text-sm">{data.length} months</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Latest Recorded</span>
            <span className="font-medium text-primary tabular-nums text-sm">{fmtMoney(endWage)}/mo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Net Change</span>
            <span className="font-medium text-primary tabular-nums text-sm">
              {endWage - startWage >= 0 ? '+' : ''}{fmtMoney(endWage - startWage)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
