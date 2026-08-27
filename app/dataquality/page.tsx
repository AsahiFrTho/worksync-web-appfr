'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Table, Th, Td } from '@/components/ui/table'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { ToneBadge } from '@/components/ui/tone-badge'
import { DataState } from '@/components/data-state'
import { StatCard } from '@/components/stat-card'
import { useProgramData } from '@/lib/use-program-data'
import {
  dataQualityIssues,
  completenessScore,
  providerOf,
  courseOf,
  displayName,
} from '@/lib/compute'

const ISSUE_META: Record<
  string,
  { label: string; tone: string; hint: string }
> = {
  consent: {
    label: 'Missing / inactive consent',
    tone: 'rose',
    hint: 'Personal data stays hidden until consent is active',
  },
  outcome: {
    label: 'No outcome recorded',
    tone: 'amber',
    hint: 'Training completed but no outcome event exists',
  },
  phone: {
    label: 'Unreachable / outdated phone',
    tone: 'amber',
    hint: 'Contact attempts failing — find alternate contact',
  },
  employer: {
    label: 'Incomplete employer verification',
    tone: 'sky',
    hint: 'Placement claims without employer confirmation',
  },
  wage: {
    label: 'Missing wage information',
    tone: 'violet',
    hint: 'Employed but wage data never captured',
  },
  stale: {
    label: 'Not updated in 90+ days',
    tone: 'slate',
    hint: 'Record going cold — schedule a follow-up',
  },
}

export default function DataQualityPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const [tab, setTab] = useState('all')

  const issues = useMemo(() => dataQualityIssues(db), [db])
  const score = useMemo(() => completenessScore(db, db.learners), [db])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    Object.keys(ISSUE_META).forEach((k) => (c[k] = 0))
    issues.forEach((i) => {
      c[i.type] = (c[i.type] || 0) + 1
    })
    return c
  }, [issues])

  const list = tab === 'all' ? issues : issues.filter((i) => i.type === tab)
  const tabs: TabItem[] = [
    { id: 'all', label: 'All issues', count: issues.length },
    ...Object.entries(ISSUE_META).map(([id, m]) => ({
      id,
      label: m.label,
      count: counts[id],
    })),
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Data Hygiene • Audit Trail"
        title="Data Quality"
        description="Know what to fix next — incomplete data weakens every outcome number the programme reports. Each issue links straight to the workflow that fixes it."
      />
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Data completeness score"
              value={`${score}%`}
              icon={score >= 70 ? ShieldCheck : ShieldAlert}
              sublabel="across all learners"
            />
            <StatCard
              label="Open issues"
              value={String(issues.length)}
              icon={ShieldAlert}
              sublabel="across all categories"
            />
            <StatCard
              label="Learners affected"
              value={String(new Set(issues.map((i) => i.learner.traineeId)).size)}
              icon={ShieldAlert}
              sublabel="need attention"
            />
            <StatCard
              label="Consent-affected records"
              value={String(counts.consent || 0)}
              icon={ShieldCheck}
              sublabel="privacy cases"
            />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <Tabs tabs={tabs} active={tab} onChange={setTab} />
            </div>
            {tab !== 'all' && (
              <p className="px-5 pb-2 text-[11.5px] text-muted-foreground">
                {ISSUE_META[tab].hint}
              </p>
            )}
            <Table minWidthClass="min-w-[860px]">
              <thead className="bg-muted/20">
                <tr>
                  {['Issue', 'Learner', 'Course / Provider', 'Detail', 'Suggested action', ''].map(
                    (h) => (
                      <Th key={h} className={h === '' ? 'text-right' : ''}>
                        {h}
                      </Th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {list.map((i, idx) => (
                  <tr key={`${i.learner.traineeId}-${i.type}-${idx}`} className="transition-colors hover:bg-muted/30">
                    <Td>
                      <ToneBadge tone={ISSUE_META[i.type].tone}>
                        {ISSUE_META[i.type].label}
                      </ToneBadge>
                    </Td>
                    <Td>
                      <Link
                        href={`/learners/${i.learner.traineeId}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {displayName(i.learner)}
                      </Link>
                      <div className="text-[10.5px] text-muted-foreground">
                        {i.learner.traineeId}
                      </div>
                    </Td>
                    <Td className="text-[11.5px]">
                      {courseOf(db, i.learner.traineeId)?.name}
                      <div className="text-[10.5px] text-muted-foreground">
                        {providerOf(db, i.learner.traineeId)?.name}
                      </div>
                    </Td>
                    <Td className="text-[11.5px] text-muted-foreground">{i.detail}</Td>
                    <Td className="text-[11.5px]">{i.action}</Td>
                    <Td className="text-right">
                      <Link
                        href={
                          i.type === 'employer'
                            ? '/verification'
                            : i.type === 'consent'
                              ? `/learners/${i.learner.traineeId}`
                              : '/followups'
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        Fix <ArrowRight className="size-3" />
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {!list.length && (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No issues of this type — data is clean here. 🎉
              </div>
            )}
          </Card>

          <Card>
            <CardHeader className="border-b border-border pb-3.5">
              <CardTitle className="text-sm">Completeness by provider</CardTitle>
              <CardDescription className="mt-0.5">
                Share of learners with consent, outcomes, wages, verification and fresh updates
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3.5 pt-4">
              {[...new Set(db.learners.map((l) => l.trainingProvider).filter(Boolean))].map(
                (providerName) => {
                  const learners = db.learners.filter(
                    (l) => providerOf(db, l.traineeId)?.name === providerName
                  )
                  const s = completenessScore(db, learners)
                  return (
                    <div key={providerName}>
                      <div className="mb-1 flex items-center justify-between text-[11.5px]">
                        <span className="font-medium text-foreground">
                          {providerName}
                          <span className="text-muted-foreground">
                            {' '}
                            ({learners.length} learners)
                          </span>
                        </span>
                        <span className="font-semibold text-foreground">{s}%</span>
                      </div>
                      <Progress
                        value={s}
                        indicatorClassName={
                          s >= 70 ? 'bg-success' : s >= 50 ? 'bg-warning' : 'bg-destructive'
                        }
                      />
                    </div>
                  )
                }
              )}
            </CardContent>
          </Card>
        </DataState>
      </div>
    </AppShell>
  )
}