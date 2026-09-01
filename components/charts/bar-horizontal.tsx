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
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 4, right: 28, top: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tick={{ fontSize: 10.5, fill: '#A1A1AA', fontWeight: 500 }}
            tickFormatter={(v) => (xFormatter ? xFormatter(Number(v)) : String(v))}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={width}
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={{ fontSize: 11, fill: '#E4E4E7', fontWeight: 500 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
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
          <Bar dataKey={barKey} name={name} fill={color} radius={[0, 4, 4, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}