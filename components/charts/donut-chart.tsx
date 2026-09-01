'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number; key?: string }[]
  height?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div style={{ height }} className="relative w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={82}
            paddingAngle={2}
            strokeWidth={2}
            stroke="#121212"
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
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#121212',
              color: '#F5F5F7',
              fontSize: 12,
              fontWeight: 500,
              padding: '6px 10px',
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

const KEY_COLORS: Record<string, string> = {
  placed: '#059669',
  self_employed: '#7c3aed',
  apprentice: '#0284c7',
  higher_ed: '#4f46e5',
  unemployed: '#d97706',
  not_placed: '#ea580c',
  dropped_out: '#e11d48',
  re_engaged: '#2563eb',
  in_training: '#14b8a6',
  not_tracked: '#64748b',
}

const CHART_COLORS = KEY_COLORS

function entryKeyColor(entry: { key?: string }) {
  return entry.key ? KEY_COLORS[entry.key] || '#C5A059' : '#C5A059'
}