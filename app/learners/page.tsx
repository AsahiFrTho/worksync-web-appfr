'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  Plus,
  PhoneCall,
  ShieldCheck,
  Lock,
  UserCheck,
  ArrowUpDown,
  Loader2,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, Th, Td } from '@/components/ui/table'
import { SearchInput, Select } from '@/components/ui/field'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'
import { DataState } from '@/components/data-state'
import { ToneBadge } from '@/components/ui/tone-badge'
import { AddOutcomeModal } from '@/components/add-outcome-modal'
import { ConsentModal, FollowUpScheduleModal } from '@/components/learner-modals'
import { useProgramData } from '@/lib/use-program-data'
import {
  employmentStatus,
  enrollmentFor,
  providerOf,
  courseOf,
  consentActive,
  displayName,
  followUpsFor,
  verificationsFor,
  fmtDate,
  daysBetween,
  todayStr,
} from '@/lib/compute'
import type { ComputeDB } from '@/lib/compute-types'
import type { MergedLearner } from '@/lib/types'

function nextFollowUp(db: ComputeDB, traineeId: string) {
  return (
    followUpsFor(db, traineeId)
      .filter((f) => f.status === 'scheduled')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] || null
  )
}

function lastContact(db: ComputeDB, traineeId: string) {
  const done = followUpsFor(db, traineeId)
    .filter((f) => f.status === 'completed')
    .map((f) => f.completedAt || f.dueDate)
  const learner = db.learners.find((l) => l.traineeId === traineeId)
  const updates = [learner?.updatedAt, learner?.consentLastUpdated, ...done]
    .filter(Boolean)
    .sort()
  return updates[updates.length - 1] || null
}

export default function LearnersPage() {
  const router = useRouter()
  const { db, data, loading, error, seeded, refresh, seed } = useProgramData()
  const { show, node } = useToast()
  const [search, setSearch] = useState('')
  const [consentFilter, setConsentFilter] = useState('all')
  const [sortKey, setSortKey] = useState('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [outcomeModal, setOutcomeModal] = useState<MergedLearner | null>(null)
  const [consentModal, setConsentModal] = useState<MergedLearner | null>(null)
  const [fuModal, setFuModal] = useState<MergedLearner | null>(null)
  const [markingId, setMarkingId] = useState<string | null>(null)

  const rows = useMemo(() => {
    const t = search.toLowerCase()
    let list = db.learners.filter(
      (l) =>
        (!t || l.name.toLowerCase().includes(t) || l.traineeId.toLowerCase().includes(t)) &&
        (consentFilter === 'all' || l.consentStatus === consentFilter)
    )
    const val = (l: MergedLearner) => {
      switch (sortKey) {
        case 'name':
          return displayName(l)
        case 'course':
          return courseOf(db, l.traineeId)?.name || ''
        case 'provider':
          return providerOf(db, l.traineeId)?.name || ''
        case 'district':
          return l.district
        case 'outcome':
          return employmentStatus(db, l.traineeId).label
        case 'contact':
          return lastContact(db, l.traineeId) || ''
        case 'followup':
          return nextFollowUp(db, l.traineeId)?.dueDate || '9999'
        default:
          return l.traineeId
      }
    }
    return [...list].sort((a, b) => {
      const va = val(a)
      const vb = val(b)
      const c = String(va).localeCompare(String(vb), undefined, { numeric: true })
      return sortAsc ? c : -c
    })
  }, [db, search, consentFilter, sortKey, sortAsc])

  const th = (key: string | null, label: string) => (
    <Th
      className={`${key ? 'cursor-pointer select-none hover:text-foreground' : ''} ${sortKey === key ? 'text-primary' : ''}`}
      onClick={
        key
          ? () => {
              if (sortKey === key) setSortAsc(!sortAsc)
              else {
                setSortKey(key)
                setSortAsc(true)
              }
            }
          : undefined
      }
    >
      {label}{' '}
      {sortKey === key && <ArrowUpDown className="inline size-3 text-primary" />}
    </Th>
  )

  const markContacted = async (l: MergedLearner) => {
    setMarkingId(l.traineeId)
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: l.traineeId,
          dueDate: todayStr(),
          channel: 'Call',
          reason: 'Quick contact logged',
          assignedTo: 'Coordinator',
        }),
      })
      const json = await res.json()
      // Mark instantly completed so it lands in the completed bucket
      if (json.success && json.followUp?._id) {
        await fetch(`/api/followups/${json.followUp._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'contacted', notes: 'Quick contact logged' }),
        })
        show(`${displayName(l)} marked as contacted today`)
        await refresh()
      } else {
        throw new Error(json.error || 'Could not mark contacted')
      }
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not mark contacted', 'error')
    } finally {
      setMarkingId(null)
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Learner Registry • Consent-First Records"
        title="Learners"
        description="Searchable, sortable registry of every programme learner — consent status, enrolment, latest outcome, follow-up and verification state in one table. Click a row to open the full profile."
      />
      {node}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {rows.length} learners
              </h2>
              <p className="text-xs text-muted-foreground">
                Click a row to open the full profile
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search name or ID…"
                className="w-64"
              />
              <Select
                value={consentFilter}
                onChange={setConsentFilter}
                placeholder="All consent"
                options={['all', 'active', 'expired', 'revoked', 'missing']
                  .filter((v) => v !== 'all')
                  .map((s) => ({
                    value: s,
                    label: s[0].toUpperCase() + s.slice(1),
                  }))}
              />
            </div>
          </div>

          <Card className="overflow-hidden">
            <Table minWidthClass="min-w-[1150px]">
              <thead className="bg-muted/20">
                <tr>
                  {th('id', 'Learner ID')}
                  {th('name', 'Name')}
                  {th(null, 'Consent')}
                  {th('course', 'Course')}
                  {th('provider', 'Provider')}
                  {th('district', 'District')}
                  {th(null, 'Batch')}
                  {th('outcome', 'Latest outcome')}
                  {th('contact', 'Last contact')}
                  {th('followup', 'Next follow-up')}
                  {th(null, 'Verification')}
                  {th(null, 'Actions')}
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => {
                  const st = employmentStatus(db, l.traineeId)
                  const e = enrollmentFor(db, l.traineeId)
                  const nf = nextFollowUp(db, l.traineeId)
                  const lc = lastContact(db, l.traineeId)
                  const vers = verificationsFor(db, l.traineeId)
                  const latestVer = [...vers].sort((a, b) =>
                    (b.verifiedAt || b.startDate || '').localeCompare(
                      a.verifiedAt || a.startDate || ''
                    )
                  )[0]
                  const masked = !consentActive(l)
                  const overdue = nf && nf.dueDate < todayStr()
                  return (
                    <tr
                      key={l.traineeId}
                      onClick={(ev) => {
                        if (!(ev.target as HTMLElement).closest('a, button')) {
                          router.push(`/learners/${l.traineeId}`)
                        }
                      }}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <Td className="font-medium text-foreground">{l.traineeId}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {!masked && <Avatar name={l.name} size="sm" />}
                          <div>
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              {displayName(l)}
                              {masked && (
                                <Lock className="size-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-[10.5px] text-muted-foreground">
                              {l.gender || '—'} · {l.category || '—'}
                            </div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <ToneBadge
                          tone={
                            l.consentStatus === 'active'
                              ? 'emerald'
                              : l.consentStatus === 'revoked'
                                ? 'rose'
                                : l.consentStatus === 'expired'
                                  ? 'amber'
                                  : 'slate'
                          }
                        >
                          {l.consentStatus}
                        </ToneBadge>
                      </Td>
                      <Td>{courseOf(db, l.traineeId)?.name || '—'}</Td>
                      <Td className="text-[11.5px]">{providerOf(db, l.traineeId)?.name || '—'}</Td>
                      <Td>{l.district}</Td>
                      <Td className="font-mono text-[11px]">{e?.batchName || '—'}</Td>
                      <Td>
                        <ToneBadge tone={st.color}>{st.label}</ToneBadge>
                      </Td>
                      <Td>{lc ? fmtDate(lc) : '—'}</Td>
                      <Td>
                        {nf ? (
                          <span className={overdue ? 'font-medium text-destructive' : 'text-foreground'}>
                            {fmtDate(nf.dueDate)}
                            {overdue && ' · overdue'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </Td>
                      <Td>
                        {latestVer ? (
                          <ToneBadge
                            tone={
                              latestVer.verificationStatus === 'verified'
                                ? 'emerald'
                                : latestVer.verificationStatus === 'rejected'
                                  ? 'rose'
                                  : latestVer.verificationStatus === 'partially_verified'
                                    ? 'amber'
                                    : latestVer.verificationStatus === 'employer_unreachable'
                                      ? 'orange'
                                      : 'sky'
                            }
                          >
                            {latestVer.verificationStatus.replace(/_/g, ' ')}
                          </ToneBadge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/50">Not needed</span>
                        )}
                      </Td>
                      <Td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          <Link
                            href={`/learners/${l.traineeId}`}
                            title="View profile"
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                          </Link>
                          <button
                            type="button"
                            title="Add outcome"
                            onClick={() => setOutcomeModal(l)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Schedule follow-up"
                            onClick={() => setFuModal(l)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <PhoneCall className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Update consent"
                            onClick={() => setConsentModal(l)}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <ShieldCheck className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            title="Mark as contacted"
                            onClick={() => void markContacted(l)}
                            disabled={markingId === l.traineeId}
                            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          >
                            {markingId === l.traineeId ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </Td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
            {!rows.length && (
              <EmptyState
                title="No learners match your search"
                hint="Try a different name or learner ID, or clear the consent filter."
              />
            )}
          </Card>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>
              <Lock className="mr-1 inline size-3" />
              Learners without active consent are pseudonymised across the app.
            </span>
            <span>{data.trainees.length} enrolled in registry</span>
          </div>

          <AddOutcomeModal
            open={!!outcomeModal}
            onClose={() => setOutcomeModal(null)}
            learner={outcomeModal}
            db={db}
            onSaved={refresh}
          />
          {consentModal && (
            <ConsentModal
              open={!!consentModal}
              onClose={() => setConsentModal(null)}
              learner={consentModal}
              onSaved={refresh}
            />
          )}
          {fuModal && (
            <FollowUpScheduleModal
              open={!!fuModal}
              onClose={() => setFuModal(null)}
              learner={fuModal}
              onSaved={refresh}
            />
          )}
        </DataState>
      </div>
    </AppShell>
  )
}