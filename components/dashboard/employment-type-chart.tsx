'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { employmentTypeSplit } from '@/lib/mock-data'

const COLORS = ['#C5A059', '#8A7344', '#D4C4A0']

export function EmploymentTypeChart() {
  const total = employmentTypeSplit.reduce((s, d) => s + d.value, 0)
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employment Modality</CardTitle>
            <CardDescription className="mt-0.5">
              Breakdown of verified placement types
            </CardDescription>
          </div>
          <Badge variant="neutral" className="text-[10px]">
            33,020 Placed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="h-44 w-44 shrink-0 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={employmentTypeSplit}
                  dataKey="value"
                  nameKey="type"
                  innerRadius={46}
                  outerRadius={74}
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="#121212"
                >
                  {employmentTypeSplit.map((entry, i) => (
                    <Cell key={entry.type} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#121212',
                    color: '#F5F5F7',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '6px 10px',
                  }}
                  formatter={(v, n) => [typeof v === 'number' ? v.toLocaleString('en-IN') + ' trainees' : String(v ?? ''), n ?? '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-1 flex-col gap-2.5 w-full">
            {employmentTypeSplit.map((d, i) => {
              const pct = Math.round((d.value / total) * 100)
              return (
                <li key={d.type} className="flex items-center justify-between gap-2 text-xs sm:text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                      aria-hidden="true"
                    />
                    <span>{d.type}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-normal text-muted-foreground hidden sm:inline tabular-nums">
                      {d.value.toLocaleString('en-IN')}
                    </span>
                    <span className="tabular-nums font-medium text-foreground text-xs sm:text-sm">
                      {pct}%
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
