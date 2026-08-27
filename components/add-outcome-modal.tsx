'use client'

import { useMemo, useState } from 'react'
import { Loader2, Send, BadgeCheck, CalendarClock } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Field, TextInput, TextArea, Select } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ToneBadge } from '@/components/ui/tone-badge'
import {
  OUTCOME_TYPES,
  todayStr,
  addDays,
  fmtDate,
} from '@/lib/compute'
import type { ComputeDB } from '@/lib/compute-types'
import type { MergedLearner, OutcomeType } from '@/lib/types'
import { cn } from '@/lib/utils'

const OUTCOME_ORDER: OutcomeType[] = [
  'wage_employment',
  'self_employment',
  'apprenticeship',
  'higher_education',
  'job_change',
  'wage_update',
  'unemployed',
  'not_placed',
  'dropout',
]

const NEEDS_REASON: OutcomeType[] = ['job_change', 'unemployed', 'not_placed', 'dropout']
const NEEDS_WAGE: OutcomeType[] = ['wage_employment', 'job_change']
const NEEDS_EMPLOYER: OutcomeType[] = ['wage_employment', 'job_change', 'apprenticeship']

interface FormState {
  employerName: string
  jobRole: string
  monthlyWage: string
  employmentType: string
  relevanceToTraining: string
  skillsUsed: string[]
  skillInput: string
  selfEmploymentBusinessName: string
  selfEmploymentNature: string
  selfEmploymentIncome: string
  selfEmploymentSupport: string
  apprenticeshipMentor: string
  apprenticeshipStatus: string
  higherEducationInstitution: string
  higherEducationCourse: string
  reasonCode: string
  notes: string
  eventDate: string
}

export function AddOutcomeModal({
  open,
  onClose,
  learner,
  db,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  learner: MergedLearner | null
  db: ComputeDB
  onSaved: () => Promise<void>
}) {
  const { show, node } = useToast()
  const [type, setType] = useState<OutcomeType>('wage_employment')
  const [followUp, setFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(addDays(todayStr(), 30))
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<FormState>({
    employerName: '',
    jobRole: '',
    monthlyWage: '',
    employmentType: 'Full-time',
    relevanceToTraining: 'high',
    skillsUsed: [],
    skillInput: '',
    selfEmploymentBusinessName: '',
    selfEmploymentNature: '',
    selfEmploymentIncome: '',
    selfEmploymentSupport: '',
    apprenticeshipMentor: '',
    apprenticeshipStatus: 'Ongoing',
    higherEducationInstitution: '',
    higherEducationCourse: '',
    reasonCode: '',
    notes: '',
    eventDate: todayStr(),
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const reasonCodes = useMemo(
    () => db.settings?.reasonCodes || [],
    [db.settings]
  )
  const skillTags = useMemo(() => db.settings?.skillTags || [], [db.settings])

  const availableSkills = skillTags.filter((s) => !form.skillsUsed.includes(s))

  const valid =
    (NEEDS_EMPLOYER.includes(type) ? form.employerName.trim() !== '' : true) &&
    (NEEDS_WAGE.includes(type) ? form.monthlyWage !== '' : true) &&
    (NEEDS_REASON.includes(type) ? form.reasonCode !== '' : true) &&
    (type === 'self_employment' ? form.selfEmploymentBusinessName.trim() !== '' : true) &&
    (type === 'higher_education' ? form.higherEducationCourse.trim() !== '' : true) &&
    form.eventDate !== ''

  const submit = async () => {
    if (!learner || !valid) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        traineeId: learner.traineeId,
        outcomeType: type,
        eventDate: form.eventDate,
        employerName: form.employerName,
        jobRole: form.jobRole,
        monthlyWage: form.monthlyWage ? Number(form.monthlyWage) : null,
        employmentType: form.employmentType,
        relevanceToTraining: form.relevanceToTraining,
        skillsUsed: form.skillsUsed,
        selfEmploymentBusinessName: form.selfEmploymentBusinessName,
        selfEmploymentNature: form.selfEmploymentNature,
        selfEmploymentIncome: form.selfEmploymentIncome ? Number(form.selfEmploymentIncome) : null,
        selfEmploymentSupport: form.selfEmploymentSupport,
        apprenticeshipMentor: form.apprenticeshipMentor,
        apprenticeshipStatus: form.apprenticeshipStatus,
        higherEducationInstitution: form.higherEducationInstitution,
        higherEducationCourse: form.higherEducationCourse,
        reasonCode: form.reasonCode,
        notes: form.notes,
        followUpRequired: followUp,
        followUpDate: followUp ? followUpDate : '',
      }
      const res = await fetch('/api/outcomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not record outcome')
      const queued =
        NEEDS_WAGE.includes(type) && form.employerName ? ' · employer verification queued' : ''
      show(
        `Outcome recorded${queued}${followUp ? ` · follow-up ${fmtDate(followUpDate)}` : ''}`
      )
      setForm((f) => ({ ...f, employerName: '', jobRole: '', monthlyWage: '', notes: '', reasonCode: '', skillsUsed: [] }))
      setFollowUp(false)
      setFollowUpDate(addDays(todayStr(), 30))
      onClose()
      await onSaved()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not record outcome', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!learner) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Add outcome"
      sub={`${learner.name} · ${learner.traineeId}`}
    >
      {node}
      <div className="flex flex-col gap-4">
        {/* Outcome type selector */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">Outcome type</p>
          <div className="flex flex-wrap gap-1.5">
            {OUTCOME_ORDER.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors',
                  type === t
                    ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/30'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {OUTCOME_TYPES[t]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional fields */}
        <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
          <Field label="Event date">
            <TextInput type="date" value={form.eventDate} onChange={(v) => set('eventDate', v)} />
          </Field>

          {(NEEDS_WAGE.includes(type) || type === 'apprenticeship') && (
            <Field label={type === 'apprenticeship' ? 'Employer name *' : 'Employer name *'}>
              <TextInput
                value={form.employerName}
                onChange={(v) => set('employerName', v)}
                placeholder="e.g. Sundaram Auto Components"
              />
            </Field>
          )}

          {NEEDS_WAGE.includes(type) && (
            <Field label="Monthly wage (₹) *">
              <TextInput
                type="number"
                value={form.monthlyWage}
                onChange={(v) => set('monthlyWage', v)}
                placeholder="e.g. 14000"
              />
            </Field>
          )}
          {type === 'apprenticeship' && (
            <Field label="Stipend (₹/month)">
              <TextInput
                type="number"
                value={form.monthlyWage}
                onChange={(v) => set('monthlyWage', v)}
                placeholder="e.g. 9000"
              />
            </Field>
          )}

          {(NEEDS_WAGE.includes(type) || type === 'apprenticeship') && (
            <Field label="Job role">
              <TextInput
                value={form.jobRole}
                onChange={(v) => set('jobRole', v)}
                placeholder="e.g. CNC Operator"
              />
            </Field>
          )}

          {NEEDS_WAGE.includes(type) && (
            <>
              <Field label="Employment type">
                <Select
                  allowAll={false}
                  value={form.employmentType}
                  onChange={(v) => set('employmentType', v)}
                  options={['Full-time', 'Part-time', 'Contract', 'Temporary'].map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
              </Field>
              <Field label="Relevance to training">
                <Select
                  allowAll={false}
                  value={form.relevanceToTraining}
                  onChange={(v) => set('relevanceToTraining', v)}
                  options={[
                    { value: 'high', label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low', label: 'Low' },
                  ]}
                />
              </Field>
            </>
          )}

          {type === 'self_employment' && (
            <>
              <Field label="Business name *">
                <TextInput
                  value={form.selfEmploymentBusinessName}
                  onChange={(v) => set('selfEmploymentBusinessName', v)}
                  placeholder="e.g. Sai Tailoring Unit"
                />
              </Field>
              <Field label="Nature of work">
                <TextInput
                  value={form.selfEmploymentNature}
                  onChange={(v) => set('selfEmploymentNature', v)}
                  placeholder="e.g. Stitching & alteration"
                />
              </Field>
              <Field label="Estimated monthly income (₹)">
                <TextInput
                  type="number"
                  value={form.selfEmploymentIncome}
                  onChange={(v) => set('selfEmploymentIncome', v)}
                />
              </Field>
              <Field label="Support received, if any">
                <TextInput
                  value={form.selfEmploymentSupport}
                  onChange={(v) => set('selfEmploymentSupport', v)}
                  placeholder="e.g. Toolkit + ₹5,000 seed grant"
                />
              </Field>
            </>
          )}

          {type === 'apprenticeship' && (
            <>
              <Field label="Mentor name (optional)">
                <TextInput
                  value={form.apprenticeshipMentor}
                  onChange={(v) => set('apprenticeshipMentor', v)}
                />
              </Field>
              <Field label="Progress status">
                <Select
                  allowAll={false}
                  value={form.apprenticeshipStatus}
                  onChange={(v) => set('apprenticeshipStatus', v)}
                  options={['Ongoing', 'Completed', 'Discontinued'].map((t) => ({
                    value: t,
                    label: t,
                  }))}
                />
              </Field>
            </>
          )}

          {type === 'higher_education' && (
            <>
              <Field label="Institution">
                <TextInput
                  value={form.higherEducationInstitution}
                  onChange={(v) => set('higherEducationInstitution', v)}
                  placeholder="e.g. Government Polytechnic, Pune"
                />
              </Field>
              <Field label="Course *">
                <TextInput
                  value={form.higherEducationCourse}
                  onChange={(v) => set('higherEducationCourse', v)}
                  placeholder="e.g. Diploma in Mechanical Engineering"
                />
              </Field>
            </>
          )}

          {type === 'wage_update' && (
            <Field label="New monthly wage (₹) *">
              <TextInput
                type="number"
                value={form.monthlyWage}
                onChange={(v) => set('monthlyWage', v)}
                placeholder="e.g. 15500"
              />
            </Field>
          )}

          {NEEDS_REASON.includes(type) && (
            <Field label="Reason code *">
              <Select
                allowAll={false}
                value={form.reasonCode}
                onChange={(v) => set('reasonCode', v)}
                placeholder="Select reason"
                options={reasonCodes.map((r) => ({ value: r, label: r }))}
              />
            </Field>
          )}

          <div className={cn('sm:col-span-2', NEEDS_REASON.includes(type) && type !== 'job_change' ? '' : '')}>
            <Field
              label={
                type === 'unemployed' || type === 'not_placed' || type === 'dropout'
                  ? 'Notes'
                  : 'Notes (optional)'
              }
              className="sm:col-span-2"
            >
              <TextArea
                value={form.notes}
                onChange={(v) => set('notes', v)}
                placeholder="Context for the record…"
                rows={2}
              />
            </Field>
          </div>

          {/* Skills selector (learning-placement types) */}
          {(NEEDS_WAGE.includes(type) || type === 'self_employment') && (
            <div className="sm:col-span-2">
              <Field label="Skills used / observed">
                <div className="flex flex-wrap gap-1.5">
                  {form.skillsUsed.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('skillsUsed', form.skillsUsed.filter((x) => x !== s))}
                      className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      {s} ✕
                    </button>
                  ))}
                  {form.skillsUsed.length === 0 && (
                    <span className="text-[11px] text-muted-foreground">None added</span>
                  )}
                </div>
                {availableSkills.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {availableSkills.slice(0, 10).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => set('skillsUsed', [...form.skillsUsed, s])}
                        className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            </div>
          )}
        </div>

        {/* Follow-up scheduling */}
        <label className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3.5">
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
            className="mt-0.5 size-4 accent-primary"
          />
          <span className="flex flex-1 flex-wrap items-center gap-2 text-xs text-foreground">
            <CalendarClock className="size-4 shrink-0 text-primary" />
            <span className="font-medium">Schedule a follow-up</span>
            {followUp && (
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
              />
            )}
          </span>
        </label>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {NEEDS_WAGE.includes(type) && form.employerName && (
              <ToneBadge tone="sky">
                <BadgeCheck className="size-3" />
                Verification queued
              </ToneBadge>
            )}
            {followUp && <ToneBadge tone="amber">Follow-up {fmtDate(followUpDate)}</ToneBadge>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={!valid || saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Record outcome
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}