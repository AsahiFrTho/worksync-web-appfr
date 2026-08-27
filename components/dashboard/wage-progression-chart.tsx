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
import { wageProgression, inr } from '@/lib/mock-data'
import { TrendingUp } from 'lucide-react'

export function WageProgressionChart() {
  const startWage = wageProgression[0]?.wage || 14000
  const endWage = wageProgression[wageProgression.length - 1]?.wage || 17200
  const growthPct = (((endWage - startWage) / startWage) * 100).toFixed(1)

  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Post-Placement Wage Progression</CardTitle>
              <Badge variant="default" className="text-[10px] px-2 py-0.2">
                12-Month Trajectory
              </Badge>
            </div>
            <CardDescription className="mt-0.5">
              Longitudinal median monthly wage trajectory across verified candidates
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            <TrendingUp className="size-3.5" />
            <span>+{growthPct}% 1-Year Growth</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wageProgression} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="wageFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={58}
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--popover)',
                  color: 'var(--popover-foreground)',
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 10px',
                }}
                formatter={(v) => [typeof v === 'number' ? inr(v) : String(v ?? ''), 'Median Wage']}
              />
              <Area
                type="monotone"
                dataKey="wage"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: 'var(--chart-1)', r: 3.5, strokeWidth: 1.5, stroke: 'var(--card)' }}
                activeDot={{ r: 5.5, stroke: 'var(--chart-1)', strokeWidth: 2, fill: 'var(--card)' }}
                fill="url(#wageFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs sm:grid-cols-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Starting Wage</span>
            <span className="font-medium text-foreground tabular-nums text-sm">₹{startWage.toLocaleString('en-IN')}/mo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">6-Month Wage</span>
            <span className="font-medium text-foreground tabular-nums text-sm">₹16,100/mo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">1-Year Median</span>
            <span className="font-medium text-primary tabular-nums text-sm">₹{endWage.toLocaleString('en-IN')}/mo</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Net Increment</span>
            <span className="font-medium text-primary tabular-nums text-sm">+₹{(endWage - startWage).toLocaleString('en-IN')} (+{growthPct}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
