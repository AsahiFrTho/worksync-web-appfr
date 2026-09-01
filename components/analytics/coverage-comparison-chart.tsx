'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { courseToSkillComparison } from '@/lib/mock-data'

export function CoverageComparisonChart({ courseFilter }: { courseFilter?: string }) {
  const data =
    courseFilter && courseFilter !== 'All Courses'
      ? courseToSkillComparison.filter((d) => courseFilter.startsWith(d.course))
      : courseToSkillComparison
  const view = data.length ? data : courseToSkillComparison

  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Course-to-Skill Alignment</CardTitle>
        <CardDescription className="mt-0.5">
          Comparative index: Institutional training volume vs. Industry job demand
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={view} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="course"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                interval={0}
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fontSize: 11, fill: '#A1A1AA', fontWeight: 500 }}
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
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 500, color: '#A1A1AA', paddingTop: 10 }} />
              <Bar
                dataKey="trainingCoverage"
                name="Training Coverage"
                fill="#8A7344"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="employerDemand"
                name="Employer Demand"
                fill="#C5A059"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
