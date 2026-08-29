'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { coursePerformance, providerPerformance } from '@/lib/mock-data'
import { Star } from 'lucide-react'

// ── Shared row shapes (match lib/compute.ts's groupStats / providerScorecards) ──
interface GroupRow {
  name: string
  total: number
  placementRate: number
  verifiedRate: number
  wageGrowth: number
  completeness: number
}

interface ProviderRow {
  provider: { id: string; name: string; district: string; status: string }
  learners: number
  placementRate: number
  verifiedRate: number
  retentionRate: number
  wageGrowth: number
  completeness: number
  composite: number
  badge: string
}

// Fallback rows for the (not-yet-migrated) Provider Analytics page, reshaped
// from the old illustrative mock data into the SAME shape the real compute
// engine produces. This keeps exactly one code path in the JSX below instead
// of branching on "is this real or mock data" -- the component never has to
// know which one it got.
const FALLBACK_COURSE_ROWS: GroupRow[] = coursePerformance.map((c) => ({
  name: c.course,
  total: c.trainees,
  placementRate: c.employmentRate,
  verifiedRate: c.employmentRate, // no separate verified-rate in the old mock; best available proxy
  wageGrowth: 0,
  completeness: 0,
}))

const FALLBACK_PROVIDER_ROWS: ProviderRow[] = providerPerformance.map((p, i) => ({
  provider: { id: `mock-${i}`, name: p.provider, district: '—', status: 'active' },
  learners: p.trainees,
  placementRate: p.placementRate,
  verifiedRate: 0,
  retentionRate: 0,
  wageGrowth: 0,
  completeness: 0,
  composite: Math.round(p.rating * 20), // old 0-5 rating -> approximate 0-100 composite
  badge: p.rating >= 4.3 ? 'Strong' : p.rating >= 4 ? 'Improving' : 'Needs attention',
}))

function RateBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted border border-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="tabular-nums font-medium text-foreground text-xs">{value}%</span>
    </div>
  )
}

function ConfidenceBadge({ sampleSize }: { sampleSize: number }) {
  // Small, honestly-derived sample-size indicator -- replaces the old
  // fictional "employer Demand: High/Medium/Low" label. We are NOT claiming
  // to know real labour-market demand; we ARE telling the viewer how much
  // real data backs this row, which is something we can actually prove.
  const level = sampleSize >= 15 ? 'High' : sampleSize >= 5 ? 'Medium' : 'Low'
  const variant = level === 'High' ? 'success' : level === 'Medium' ? 'warning' : 'neutral'
  return (
    <Badge variant={variant} className="text-xs px-2 py-0.5">
      {level} confidence
    </Badge>
  )
}

// ── District Performance (dashboard-only, always real data) ────────────────
export function DistrictTable({ rows }: { rows: GroupRow[] }) {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>District Performance Index</CardTitle>
        <CardDescription className="mt-0.5">
          Live placement, verification and wage-growth audit by district
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!rows.length ? (
          <p className="p-5 text-sm text-muted-foreground">No trainees recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-2.5">District</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                  <th scope="col" className="px-4 py-2.5">Placement Rate</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Employer-Verified</th>
                  <th scope="col" className="px-5 py-2.5 text-right">Avg Wage Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((d) => (
                  <tr key={d.name} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                    <td className="px-5 py-2.5 font-medium text-foreground text-sm">{d.name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                      {d.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5"><RateBar value={d.placementRate} /></td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {d.verifiedRate}%
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {d.wageGrowth > 0 ? '+' : ''}{d.wageGrowth}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Course / Trade Performance (shared with Provider Analytics page) ───────
export function CourseTable({ rows = FALLBACK_COURSE_ROWS }: { rows?: GroupRow[] }) {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Course & Trade Performance</CardTitle>
        <CardDescription className="mt-0.5">
          Placement yield by vocational qualification, with a confidence indicator based on cohort size
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!rows.length ? (
          <p className="p-5 text-sm text-muted-foreground">No course data recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-2.5">Course / Trade</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                  <th scope="col" className="px-4 py-2.5">Placement Rate</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Wage Growth</th>
                  <th scope="col" className="px-5 py-2.5 text-right">Sample Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((c) => (
                  <tr key={c.name} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                    <td className="px-5 py-2.5 font-medium text-foreground text-sm">{c.name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                      {c.total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5"><RateBar value={c.placementRate} /></td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-medium text-foreground">
                      {c.wageGrowth > 0 ? '+' : ''}{c.wageGrowth}%
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <ConfidenceBadge sampleSize={c.total} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Training Provider Scorecards (shared with Provider Analytics page) ─────
export function ProviderTable({ rows = FALLBACK_PROVIDER_ROWS }: { rows?: ProviderRow[] }) {
  return (
    <Card className="border border-border bg-card rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border pb-3.5">
        <CardTitle>Training Provider Scorecards</CardTitle>
        <CardDescription className="mt-0.5">
          Composite score computed from placement, verification, retention and completeness data
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {!rows.length ? (
          <p className="p-5 text-sm text-muted-foreground">No provider data recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-2.5">Training Provider</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Trainees</th>
                  <th scope="col" className="px-4 py-2.5">Placement Rate</th>
                  <th scope="col" className="px-5 py-2.5 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p, idx) => (
                  <tr key={p.provider.id} className="hover:bg-muted/40 transition-colors duration-200 ease-in-out text-foreground">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted border border-border text-[10px] font-medium text-muted-foreground">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground text-sm">{p.provider.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-normal text-muted-foreground">
                      {p.learners.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-2.5"><RateBar value={p.placementRate} /></td>
                    <td className="px-5 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 border border-primary/25 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                        <Star className="size-3 text-primary" />
                        <span>{p.composite} / 100 · {p.badge}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
