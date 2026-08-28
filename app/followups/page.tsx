'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  PhoneCall,
  PhoneOff,
  CalendarClock,
  BellRing,
  Smartphone,
  Mail,
  MessageCircle,
  Phone,
  Zap,
  Loader2,
  Lock,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Field, TextInput, Select, TextArea } from '@/components/ui/field'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { Banner } from '@/components/ui/banner'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'
import { DataState } from '@/components/data-state'
import { ToneBadge } from '@/components/ui/tone-badge'
import { useProgramData } from '@/lib/use-program-data'
import {
  followUpBuckets,
  daysBetween,
  fmtDate,
  todayStr,
  displayName,
  consentActive,
  courseOf,
  providerOf,
  employmentStatus,
} from '@/lib/compute'
import type { ComputeDB } from '@/lib/compute-types'
import type { FollowUp, MergedLearner } from '@/lib/types'

const CHANNEL_ICON: Record<string, typeof Phone> = {
  Call: Phone,
  SMS: Smartphone,
  WhatsApp: MessageCircle,
  IVR: Zap,
  Email: Mail,
  'Field visit': PhoneCall,
}

function ContactModal({
  fu,
  db,
  onClose,
  onSaved,
}: {
  fu: FollowUp | null
  db: ComputeDB
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const { show, node } = useToast()
  const learner = db.learners.find((l) => l.traineeId === fu?.traineeId)
  const [notes, setNotes] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [nextDate, setNextDate] = useState('')
  const [phone, setPhone] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [block, setBlock] = useState('')
  const [locationNote, setLocationNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!fu || !learner) return null
  const masked = !consentActive(learner)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/followups/${fu._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contacted',
          notes,
          employmentStatus,
          nextDate: nextDate || undefined,
          phone: phone || undefined,
          alternatePhone: altPhone || undefined,
          block: block || undefined,
          locationNote,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not log contact')
      show(
        `Follow-up completed${employmentStatus ? ` · status updated to ${employmentStatus}` : ''}`
      )
      onClose()
      await onSaved()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not log contact', 'error')
    } finally {
      setSaving(false)
    }
  }

  const learnerRef = learner as MergedLearner

  return (
    <Modal open onClose={onClose} wide title="Log contact" sub={`${displayName(learnerRef)} · ${fu.reason}`}>
      {node}
      {masked && (
        <Banner tone="warn" className="mb-3">
          Consent is {learnerRef.consentStatus} — avoid sharing personal details on this call.
        </Banner>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Current employment status (quick update)">
          <Select
            value={employmentStatus}
            onChange={setEmploymentStatus}
            placeholder="No change"
            options={[
              'Employed',
              'Self-employed',
              'Unemployed',
              'Apprentice',
              'Higher education',
              'In training',
            ].map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Schedule next follow-up">
          <TextInput type="date" value={nextDate} onChange={setNextDate} />
        </Field>
        <Field label="Call notes" className="sm:col-span-2">
          <TextArea
            value={notes}
            onChange={setNotes}
            placeholder="What did the learner say?"
            rows={2}
          />
        </Field>
      </div>

      <details className="mt-3 rounded-lg border border-border px-4 py-3">
        <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
          Contact / location changed? (optional)
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="New phone">
            <TextInput value={phone} onChange={setPhone} placeholder={masked ? 'hidden (no consent)' : learnerRef.phone} />
          </Field>
          <Field label="Alternate phone">
            <TextInput value={altPhone} onChange={setAltPhone} placeholder="Add alternate number" />
          </Field>
          <Field label="New block / area">
            <TextInput value={block} onChange={setBlock} placeholder={learnerRef.block} />
          </Field>
          <Field label="Reason">
            <TextInput value={locationNote} onChange={setLocationNote} placeholder="e.g. relocated for family work" />
          </Field>
        </div>
      </details>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
          Mark contacted
        </Button>
      </div>
    </Modal>
  )
}

function FollowUpCard({
  fu,
  db,
  onContact,
  onUnreachable,
  onReschedule,
}: {
  fu: FollowUp
  db: ComputeDB
  onContact: (fu: FollowUp) => void
  onUnreachable: (fu: FollowUp) => void
  onReschedule: (fu: FollowUp) => void
}) {
  const learner = db.learners.find((l) => l.traineeId === fu.traineeId)
  if (!learner) return null
  const st = employmentStatus(db, learner.traineeId)
  const overdue = fu.status === 'scheduled' && fu.dueDate < todayStr()
  const ChannelIcon = CHANNEL_ICON[fu.channel || 'Call'] || Phone
  const masked = !consentActive(learner)

  return (
    <div className={`border-b border-border/60 px-5 py-4 last:border-b-0 ${overdue ? 'bg-destructive/5' : ''}`}>
      <div className="flex items-start gap-3">
        {masked ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <Lock className="size-3.5" aria-hidden="true" />
          </div>
        ) : (
          <Avatar name={learner.name} />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              href={`/learners/${learner.traineeId}`}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {displayName(learner)}
            </Link>
            <ToneBadge tone={st.color}>{st.label}</ToneBadge>
            {overdue && (
              <Badge variant="destructive">
                {Math.abs(daysBetween(fu.dueDate, todayStr()))}d overdue
              </Badge>
            )}
            {fu.dueDate === todayStr() && (
              <Badge variant="warning">due today</Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {courseOf(db, learner.traineeId)?.name} · {providerOf(db, learner.traineeId)?.name} ·{' '}
            {learner.district}
          </p>
          <p className="mt-1.5 text-xs text-foreground">
            <span className="font-medium">Reason:</span> {fu.reason}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ChannelIcon className="size-3.5" />
              prefers {fu.channel}
            </span>
            <span>
              Attempts: <b className="text-foreground">{fu.contactAttemptCount}</b>
            </span>
            <span>
              Due: <b className={overdue ? 'text-destructive' : 'text-foreground'}>{fmtDate(fu.dueDate)}</b>
            </span>
            {fu.nextActionDate ? <span>Next: {fmtDate(fu.nextActionDate)}</span> : null}
            <span>{fu.assignedTo}</span>
          </div>
          {fu.notes ? (
            <p className="mt-1.5 rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11.5px] italic text-muted-foreground">
              “{fu.notes}”
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-1.5">
          {fu.status !== 'completed' ? (
            <>
              <Button size="sm" onClick={() => onContact(fu)}>
                <PhoneCall className="size-3.5" />
                Contacted
              </Button>
              <Button size="sm" variant="outline" onClick={() => onUnreachable(fu)}>
                <PhoneOff className="size-3.5" />
                Unreachable
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReschedule(fu)}>
                <CalendarClock className="size-3.5" />
                Reschedule
              </Button>
            </>
          ) : (
            <Badge variant="success">completed {fu.completedAt ? fmtDate(fu.completedAt) : ''}</Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FollowUpsPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const { show, node } = useToast()
  const [tab, setTab] = useState('overdue')
  const [contactFu, setContactFu] = useState<FollowUp | null>(null)
  const [reschedFu, setReschedFu] = useState<FollowUp | null>(null)
  const [reschedDate, setReschedDate] = useState('')
  const [saving, setSaving] = useState(false)

  const buckets = useMemo(() => followUpBuckets(db), [db])

  const tabs: TabItem[] = [
    { id: 'overdue', label: 'Overdue', count: buckets.overdue.length },
    { id: 'today', label: 'Due today', count: buckets.today.length },
    { id: 'upcoming', label: 'Upcoming', count: buckets.upcoming.length },
    { id: 'completed', label: 'Recently completed', count: buckets.completed.length },
  ]
  const list = buckets[tab as keyof typeof buckets] || []

  // Simulated multi-channel reminder feed built from the follow-up queue,
  // mirroring the Source's automated reminder simulation.
  const reminders = useMemo(() => {
    const channels = db.settings?.notificationRules?.channels?.length
      ? db.settings.notificationRules.channels
      : ['SMS', 'WhatsApp', 'Email', 'IVR']
    const rows: { id: string; traineeId: string; channel: string; sendDate: string; status: string }[] = []
    db.followUps
      .slice()
      .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''))
      .forEach((f, i) => {
        const ch = channels[i % channels.length]
        const sendDate = (() => {
          const d = new Date(f.dueDate + 'T12:00:00Z')
          d.setUTCDate(d.getUTCDate() - 1)
          return d.toISOString().slice(0, 10)
        })()
        rows.push({
          id: `R-${f._id}`,
          traineeId: f.traineeId,
          channel: ch,
          sendDate,
          status: sendDate <= todayStr() ? 'sent' : 'scheduled',
        })
      })
    return rows.slice(0, 8)
  }, [db.followUps, db.settings])

  const markUnreachable = async (fu: FollowUp) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/followups/${fu._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unreachable', note: 'Learner unreachable on call.' }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not update follow-up')
      show('Marked unreachable — retry scheduled in 7 days', 'info')
      await refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not update follow-up', 'error')
    } finally {
      setSaving(false)
    }
  }

  const saveReschedule = async () => {
    if (!reschedFu || !reschedDate) return
    setSaving(true)
    try {
      const res = await fetch(`/api/followups/${reschedFu._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', date: reschedDate }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not reschedule follow-up')
      show(`Rescheduled to ${fmtDate(reschedDate)}`)
      setReschedFu(null)
      await refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not reschedule follow-up', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Field Operations • Contact Queue"
        title="Follow-up Queue"
        description="Longitudinal tracking lives here — one call per learner keeps outcomes fresh. Overdue, today, upcoming and recently completed contacts, with quick employment-status updates and contact corrections."
      />
      {node}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <div className="border-b border-border px-5 py-4">
                  <Tabs tabs={tabs} active={tab} onChange={setTab} />
                </div>
                {list.length ? (
                  list.map((fu) => (
                    <FollowUpCard
                      key={fu._id}
                      fu={fu}
                      db={db}
                      onContact={setContactFu}
                      onUnreachable={(f) => void markUnreachable(f)}
                      onReschedule={(f) => {
                        setReschedFu(f)
                        setReschedDate(f.dueDate)
                      }}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={tab === 'completed' ? PhoneCall : CalendarClock}
                    title={
                      tab === 'overdue'
                        ? 'Nothing overdue — great job!'
                        : tab === 'today'
                          ? 'No follow-ups due today'
                          : tab === 'upcoming'
                            ? 'No upcoming follow-ups scheduled'
                            : 'No completed follow-ups yet'
                    }
                    hint="Follow-ups are created automatically when outcomes are recorded with the follow-up flag, or manually via the learners registry."
                  />
                )}
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="border-b border-border pb-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Automated reminders</CardTitle>
                      <CardDescription className="mt-0.5">
                        Simulated multi-channel nudges
                      </CardDescription>
                    </div>
                    <Badge variant="neutral">simulated</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 pt-4">
                  {reminders.length === 0 && (
                    <p className="text-xs text-muted-foreground">No scheduled reminders yet.</p>
                  )}
                  {reminders.map((r) => {
                    const learner = db.learners.find((l) => l.traineeId === r.traineeId)
                    const Icon = CHANNEL_ICON[r.channel] || Smartphone
                    return (
                      <div
                        key={r.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/20 px-3 py-2.5"
                      >
                        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-foreground">
                            {learner ? displayName(learner) : r.traineeId} · {r.channel}
                          </div>
                          <div className="text-[10.5px] text-muted-foreground">
                            {fmtDate(r.sendDate)} · {r.status}
                          </div>
                        </div>
                        <ToneBadge tone={r.status === 'sent' ? 'emerald' : 'amber'}>
                          <BellRing className="size-3" />
                          {r.status}
                        </ToneBadge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              <Card className="border-warning/25 bg-warning/5">
                <CardContent className="p-4 text-xs leading-relaxed text-warning">
                  <p className="font-semibold">Why follow-ups matter</p>
                  <p className="mt-1 opacity-90">
                    Every contacted call can refresh a learner's employment status and income in one
                    step — keeping retention and wage-progression metrics honest.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <ContactModal
            fu={contactFu}
            db={db}
            onClose={() => setContactFu(null)}
            onSaved={refresh}
          />

          <Modal
            open={!!reschedFu}
            onClose={() => setReschedFu(null)}
            title="Reschedule follow-up"
            sub={reschedFu ? db.learners.find((l) => l.traineeId === reschedFu.traineeId)?.name : ''}
          >
            <div className="flex flex-col gap-3">
              <Field label="New due date">
                <TextInput type="date" value={reschedDate} onChange={setReschedDate} />
              </Field>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setReschedFu(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={() => void saveReschedule()} disabled={saving || !reschedDate}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
                  Reschedule
                </Button>
              </div>
            </div>
          </Modal>
        </DataState>
      </div>
    </AppShell>
  )
}