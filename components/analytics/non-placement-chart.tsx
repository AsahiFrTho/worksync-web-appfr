'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { nonPlacementReasons } from '@/lib/mock-data'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

export function NonPlacementChart() {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Root Causes for Non-Placement</CardTitle>
        <CardDescription className="mt-0.5">
          Share of certified-but-unplaced candidates across cohort
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonPlacementReasons}
                  dataKey="value"
                  nameKey="reason"
                  innerRadius={50}
                  outerRadius={84}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {nonPlacementReasons.map((entry, i) => (
                    <Cell key={entry.reason} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--popover)',
                    color: 'var(--popover-foreground)',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '8px 12px',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  formatter={(v, n) => [typeof v === 'number' ? `${v}%` : String(v ?? ''), n ?? '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-1 flex-col gap-2.5 w-full">
            {nonPlacementReasons.map((r, i) => (
              <li key={r.reason} className="flex items-center justify-between gap-2 text-xs sm:text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                    aria-hidden="true"
                  />
                  <span>{r.reason}</span>
                </span>
                <span className="tabular-nums font-medium text-foreground text-xs sm:text-sm">{r.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
