'use client'

import { useState } from 'react'
import { Loader2, ShieldCheck, PhoneCall } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Field, TextInput, Select } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ToneBadge } from '@/components/ui/tone-badge'
import { todayStr } from '@/lib/compute'
import type { ConsentStatus, MergedLearner } from '@/lib/types'
import { cn } from '@/lib/utils'

const CONSENT_PURPOSES = ['Outcome tracking', 'Employer verification', 'Analytics', 'Contact & follow-up']
const CONSENT_METHODS = ['Form', 'In-person', 'SMS', 'Call']

export function ConsentModal({
  open,
  onClose,
  learner,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  learner: MergedLearner | null
  onSaved: () => Promise<void>
}) {
  const { show, node } = useToast()
  const [status, setStatus] = useState<ConsentStatus>(learner?.consentStatus || 'missing')
  const [method, setMethod] = useState(learner?.consentMethod || 'Form')
  const [purposes, setPurposes] = useState<string[]>(
    learner?.consentPurpose?.length ? learner.consentPurpose : ['Outcome tracking']
  )
  const [saving, setSaving] = useState(false)

  if (!learner) return null

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: learner.traineeId,
          consentStatus: status,
          consentMethod: status === 'active' ? method : learner.consentMethod,
          consentPurpose: status === 'active' ? purposes : learner.consentPurpose,
          consentDate: status === 'active' ? todayStr() : undefined,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not update consent')
      show(
        status === 'active'
          ? 'Consent marked active — personal details now visible'
          : `Consent marked ${status} — personal details hidden`,
        status === 'revoked' || status === 'expired' ? 'info' : 'success'
      )
      onClose()
      await onSaved()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not update consent', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toneOf = (s: ConsentStatus) =>
    s === 'active' ? 'emerald' : s === 'revoked' ? 'rose' : s === 'expired' ? 'amber' : 'slate'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update consent"
      sub={`${learner.name} · ${learner.traineeId}`}
    >
      {node}
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">Consent status</p>
          <div className="flex flex-wrap gap-1.5">
            {(['active', 'expired', 'revoked', 'missing'] as ConsentStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium capitalize transition-colors',
                  status === s
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <ToneBadge tone={toneOf(s)}>{s}</ToneBadge>
              </button>
            ))}
          </div>
        </div>

        {status === 'active' && (
          <>
            <Field label="Consent method">
              <Select
                allowAll={false}
                value={method}
                onChange={setMethod}
                options={CONSENT_METHODS.map((m) => ({ value: m, label: m }))}
              />
            </Field>
            <div>
              <p className="mb-1.5 text-xs font-medium text-foreground">Consent purpose</p>
              <div className="flex flex-wrap gap-1.5">
                {CONSENT_PURPOSES.map((p) => {
                  const on = purposes.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        setPurposes(on ? purposes.filter((x) => x !== p) : [...purposes, p])
                      }
                      className={cn(
                        'rounded-md border px-2 py-1 text-[11px] font-medium transition-colors',
                        on
                          ? 'border-success/30 bg-success/10 text-success'
                          : 'border-border text-muted-foreground hover:bg-muted',
                      )}
                    >
                      {on ? '✓ ' : '+ '}
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {status !== 'active' && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            When consent is not active, this learner's name, phone and email stay hidden across
            the registry, follow-ups and verification views; they appear only in aggregates.
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            Save consent
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function FollowUpScheduleModal({
  open,
  onClose,
  learner,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  learner: MergedLearner | null
  onSaved: () => Promise<void>
}) {
  const { show, node } = useToast()
  const [dueDate, setDueDate] = useState(todayStr())
  const [channel, setChannel] = useState('Call')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  if (!learner) return null

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traineeId: learner.traineeId,
          dueDate,
          channel,
          reason: reason.trim() || 'Manual follow-up',
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not schedule follow-up')
      show(`Follow-up scheduled for ${dueDate}`)
      onClose()
      await onSaved()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not schedule follow-up', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule follow-up" sub={learner.name}>
      {node}
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Due date">
            <TextInput type="date" value={dueDate} onChange={setDueDate} />
          </Field>
          <Field label="Channel">
            <Select
              allowAll={false}
              value={channel}
              onChange={setChannel}
              options={['Call', 'SMS', 'WhatsApp', 'IVR', 'Email', 'Field visit'].map((c) => ({
                value: c,
                label: c,
              }))}
            />
          </Field>
        </div>
        <Field label="Reason">
          <TextInput value={reason} onChange={setReason} placeholder="e.g. 3-month employment check" />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <PhoneCall className="size-4" />}
            Schedule
          </Button>
        </div>
      </div>
    </Modal>
  )
}