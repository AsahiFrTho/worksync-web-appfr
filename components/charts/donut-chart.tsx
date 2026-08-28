'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useMounted } from '@/lib/use-mounted'

export function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number; key?: string }[]
  height?: number
}) {
  const mounted = useMounted()
  if (!mounted) {
    return <div style={{ height }} className="w-full" />
  }
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ height }} className="relative w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={2}
stroke="var(--card)"
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.key || entry.name}
                fill={data[i]?.key ? CHART_COLORS[entry.key || ''] || entryKeyColor(entry) : entryKeyColor(entry)}
              />
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
            formatter={(v) => [`${v} (${Math.round((Number(v) / total) * 100)}%)`, 'Learners']}
          />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </span>
          <span className="font-heading text-lg font-semibold text-foreground tabular-nums">
            {total}
          </span>
        </div>
      ) : null}
    </div>
  )
}
// Refined mid-tone palette — legible on both dark and light surfaces.
const KEY_COLORS: Record<string, string> = {
  placed: '#10b981',
  self_employed: '#8b5cf6',
  apprentice: '#0ea5e9',
  higher_ed: '#6366f1',
  unemployed: '#f59e0b',
  not_placed: '#f97316',
  dropped_out: '#f43f5e',
  re_engaged: '#3b82f6',
  in_training: '#14b8a6',
  not_tracked: '#64748b',
}

const CHART_COLORS = KEY_COLORS

function entryKeyColor(entry: { key?: string }) {
return entry.key ? KEY_COLORS[entry.key] || 'var(--chart-1)' : 'var(--chart-1)'
}