'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Plus,
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Phone,
  StickyNote,
  Clock,
  Loader2,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Field, TextInput } from '@/components/ui/field'
import { Avatar } from '@/components/ui/avatar'
import { Banner } from '@/components/ui/banner'
import { KV } from '@/components/ui/kv'
import { ToneBadge } from '@/components/ui/tone-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'
import { DataState } from '@/components/data-state'
import { AddOutcomeModal } from '@/components/add-outcome-modal'
import { ConsentModal, FollowUpScheduleModal } from '@/components/learner-modals'
import { useProgramData } from '@/lib/use-program-data'
import {
  consentActive,
  displayName,
  employmentStatus,
  enrollmentFor,
  providerOf,
  courseOf,
  eventsFor,
  followUpsFor,
  verificationsFor,
  skillGapsFor,
  learnerTimeline,
  currentMonthlyIncome,
  fmtDate,
  fmtMoney,
  todayStr,
  daysBetween,
} from '@/lib/compute'
import type { ComputeDB } from '@/lib/compute-types'
import type { MergedLearner } from '@/lib/types'

interface NoteDraft {
  open: boolean
  value: string
}
interface ContactDraft {
  open: boolean
  phone: string
  alt: string
  block: string
  note: string
}

export default function LearnerProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const { show, node } = useToast()
  const [outcomeOpen, setOutcomeOpen] = useState(false)
  const [fuOpen, setFuOpen] = useState(false)
  const [consentOpen, setConsentOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState<NoteDraft>({ open: false, value: '' })
  const [contactDraft, setContactDraft] = useState<ContactDraft>({
    open: false,
    phone: '',
    alt: '',
    block: '',
    note: '',
  })
  const [savingNote, setSavingNote] = useState(false)
  const [savingContact, setSavingContact] = useState(false)

  const learner = db.learners.find((l) => l.traineeId === id)

  const timeline = useMemo(
    () => (learner ? learnerTimeline(db, learner.traineeId) : []),
    [db, learner]
  )

  if (!learner) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Learner Registry"
          title="Learner Profile"
          description="A single longitudinal record for one learner."
        />
        <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8">
          <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Learner not found{id ? ` (ID: ${id})` : ''}.
              </p>
              <Link href="/learners">
                <Button className="mt-4" variant="outline">
                  Back to learners
                </Button>
              </Link>
            </Card>
          </DataState>
        </div>
      </AppShell>
    )
  }

  const masked = !consentActive(learner)
  const st = employmentStatus(db, learner.traineeId)
  const e = enrollmentFor(db, learner.traineeId)
  const evts = eventsFor(db, learner.traineeId)
  const fus = followUpsFor(db, learner.traineeId)
  const vers = verificationsFor(db, learner.traineeId)
  const gaps = skillGapsFor(db, learner.traineeId)
  const employmentHistory = evts.filter((o) =>
    ['wage_employment', 'job_change', 'self_employment', 'apprenticeship', 'wage_update'].includes(
      o.outcomeType
    )
  )
  const reasonEvents = evts.filter((o) => o.reasonCode)
  const income = currentMonthlyIncome(db, learner.traineeId)

  const saveNote = async () => {
    const value = noteDraft.value.trim()
    if (!value) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/learner-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: learner.traineeId,
          notes: [learner.notes, value].filter(Boolean).join('\n'),
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not add note')
      show('Note added')
      setNoteDraft({ open: false, value: '' })
      await refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not add note', 'error')
    } finally {
      setSavingNote(false)
    }
  }

  const openContact = () =>
    setContactDraft({
      open: true,
      phone: learner.phone || '',
      alt: learner.alternatePhone || '',
      block: learner.block || '',
      note: '',
    })

  const saveContact = async () => {
    setSavingContact(true)
    try {
      const res = await fetch('/api/learner-details', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: learner.traineeId,
          phone: contactDraft.phone || learner.phone,
          alternatePhone: contactDraft.alt,
          block: contactDraft.block || learner.block,
          phoneNote: contactDraft.note || learner.phoneNote,
          locationChanged: !!contactDraft.note,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not update contact')
      show('Contact & location updated')
      setContactDraft((d) => ({ ...d, open: false }))
      await refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not update contact', 'error')
    } finally {
      setSavingContact(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Learner Registry • Longitudinal Record"
        title="Learner Profile"
        description="Enrolment → training → certification → placement → follow-ups: the complete longitudinal record for a single learner, consent-respecting."
      />
      {node}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {!masked && <Avatar name={learner.name} size="lg" />}
              <div>
                <h2 className="flex items-center gap-2 font-heading text-lg sm:text-xl font-semibold text-foreground">
                  {displayName(learner)}
                  {masked && <Lock className="size-4 text-muted-foreground" />}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {learner.traineeId} · {courseOf(db, learner.traineeId)?.name} ·{' '}
                  {providerOf(db, learner.traineeId)?.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <ToneBadge tone={st.color}>{st.label}</ToneBadge>
                  <ToneBadge
                    tone={
                      learner.consentStatus === 'active'
                        ? 'emerald'
                        : learner.consentStatus === 'revoked'
                          ? 'rose'
                          : learner.consentStatus === 'expired'
                            ? 'amber'
                            : 'slate'
                    }
                  >
                    Consent: {learner.consentStatus}
                  </ToneBadge>
                  <ToneBadge tone="slate">
                    {learner.district}
                    {learner.block ? ` · ${learner.block}` : ''}
                  </ToneBadge>
                  {income !== null && <ToneBadge tone="lime">{fmtMoney(income)}/month</ToneBadge>}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setOutcomeOpen(true)}>
                <Plus className="size-4" />
                Add outcome
              </Button>
              <Button variant="outline" onClick={() => setFuOpen(true)}>
                <PhoneCall className="size-4" />
                Follow-up
              </Button>
              <Button variant="outline" onClick={() => setConsentOpen(true)}>
                <ShieldCheck className="size-4" />
                Consent
              </Button>
            </div>
          </div>

          {masked && (
            <Banner
              tone={learner.consentStatus === 'revoked' ? 'danger' : 'warn'}
              icon={ShieldAlert}
              title={`Privacy protection active — consent is ${learner.consentStatus}`}
            >
              Personal details (name, phone, email, exact location) are hidden for this learner.
              {learner.consentStatus === 'revoked'
                ? ' The learner has opted out of direct contact.'
                : learner.consentStatus === 'expired'
                  ? ' Renew consent to resume full tracking.'
                  : ' Collect consent during the next field visit or call.'}{' '}
              {learner.consentStatus !== 'revoked' && (
                <button
                  type="button"
                  className="ml-1 font-semibold underline"
                  onClick={() => setConsentOpen(true)}
                >
                  Update consent →
                </button>
              )}
            </Banner>
          )}

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Timeline */}
            <Card className="lg:col-span-3">
              <CardHeader className="border-b border-border pb-3.5">
                <CardTitle>Learner timeline</CardTitle>
                <CardDescription className="mt-0.5">
                  {timeline.length} events · enrolment → training → placement → follow-ups
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[640px] overflow-y-auto pt-5">
                {timeline.length === 0 && (
                  <p className="text-xs text-muted-foreground">No events yet.</p>
                )}
                <div className="relative">
                  {timeline.map((t, i) => (
                    <div key={`${t.date}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                      {i < timeline.length - 1 && (
                        <div className="absolute bottom-0 left-[15px] top-8 w-px bg-border" />
                      )}
                      <div
                        className={`z-10 flex size-8 shrink-0 items-center justify-center rounded-full ${t.color || 'bg-muted'} text-sm text-white shadow-soft ring-4 ring-card`}
                      >
                        {t.icon}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[13px] font-semibold text-foreground">
                            {t.title}
                          </span>
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {fmtDate(t.date)}
                          </span>
                          {t.date > todayStr() && <Badge variant="default">scheduled</Badge>}
                        </div>
                        {t.desc && (
                          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                            {t.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Right column */}
            <div className="space-y-4 lg:col-span-2">
              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Basic profile</CardTitle>
                    <button
                      type="button"
                      onClick={openContact}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Edit contact
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4">
                  <KV label="Phone" masked={masked}>
                    +91 {learner.phone}
                  </KV>
                  <KV label="Alternate phone" masked={masked}>
                    {learner.alternatePhone ? `+91 ${learner.alternatePhone}` : '—'}
                  </KV>
                  <KV label="Email" masked={masked}>
                    {learner.email}
                  </KV>
                  <KV label="District / Block">{learner.district}{learner.block ? ` · ${learner.block}` : ''}</KV>
                  <KV label="Gender">{learner.gender || '—'}</KV>
                  <KV label="Category">{learner.category || '—'}</KV>
                  <KV label="Record updated">
                    {fmtDate(learner.updatedAt)}{' '}
                    <span className="text-muted-foreground">
                      ({learner.updatedAt ? daysBetween(learner.updatedAt, todayStr()) : '—'} days ago)
                    </span>
                  </KV>
                  <KV label="Status">{learner.status === 'enrolled' ? 'In training' : 'Tracked'}</KV>
                </CardContent>
                {learner.phoneNote ? (
                  <div className="mx-5 mb-4 flex items-center gap-1.5 rounded-lg border border-warning/25 bg-warning/10 px-3 py-2 text-[11.5px] text-warning">
                    <Phone className="size-3.5 shrink-0" />
                    {learner.phoneNote}
                  </div>
                ) : null}
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm">Consent record</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4">
                  <KV label="Status">
                    <ToneBadge
                      tone={
                        learner.consentStatus === 'active'
                          ? 'emerald'
                          : learner.consentStatus === 'revoked'
                            ? 'rose'
                            : learner.consentStatus === 'expired'
                              ? 'amber'
                              : 'slate'
                      }
                    >
                      {learner.consentStatus}
                    </ToneBadge>
                  </KV>
                  <KV label="Consent date">{learner.consentDate ? fmtDate(learner.consentDate) : '—'}</KV>
                  <KV label="Method">{learner.consentMethod || '—'}</KV>
                  <KV label="Last updated">
                    {learner.consentLastUpdated ? fmtDate(learner.consentLastUpdated) : '—'}
                  </KV>
                  <KV label="Purposes" className="col-span-2">
                    {learner.consentPurpose?.length ? (
                      <span className="mt-1 inline-flex flex-wrap gap-1">
                        {learner.consentPurpose.map((p) => (
                          <ToneBadge key={p} tone="emerald">
                            {p}
                          </ToneBadge>
                        ))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </KV>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm">Enrolment details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 pt-4">
                  <KV label="Batch">
                    <span className="font-mono text-[11.5px]">{e?.batchName}</span>
                  </KV>
                  <KV label="Enrolled">{e ? fmtDate(e.enrollmentDate) : '—'}</KV>
                  <KV label="Training period">
                    {e ? `${fmtDate(e.trainingStartDate)} → ${fmtDate(e.trainingEndDate)}` : '—'}
                  </KV>
                  <KV label="Assessment">{e?.assessmentStatus || '—'}</KV>
                  <KV label="Certification">{e?.certificationStatus || '—'}</KV>
                  <KV label="Sector">
                    {courseOf(db, learner.traineeId)?.name}
                  </KV>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm">Employment & income history</CardTitle>
                  <CardDescription className="mt-0.5">
                    Longitudinal record — not just latest placement
                  </CardDescription>
                </CardHeader>
                <div>
                  {employmentHistory.length === 0 && (
                    <p className="px-5 py-4 text-xs text-muted-foreground">
                      No employment records yet.
                    </p>
                  )}
                  {employmentHistory.map((o) => (
                    <div
                      key={o._id}
                      className="flex items-start justify-between gap-2 border-b border-border/60 px-5 py-2.5 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-foreground">
                          {o.employerName || o.selfEmploymentBusinessName || 'Wage update'}
                          {o.jobRole ? ` — ${o.jobRole}` : o.selfEmploymentNature ? ` — ${o.selfEmploymentNature}` : ''}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground">
                          {fmtDate(o.eventDate)} ·{' '}
                          {o.outcomeType === 'wage_update' ? 'income revision' : o.employmentType || ''}
                          {o.relevanceToTraining ? ` · relevance: ${o.relevanceToTraining}` : ''}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs font-semibold text-success">
                        {fmtMoney(o.monthlyWage ?? o.selfEmploymentIncome)}
                        {(o.monthlyWage || o.selfEmploymentIncome) ? (
                          <span className="text-[9px] font-normal text-muted-foreground">/mo</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Verification status</CardTitle>
                    <Link
                      href="/verification"
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Verify →
                    </Link>
                  </div>
                </CardHeader>
                <div>
                  {vers.length === 0 && (
                    <p className="px-5 py-4 text-xs text-muted-foreground">
                      No employer verification needed for current status.
                    </p>
                  )}
                  {vers.map((v) => (
                    <div
                      key={v._id}
                      className="border-b border-border/60 px-5 py-2.5 last:border-b-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-foreground">{v.employerName}</span>
                        <ToneBadge
                          tone={
                            v.verificationStatus === 'verified'
                              ? 'emerald'
                              : v.verificationStatus === 'rejected'
                                ? 'rose'
                                : v.verificationStatus === 'partially_verified'
                                  ? 'amber'
                                  : 'sky'
                          }
                        >
                          {v.verificationStatus.replace(/_/g, ' ')}
                        </ToneBadge>
                      </div>
                      <div className="mt-0.5 text-[10.5px] text-muted-foreground">
                        {v.jobRole} · {fmtMoney(v.wage)}/mo
                        {v.confidenceScore ? ` · confidence ${v.confidenceScore}%` : ''}
                        {v.verifierRemarks ? ` · “${v.verifierRemarks}”` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm">Skill gaps & reason codes</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {gaps.length ? (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {gaps.map((g) => (
                        <ToneBadge
                          key={g._id}
                          tone={g.severity === 'high' ? 'rose' : g.severity === 'medium' ? 'amber' : 'slate'}
                        >
                          {g.skillName} · {g.reportedBy}
                        </ToneBadge>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-3 text-xs text-muted-foreground">No skill gaps reported.</p>
                  )}
                  {reasonEvents.length ? (
                    reasonEvents.map((r, i) => (
                      <div key={i} className="mt-2 flex gap-1.5 text-[11.5px] text-muted-foreground">
                        <ToneBadge tone="orange">{r.reasonCode}</ToneBadge>
                        <span>
                          {ST_REASON_LABEL[r.outcomeType]} · {fmtDate(r.eventDate)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11.5px] text-muted-foreground">No non-placement reason codes.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Notes</CardTitle>
                    <button
                      type="button"
                      onClick={() => setNoteDraft({ open: true, value: '' })}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      Add note
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {learner.notes
                    ? learner.notes.split('\n').filter((n) => n.trim()).map((n, i) => (
                        <p
                          key={i}
                          className="mb-1.5 flex gap-1.5 text-xs leading-relaxed text-muted-foreground"
                        >
                          <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
                          {n}
                        </p>
                      ))
                    : (
                      <p className="text-xs text-muted-foreground">No notes yet.</p>
                    )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-sm">Contact history</CardTitle>
                  <CardDescription className="mt-0.5">
                    {fus.length} follow-ups
                  </CardDescription>
                </CardHeader>
                <div>
                  {fus.length === 0 && (
                    <p className="px-5 py-4 text-xs text-muted-foreground">No follow-ups yet.</p>
                  )}
                  {fus.map((f) => (
                    <div
                      key={f._id}
                      className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-2.5 last:border-b-0"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {f.reason}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground">
                          {f.channel} · due {fmtDate(f.dueDate)}
                          {f.contactAttemptCount ? ` · ${f.contactAttemptCount} attempt(s)` : ''}
                        </div>
                      </div>
                      <Badge
                        variant={
                          f.status === 'completed'
                            ? 'success'
                            : f.dueDate < todayStr()
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {f.status === 'completed'
                          ? 'done'
                          : f.dueDate < todayStr()
                            ? 'overdue'
                            : 'scheduled'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <AddOutcomeModal
            open={outcomeOpen}
            onClose={() => setOutcomeOpen(false)}
            learner={learner}
            db={db}
            onSaved={refresh}
          />
          {fuOpen && (
            <FollowUpScheduleModal
              open={fuOpen}
              onClose={() => setFuOpen(false)}
              learner={learner}
              onSaved={refresh}
            />
          )}
          {consentOpen && (
            <ConsentModal
              open={consentOpen}
              onClose={() => setConsentOpen(false)}
              learner={learner}
              onSaved={refresh}
            />
          )}

          <Modal
            open={noteDraft.open}
            onClose={() => setNoteDraft((d) => ({ ...d, open: false }))}
            title="Add note"
            sub={learner.name}
          >
            <div className="flex flex-col gap-3">
              <Field label="Note">
                <textarea
                  rows={4}
                  value={noteDraft.value}
                  onChange={(e) => setNoteDraft((d) => ({ ...d, value: e.target.value }))}
                  placeholder="Context that helps the next person who calls…"
                  className="min-h-[90px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                />
              </Field>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setNoteDraft((d) => ({ ...d, open: false }))}
                  disabled={savingNote}
                >
                  Cancel
                </Button>
                <Button onClick={() => void saveNote()} disabled={savingNote || !noteDraft.value.trim()}>
                  {savingNote ? <Loader2 className="size-4 animate-spin" /> : <StickyNote className="size-4" />}
                  Save note
                </Button>
              </div>
            </div>
          </Modal>

          <Modal
            open={contactDraft.open}
            onClose={() => setContactDraft((d) => ({ ...d, open: false }))}
            title="Update contact & location"
            sub={learner.name}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone">
                <TextInput
                  value={contactDraft.phone}
                  onChange={(v) => setContactDraft((d) => ({ ...d, phone: v }))}
                />
              </Field>
              <Field label="Alternate phone">
                <TextInput
                  value={contactDraft.alt}
                  onChange={(v) => setContactDraft((d) => ({ ...d, alt: v }))}
                />
              </Field>
              <Field label="Block / area">
                <TextInput
                  value={contactDraft.block}
                  onChange={(v) => setContactDraft((d) => ({ ...d, block: v }))}
                />
              </Field>
              <Field label="Reason for change">
                <TextInput
                  value={contactDraft.note}
                  onChange={(v) => setContactDraft((d) => ({ ...d, note: v }))}
                  placeholder="e.g. learner relocated"
                />
              </Field>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setContactDraft((d) => ({ ...d, open: false }))}
                disabled={savingContact}
              >
                Cancel
              </Button>
              <Button onClick={() => void saveContact()} disabled={savingContact}>
                {savingContact ? <Loader2 className="size-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </Modal>
        </DataState>
      </div>
    </AppShell>
  )
}

const ST_REASON_LABEL: Record<string, string> = {
  dropout: 'Dropped out',
  unemployed: 'Unemployed',
  not_placed: 'Not placed',
}