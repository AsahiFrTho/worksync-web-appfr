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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { employerDemandedSkills } from '@/lib/mock-data'

export function EmployerDemandChart() {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Industry Verified Demand</CardTitle>
        <CardDescription className="mt-0.5">
          Open verified positions reported across employer network
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={employerDemandedSkills}
              layout="vertical"
              margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
              />
              <YAxis
                type="category"
                dataKey="skill"
                width={130}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#F5F5F7', fontWeight: 500 }}
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
                formatter={(v) => [typeof v === 'number' ? v.toLocaleString('en-IN') + ' Openings' : String(v ?? ''), 'Demand']}
              />
              <Bar dataKey="openings" radius={[0, 4, 4, 0]} barSize={16}>
                {employerDemandedSkills.map((entry, i) => (
                  <Cell key={entry.skill} fill={i < 3 ? '#C5A059' : '#8A7344'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
