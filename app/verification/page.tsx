'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, ShieldAlert, Flag, FileSearch } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, Th, Td } from '@/components/ui/table'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { ToneBadge } from '@/components/ui/tone-badge'
import { DataState } from '@/components/data-state'
import { VerificationActionModal, type VerificationActionMode } from '@/components/verification-action-modal'
import { useProgramData } from '@/lib/use-program-data'
import { consentActive, displayName, fmtDate, fmtMoney } from '@/lib/compute'
import type { EmployerVerification } from '@/lib/types'

const STATUS_TONE: Record<string, string> = {
  pending: 'sky',
  partially_verified: 'amber',
  employer_unreachable: 'orange',
  verified: 'emerald',
  rejected: 'rose',
}

export default function VerificationPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const [tab, setTab] = useState('pending')
  const [action, setAction] = useState<{ record: EmployerVerification; mode: VerificationActionMode } | null>(null)

  const grouped = useMemo(() => {
    const g: Record<string, EmployerVerification[]> = {
      pending: [],
      partially_verified: [],
      employer_unreachable: [],
      verified: [],
      rejected: [],
    }
    db.verifications.forEach((v) => (g[v.verificationStatus] || g.pending).push(v))
    Object.values(g).forEach((a) =>
      a.sort((x, y) => (y.startDate || '').localeCompare(x.startDate || ''))
    )
    return g
  }, [db.verifications])

  const tabs: TabItem[] = [
    { id: 'pending', label: 'Pending', count: grouped.pending.length },
    { id: 'partially_verified', label: 'Partially verified', count: grouped.partially_verified.length },
    { id: 'employer_unreachable', label: 'Unreachable', count: grouped.employer_unreachable.length },
    { id: 'verified', label: 'Verified', count: grouped.verified.length },
    { id: 'rejected', label: 'Rejected', count: grouped.rejected.length },
  ]
  const list = grouped[tab] || []
  const flaggedCount = db.verifications.filter((v) => v.flagged).length

  return (
    <AppShell>
      <PageHeader
        eyebrow="Employer Verification Cell"
        title="Employer Verification"
        description="Approve, reject, partially verify, request evidence, or flag duplicate/suspicious employer records. Verified placements feed the verified-placement-rate metric."
      />
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {grouped.pending.length + grouped.partially_verified.length + grouped.employer_unreachable.length}{' '}
                records awaiting action
              </h2>
              <p className="text-xs text-muted-foreground">
                Verified placements feed the “verified placement rate” metric
              </p>
            </div>
            {flaggedCount > 0 && (
              <Badge variant="destructive">
                <ShieldAlert className="size-3.5" />
                {flaggedCount} flagged as duplicate / suspicious
              </Badge>
            )}
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <Tabs tabs={tabs} active={tab} onChange={setTab} />
            </div>
            <Table minWidthClass="min-w-[1000px]">
              <thead className="bg-muted/20">
                <tr>
                  {['Employer', 'Learner', 'Job role', 'Start date', 'Wage', 'Status', 'Method', 'Confidence', 'Verifier remarks', 'Actions'].map((h) => (
                    <Th key={h} className={h === 'Actions' ? 'text-right' : ''}>
                      {h}
                    </Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((v) => {
                  const learner = db.learners.find((l) => l.traineeId === v.traineeId)
                  const maskedLearner = learner && !consentActive(learner)
                  return (
                    <tr
                      key={v._id}
                      className={`transition-colors hover:bg-muted/30 ${
                        v.flagged ? 'bg-destructive/5' : ''
                      }`}
                    >
                      <Td className="font-medium text-foreground">
                        {v.employerName}
                        {v.flagged && (
                          <Badge variant="destructive" className="ml-1.5">
                            flagged
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        {learner ? (
                          <Link
                            href={`/learners/${learner.traineeId}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {displayName(learner)}
                          </Link>
                        ) : (
                          '—'
                        )}
                        {maskedLearner && (
                          <span className="ml-1 text-[10px] italic text-muted-foreground">
                            (masked)
                          </span>
                        )}
                      </Td>
                      <Td>{v.jobRole || '—'}</Td>
                      <Td>{fmtDate(v.startDate)}</Td>
                      <Td className="font-medium">{fmtMoney(v.wage)}</Td>
                      <Td>
                        <ToneBadge tone={STATUS_TONE[v.verificationStatus] || 'slate'}>
                          {v.verificationStatus.replace(/_/g, ' ')}
                        </ToneBadge>
                      </Td>
                      <Td>{v.verificationMethod || '—'}</Td>
                      <Td className="w-36">
                        {v.confidenceScore !== null && v.confidenceScore !== undefined ? (
                          <div>
                            <span className="text-[11.5px] font-semibold text-foreground">
                              {v.confidenceScore}%
                            </span>
                            <Progress
                              value={v.confidenceScore}
                              className="mt-1 h-1.5"
                              indicatorClassName={
                                v.confidenceScore >= 80
                                  ? 'bg-success'
                                  : v.confidenceScore >= 50
                                    ? 'bg-warning'
                                    : 'bg-destructive'
                              }
                            />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </Td>
                      <Td className="max-w-[220px] text-[11px] text-muted-foreground">
                        {v.verifierRemarks || '—'}
                        {v.verifiedBy && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground/70">
                            by {v.verifiedBy} · {fmtDate(v.verifiedAt)}
                          </div>
                        )}
                      </Td>
                      <Td className="whitespace-nowrap text-right">
                        {['pending', 'partially_verified', 'employer_unreachable'].includes(
                          v.verificationStatus
                        ) ? (
                          <div className="inline-flex gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => setAction({ record: v, mode: 'approve' })}
                            >
                              <BadgeCheck className="size-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setAction({ record: v, mode: 'reject' })}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Request more evidence"
                              onClick={() => setAction({ record: v, mode: 'evidence' })}
                            >
                              <FileSearch className="size-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Flag duplicate / suspicious"
                              onClick={() => setAction({ record: v, mode: 'flag' })}
                            >
                              <Flag className="size-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="inline-flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAction({ record: v, mode: 'evidence' })}
                            >
                              Re-open
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Flag duplicate / suspicious"
                              onClick={() => setAction({ record: v, mode: 'flag' })}
                            >
                              <Flag className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            {!list.length && (
              <EmptyState
                icon={BadgeCheck}
                title="Nothing here"
                hint="Records move between tabs as verifiers act on them."
              />
            )}
          </Card>

          {action && (
            <VerificationActionModal
              open={!!action}
              onClose={() => setAction(null)}
              record={action.record}
              mode={action.mode}
              onSaved={refresh}
            />
          )}
        </DataState>
      </div>
    </AppShell>
  )
}