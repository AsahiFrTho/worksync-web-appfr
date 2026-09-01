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
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 0 }}>
          <defs>
            {lines.map((l) => (
              <linearGradient key={l.key} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={l.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={l.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
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
            tickFormatter={(v) => (yFormatter ? yFormatter(Number(v)) : String(v))}
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
          />
          {lines.map((l) => (
            <Area
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={{ fill: l.color, r: 3, strokeWidth: 1.5, stroke: '#121212' }}
              activeDot={{ r: 5, stroke: l.color, strokeWidth: 2, fill: '#121212' }}
              fill={`url(#grad-${l.key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}