'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  districtPerformance,
  coursePerformance,
  providerPerformance,
  inr,
} from '@/lib/mock-data'
import { Star } from 'lucide-react'

function DemandBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const variant = level === 'High' ? 'success' : level === 'Medium' ? 'warning' : 'neutral'
  return <Badge variant={variant} className="text-xs px-2 py-0.5">{level}</Badge>
}

export function DistrictTable() {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>District Performance Index</CardTitle>
        <CardDescription className="mt-0.5">
          Longitudinal employment and retention audit by district
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-2.5">District</th>
                <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                <th scope="col" className="px-4 py-2.5">Employment Rate</th>
                <th scope="col" className="px-3 py-2.5 text-right">6M Retention</th>
                <th scope="col" className="px-5 py-2.5 text-right">Avg Monthly Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {districtPerformance.map((d) => (
                <tr key={d.district} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                  <td className="px-5 py-2.5 font-medium text-foreground text-sm">{d.district}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                    {d.trainees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted border border-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${d.employmentRate}%` }}
                        />
                      </div>
                      <span className="tabular-nums font-medium text-foreground text-xs">{d.employmentRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
                    {d.retentionRate}%
                  </td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-medium text-foreground">{inr(d.avgWage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseTable() {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Course & Trade Performance</CardTitle>
        <CardDescription className="mt-0.5">
          Placement yield and industry demand by vocational qualification
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-2.5">Course / Trade</th>
                <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                <th scope="col" className="px-4 py-2.5">Placement Rate</th>
                <th scope="col" className="px-3 py-2.5 text-right">Avg Wage</th>
                <th scope="col" className="px-5 py-2.5 text-right">Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coursePerformance.map((c) => (
                <tr key={c.course} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                  <td className="px-5 py-2.5 font-medium text-foreground text-sm">{c.course}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                    {c.trainees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted border border-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${c.employmentRate}%` }}
                        />
                      </div>
                      <span className="tabular-nums font-medium text-foreground text-xs">{c.employmentRate}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">{inr(c.avgWage)}</td>
                  <td className="px-5 py-2.5 text-right">
                    <DemandBadge level={c.demand} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProviderTable() {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Training Provider Ratings</CardTitle>
        <CardDescription className="mt-0.5">
          Accredited training partners ranked by verified placement yield
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <th scope="col" className="px-5 py-2.5">Training Provider</th>
                <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                <th scope="col" className="px-4 py-2.5">Placement Rate</th>
                <th scope="col" className="px-5 py-2.5 text-right">Quality Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providerPerformance.map((p, idx) => (
                <tr key={p.provider} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-foreground text-sm">{p.provider}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                    {p.trainees.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted border border-border">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${p.placementRate}%` }}
                        />
                      </div>
                      <span className="tabular-nums font-medium text-foreground text-xs">{p.placementRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                      <Star className="size-3 text-primary" />
                      <span>{p.rating.toFixed(1)} / 5</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
