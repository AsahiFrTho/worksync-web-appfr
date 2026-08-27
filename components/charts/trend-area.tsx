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

export function TrendArea({
  data,
  lines,
  height = 240,
  yFormatter,
}: {
  data: { [key: string]: string | number | null }[]
  lines: { key: string; name: string; color: string }[]
  height?: number
  yFormatter?: (v: number) => string
}) {
  return (
    <div style={{ height }} className="w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
          <defs>
            {lines.map((l) => (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={l.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={l.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
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
            tickFormatter={(v) => (yFormatter ? yFormatter(Number(v)) : String(v))}
          />
          <Tooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
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
          />
          {lines.map((l) => (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={{ fill: l.color, r: 3, strokeWidth: 1.5, stroke: 'var(--card)' }}
              activeDot={{ r: 5, stroke: l.color, strokeWidth: 2, fill: 'var(--card)' }}
              fill={`url(#grad-${l.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}