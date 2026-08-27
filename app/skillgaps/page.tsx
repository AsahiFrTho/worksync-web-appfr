'use client'

import { useMemo, useState } from 'react'
import { Lightbulb, Puzzle, Briefcase, Users } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, Th, Td } from '@/components/ui/table'
import { ToneBadge } from '@/components/ui/tone-badge'
import { DataState } from '@/components/data-state'
import { FilterBar } from '@/components/filter-bar'
import { BarHorizontal } from '@/components/charts/bar-horizontal'
import { useProgramData } from '@/lib/use-program-data'
import {
  topSkillGaps,
  courseOf,
  providerOf,
  fmtDate,
  DEFAULT_FILTERS,
  type Filters,
} from '@/lib/compute'

const SEV_TONE: Record<string, string> = { high: 'rose', medium: 'amber', low: 'slate' }

export default function SkillGapsPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const [filters, setFilters] = useState<Filters>({
    ...DEFAULT_FILTERS,
    provider: 'all',
    course: 'all',
    district: 'all',
  })

  const overall = useMemo(() => topSkillGaps(db, filters).slice(0, 8), [db, filters])
  const byEmployer = useMemo(() => topSkillGaps(db, filters, 'employer').slice(0, 6), [db, filters])
  const byLearner = useMemo(() => topSkillGaps(db, filters, 'learner').slice(0, 6), [db, filters])
  const byCourse = useMemo(() => topSkillGaps(db, filters, 'course'), [db, filters])
  const byDistrict = useMemo(() => topSkillGaps(db, filters, 'district'), [db, filters])

  // mismatch: placements whose relevance to training is low, by course
  const mismatch = useMemo(() => {
    const rows: Record<string, { total: number; low: number }> = {}
    db.outcomes.forEach((o) => {
      if (!['wage_employment', 'job_change'].includes(o.outcomeType) || !o.relevanceToTraining) return
      const course = courseOf(db, o.traineeId)?.name
      if (!course) return
      rows[course] = rows[course] || { total: 0, low: 0 }
      rows[course].total++
      if (o.relevanceToTraining === 'low') rows[course].low++
    })
    return Object.entries(rows)
      .map(([course, v]) => ({ course, ...v, lowShare: Math.round((v.low / v.total) * 100) }))
      .sort((a, b) => b.lowShare - a.lowShare)
  }, [db])

  const totalGaps = db.skillGaps.length
  const highGaps = db.skillGaps.filter((g) => g.severity === 'high').length

  const recommendations = useMemo(() => {
    const recs: string[] = []
    const top = overall[0]
    if (top)
      recs.push(
        `Add a 10-hour bridge module on “${top.name}” to the courses reporting it most — it accounts for ${top.total} of ${totalGaps} gap reports.`
      )
    const empTop = byEmployer[0]
    if (empTop)
      recs.push(
        `Employers most often flag “${empTop.name}” — invite employer reps to review the practical component of the relevant course.`
      )
    const mismatchTop = mismatch[0]
    if (mismatchTop && mismatchTop.lowShare > 0)
      recs.push(
        `${mismatchTop.course} has the highest training–job mismatch (${mismatchTop.lowShare}% of placed learners in low-relevance roles) — revisit job-role mapping with providers.`
      )
    const distTop = byDistrict[0]
    if (distTop)
      recs.push(
        `${distTop.name} reports the most gaps overall — prioritise a district-level trainer refresher and employer meetup.`
      )
    return recs
  }, [overall, byEmployer, byDistrict, mismatch, totalGaps])

  return (
    <AppShell>
      <PageHeader
        eyebrow="Curriculum Intelligence"
        title="Skill Gap Analysis"
        description="Gap reports from employer verification calls and learner self-assessments — ranked, grouped by course and district, with training↔job mismatch and auto-generated recommendations."
      />
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="mb-2">
            <h2 className="text-sm font-semibold text-foreground">
              {totalGaps} gap reports ({highGaps} high severity)
            </h2>
            <p className="text-xs text-muted-foreground">
              From employer calls and learner self-assessments
            </p>
          </div>

          <FilterBar
            db={db}
            filters={filters}
            setFilters={setFilters}
            show={['provider', 'course', 'district']}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="border-b border-border pb-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top skill gaps</CardTitle>
                    <CardDescription className="mt-0.5">All sources · overall</CardDescription>
                  </div>
                  <Puzzle className="size-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {overall.length ? (
                  <BarHorizontal
                    data={overall}
                    barKey="total"
                    name="Reports"
                    color="var(--chart-3)"
                    height={Math.max(180, overall.length * 34)}
                  />
                ) : (
                  <p className="py-6 text-center text-xs text-muted-foreground">
                    No skill gaps in this selection.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Reported by employers</CardTitle>
                      <CardDescription className="mt-0.5">
                        Captured during employer verification calls
                      </CardDescription>
                    </div>
                    <Briefcase className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {byEmployer.length ? (
                    <BarHorizontal
                      data={byEmployer}
                      barKey="total"
                      name="Reports"
                      color="var(--chart-1)"
                      height={Math.max(160, byEmployer.length * 30)}
                    />
                  ) : (
                    <p className="py-5 text-center text-xs text-muted-foreground">
                      No employer-reported gaps.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">Reported by learners</CardTitle>
                      <CardDescription className="mt-0.5">
                        From follow-up self-assessments
                      </CardDescription>
                    </div>
                    <Users className="size-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {byLearner.length ? (
                    <BarHorizontal
                      data={byLearner}
                      barKey="total"
                      name="Reports"
                      color="var(--chart-2)"
                      height={Math.max(160, byLearner.length * 30)}
                    />
                  ) : (
                    <p className="py-5 text-center text-xs text-muted-foreground">
                      No learner-reported gaps.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-3.5">
                <CardTitle className="text-sm">Missing skills by course</CardTitle>
              </CardHeader>
              <Table minWidthClass="min-w-[520px]">
                <thead className="bg-muted/20">
                  <tr>
                    <Th>Course</Th>
                    <Th>Top missing skills</Th>
                    <Th className="w-24">Reports</Th>
                  </tr>
                </thead>
                <tbody>
                  {byCourse.map((c) => {
                    const skills = db.skillGaps
                      .filter((s) => courseOf(db, s.traineeId)?.name === c.name)
                      .sort((a, b) => Number(b.severity === 'high') - Number(a.severity === 'high'))
                    const seen = new Set<string>()
                    const top = skills.filter((s) => {
                      if (seen.has(s.skillName)) return false
                      seen.add(s.skillName)
                      return true
                    }).slice(0, 4)
                    return (
                      <tr key={c.name} className="transition-colors hover:bg-muted/30">
                        <Td className="font-medium">{c.name}</Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {top.map((s) => (
                              <ToneBadge key={s._id} tone={SEV_TONE[s.severity]}>
                                {s.skillName}
                              </ToneBadge>
                            ))}
                          </div>
                        </Td>
                        <Td className="font-semibold">{c.total}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-3.5">
                <CardTitle className="text-sm">Missing skills by district</CardTitle>
              </CardHeader>
              <Table minWidthClass="min-w-[520px]">
                <thead className="bg-muted/20">
                  <tr>
                    <Th>District</Th>
                    <Th>Top missing skills</Th>
                    <Th className="w-24">Reports</Th>
                  </tr>
                </thead>
                <tbody>
                  {byDistrict.map((d) => {
                    const skills = db.skillGaps.filter(
                      (s) => db.learners.find((l) => l.traineeId === s.traineeId)?.district === d.name
                    )
                    const seen = new Set<string>()
                    const top = skills.filter((s) => {
                      if (seen.has(s.skillName)) return false
                      seen.add(s.skillName)
                      return true
                    }).slice(0, 4)
                    return (
                      <tr key={d.name} className="transition-colors hover:bg-muted/30">
                        <Td className="font-medium">{d.name}</Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {top.map((s) => (
                              <ToneBadge key={s._id} tone={SEV_TONE[s.severity]}>
                                {s.skillName}
                              </ToneBadge>
                            ))}
                          </div>
                        </Td>
                        <Td className="font-semibold">{d.total}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border pb-3.5">
                <CardTitle className="text-sm">Training ↔ job role mismatch</CardTitle>
                <CardDescription className="mt-0.5">
                  Placed learners working in roles with low relevance to their training
                </CardDescription>
              </CardHeader>
              <Table minWidthClass="min-w-[480px]">
                <thead className="bg-muted/20">
                  <tr>
                    <Th>Course</Th>
                    <Th>Placed</Th>
                    <Th>Low relevance</Th>
                    <Th className="w-40">Share</Th>
                  </tr>
                </thead>
                <tbody>
                  {mismatch.map((m) => (
                    <tr key={m.course} className="transition-colors hover:bg-muted/30">
                      <Td className="font-medium">{m.course}</Td>
                      <Td>{m.total}</Td>
                      <Td>{m.low}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={m.lowShare}
                            indicatorClassName={m.lowShare > 20 ? 'bg-destructive' : 'bg-warning'}
                            className="flex-1"
                          />
                          <span className="w-9 text-[11px] font-semibold text-foreground">
                            {m.lowShare}%
                          </span>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            <Card>
              <CardHeader className="border-b border-border pb-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Recommendations</CardTitle>
                    <CardDescription className="mt-0.5">
                      Auto-generated from current gap data
                    </CardDescription>
                  </div>
                  <Lightbulb className="size-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ol className="space-y-2.5">
                  {recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-xs leading-relaxed text-foreground/90"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {i + 1}
                      </span>
                      {r}
                    </li>
                  ))}
                  {recommendations.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Add skill-gap reports (e.g. via the learner profile) to generate
                      recommendations.
                    </p>
                  )}
                </ol>
              </CardContent>
            </Card>
          </div>
        </DataState>
      </div>
    </AppShell>
  )
}