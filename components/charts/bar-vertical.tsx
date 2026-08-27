'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function BarVertical({
  data,
  xKey,
  barKey,
  name,
  color,
  height = 240,
  yFormatter,
  angle = 0,
  barSize = 22,
  valueColor = undefined,
}: {
  data: { [key: string]: string | number }[]
  xKey: string
  barKey: string
  name: string
  color: string
  height?: number
  yFormatter?: (v: number) => string
  angle?: number
  barSize?: number
  valueColor?: string
}) {
  return (
    <div style={{ height }} className="w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 12, top: 8, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval={0}
            angle={angle}
            height={angle ? 52 : 30}
            textAnchor={angle ? 'end' : 'middle'}
            tick={{ fontSize: 10.5, fill: 'var(--muted-foreground)', fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={46}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }}
            tickFormatter={(v) => (yFormatter ? yFormatter(Number(v)) : String(v))}
          />
          <Tooltip
            cursor={{ fill: 'color-mix(in srgb, var(--muted) 55%, transparent)' }}
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
          <Bar dataKey={barKey} name={name} fill={color} radius={[4, 4, 0, 0]} barSize={barSize}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={color}
                fillOpacity={0.55 + (idx / Math.max(data.length, 1)) * 0.45}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}