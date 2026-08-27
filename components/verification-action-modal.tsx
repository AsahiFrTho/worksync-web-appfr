'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, FileSearch, Flag, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Field, TextInput, TextArea, Select } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { VERIFICATION_METHODS, fmtMoney } from '@/lib/compute'
import type { EmployerVerification } from '@/lib/types'

export type VerificationActionMode = 'approve' | 'reject' | 'evidence' | 'flag'

const TITLES: Record<VerificationActionMode, [string, string]> = {
  approve: ['Approve employer record', 'Confirm employment details are genuine'],
  reject: ['Reject employer record', 'Record the reason so providers can fix the source data'],
  evidence: ['Request more evidence', 'Ask the linked provider for documents'],
  flag: ['Flag as duplicate / suspicious', 'Flags surface patterns across fake or duplicated employers'],
}

export function VerificationActionModal({
  open,
  onClose,
  record,
  mode,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  record: EmployerVerification | null
  mode: VerificationActionMode
  onSaved: () => Promise<void>
}) {
  const { show, node } = useToast()
  const [method, setMethod] = useState(record?.verificationMethod || VERIFICATION_METHODS[0])
  const [remarks, setRemarks] = useState(record?.verifierRemarks || '')
  const [confidence, setConfidence] = useState(String(record?.confidenceScore ?? 90))
  const [saving, setSaving] = useState(false)

  if (!record) return null

  const submit = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { action: mode }
      if (mode === 'approve') {
        body.method = method
        body.remarks = remarks
        body.confidence = confidence
      } else if (mode === 'reject') {
        body.method = method
        body.remarks = remarks
      } else if (mode === 'evidence') {
        body.remarks = remarks
      }
      if (mode === 'flag') {
        body.flagged = !record.flagged
      }

      const res = await fetch(`/api/verifications/${record._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not update verification')

      if (mode === 'approve') show(`Approved — ${record.employerName} verified`)
      else if (mode === 'reject') show(`Rejected — outcome marked unverifiable`)
      else if (mode === 'evidence') show('Evidence requested from provider')
      else show(record.flagged ? 'Flag removed' : 'Marked as duplicate / suspicious')

      onClose()
      await onSaved()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not update verification', 'error')
    } finally {
      setSaving(false)
    }
  }

  const sub = `${record.employerName} · ${fmtMoney(record.wage)}/mo`

  return (
    <Modal open={open} onClose={onClose} title={TITLES[mode][0]} sub={sub}>
      {node}
      <div className="flex flex-col gap-3">
        <p className="text-xs leading-relaxed text-muted-foreground">{TITLES[mode][1]}</p>

        {mode !== 'flag' && (
          <Field label="Verification method">
            <Select
              allowAll={false}
              value={method}
              onChange={setMethod}
              options={VERIFICATION_METHODS.map((m) => ({ value: m, label: m }))}
            />
          </Field>
        )}

        {mode === 'approve' && (
          <Field label="Confidence score" hint="0–100 — how sure are you?">
            <TextInput type="number" value={confidence} onChange={setConfidence} />
          </Field>
        )}

        {mode !== 'flag' && (
          <Field label="Verifier remarks">
            <TextArea
              value={remarks}
              onChange={setRemarks}
              placeholder="e.g. HR confirmed role and wage on call; offer letter on file."
              rows={3}
            />
          </Field>
        )}

        {mode === 'flag' && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {record.flagged
              ? 'Remove the duplicate / suspicious flag from this record.'
              : 'Mark this record as duplicate or suspicious. Flagged records surface prominently in the verification workbench.'}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant={mode === 'reject' ? 'destructive' : 'default'}
            onClick={() => void submit()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : mode === 'approve' ? (
              <CheckCircle2 className="size-4" />
            ) : mode === 'reject' ? (
              <XCircle className="size-4" />
            ) : mode === 'evidence' ? (
              <FileSearch className="size-4" />
            ) : (
              <Flag className="size-4" />
            )}
            {TITLES[mode][0]}
          </Button>
        </div>
      </div>
    </Modal>
  )
}