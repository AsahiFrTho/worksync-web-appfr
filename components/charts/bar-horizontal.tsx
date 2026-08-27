'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function BarHorizontal({
  data,
  barKey,
  name,
  color,
  height = 220,
  width = 140,
  barSize = 16,
  xFormatter,
}: {
  data: { [key: string]: string | number }[]
  barKey: string
  name: string
  color: string
  height?: number
  width?: number
  barSize?: number
  xFormatter?: (v: number) => string
}) {
  return (
<div style={{ height }} className="w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 28, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tick={{ fontSize: 10.5, fill: 'var(--muted-foreground)', fontWeight: 500 }}
            tickFormatter={(v) => (xFormatter ? xFormatter(Number(v)) : String(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={width}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fontSize: 11, fill: 'var(--foreground)', fontWeight: 500 }}
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
          <Bar dataKey={barKey} name={name} fill={color} radius={[0, 4, 4, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}