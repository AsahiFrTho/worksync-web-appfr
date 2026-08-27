'use client'

import { useState } from 'react'
import {
  Save,
  Settings as Cog,
  MapPin,
  BookOpen,
  Building2,
  Tag,
  Tags,
  Users,
  ShieldCheck,
  Bell,
  Loader2,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Field, TextInput } from '@/components/ui/field'
import { ToneBadge } from '@/components/ui/tone-badge'
import { useToast } from '@/components/ui/toast'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import type { NotificationRules, ProgramSettings } from '@/lib/types'

function ListEditor({
  label,
  icon: Icon,
  items,
  onChange,
  placeholder,
}: {
  label: string
  icon?: typeof Tag
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [val, setVal] = useState('')
  const add = () => {
    if (val.trim()) {
      onChange([...items, val.trim()])
      setVal('')
    }
  }
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {label}
      </label>
      <div className="mb-2 flex min-h-[30px] flex-wrap gap-1.5 rounded-lg border border-border bg-muted/30 p-2">
        {items.map((it, i) => (
          <button
            key={`${it}-${i}`}
            type="button"
            title="Remove"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="transition-colors hover:opacity-80"
          >
            <ToneBadge tone="navy" className="cursor-pointer">{it} ✕</ToneBadge>
          </button>
        ))}
        {!items.length && <span className="text-[11px] text-muted-foreground">List is empty</span>}
      </div>
      <div className="flex gap-2">
        <input
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
          value={val}
          placeholder={placeholder}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
        />
        <Button variant="outline" size="sm" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { db, data, loading, error, seeded, refresh, seed } = useProgramData()
  const { show, node } = useToast()
  const [draft, setDraft] = useState<ProgramSettings | null>(null)
  const [saving, setSaving] = useState(false)

  // Keep local draft in sync when settings arrive / refresh.
  const activeSettings = draft ?? db.settings
  const set = (patch: Partial<ProgramSettings>) =>
    setDraft((d) => ({ ...(d || db.settings!), ...patch } as ProgramSettings))
  const setRules = (rules: NotificationRules) =>
    setDraft((d) => ({
      ...(d || db.settings!),
      notificationRules: { ...(d?.notificationRules || db.settings?.notificationRules), ...rules },
    } as ProgramSettings))

  const save = async () => {
    if (!activeSettings) return
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeSettings),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not save settings')
      show('Settings saved')
      setDraft(null)
      await refresh()
    } catch (err) {
      show(err instanceof Error ? err.message : 'Could not save settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const providers = [
    ...new Set(
      db.learners.map((l) => l.trainingProvider).filter((p): p is string => !!p)
    ),
  ].sort()
  const courses = [
    ...new Set(db.learners.map((l) => l.course).filter((c): c is string => !!c)),
  ].sort()
  const users = [
    { id: 'U1', name: 'Meera Deshpande', role: 'admin', organization: 'Skill Development Mission' },
    { id: 'U2', name: 'Rahul Kulkarni', role: 'provider', organization: 'Nashik Skill Academy' },
    { id: 'U3', name: 'Sunita Wagh', role: 'coordinator', organization: 'Field Team — Nashik Division' },
    { id: 'U4', name: 'Arjun Pawar', role: 'verifier', organization: 'Employer Verification Cell' },
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Programme Configuration"
        title="Settings"
        description="Programme-level configuration — name, reference lists, consent policy and notification rules. Saved to the backend and used across forms, filters and tags."
      />
      {node}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          {activeSettings ? (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {activeSettings.programName}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Demo values — editable and persisted
                  </p>
                </div>
                <Button onClick={() => void save()} disabled={saving || !draft}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {draft ? 'Save changes' : 'No changes'}
                </Button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Programme</CardTitle>
                      <Cog className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3.5 pt-4">
                    <Field label="Programme name">
                      <TextInput
                        value={activeSettings.programName}
                        onChange={(v) => set({ programName: v })}
                      />
                    </Field>
                    <Field
                      label="Data retention period (months)"
                      hint="How long learner records are kept after last activity"
                    >
                      <TextInput
                        type="number"
                        value={String(activeSettings.retentionPeriodMonths)}
                        onChange={(v) => set({ retentionPeriodMonths: Number(v) || 0 })}
                      />
                    </Field>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <CardTitle className="text-sm">Reference lists</CardTitle>
                    <CardDescription className="mt-0.5">
                      Used across forms, filters and tags
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    <ListEditor
                      label="Districts"
                      icon={MapPin}
                      items={activeSettings.districts}
                      onChange={(v) => set({ districts: v })}
                      placeholder="Add district…"
                    />
                    <ListEditor
                      label="Outcome reason codes"
                      icon={Tag}
                      items={activeSettings.reasonCodes}
                      onChange={(v) => set({ reasonCodes: v })}
                      placeholder="Add reason code…"
                    />
                    <ListEditor
                      label="Skill tags"
                      icon={Tags}
                      items={activeSettings.skillTags}
                      onChange={(v) => set({ skillTags: v })}
                      placeholder="Add skill tag…"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Providers</CardTitle>
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {providers.length ? (
                      providers.map((p) => (
                        <div
                          key={p}
                          className="flex items-center justify-between border-b border-border/60 py-2 last:border-b-0"
                        >
                          <div>
                            <div className="text-[13px] font-medium text-foreground">{p}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {db.learners.find((l) => l.trainingProvider === p)?.district}
                            </div>
                          </div>
                          <Badge variant="success">active</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No providers found in the registry.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Courses</CardTitle>
                      <BookOpen className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {courses.length ? (
                      courses.map((c) => (
                        <div
                          key={c}
                          className="flex items-center justify-between border-b border-border/60 py-2 last:border-b-0"
                        >
                          <div>
                            <div className="text-[13px] font-medium text-foreground">{c}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {db.learners.filter((l) => l.course === c).length} learners
                            </div>
                          </div>
                          <Badge variant="success">active</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-xs text-muted-foreground">
                        No courses found in the registry.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Users & roles</CardTitle>
                      <Users className="size-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between border-b border-border/60 py-2 last:border-b-0"
                      >
                        <div>
                          <div className="text-[13px] font-medium text-foreground">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground">{u.organization}</div>
                        </div>
                        <Badge variant="outline">{u.role}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Consent policy</CardTitle>
                      <ShieldCheck className="size-4 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <textarea
                      rows={6}
                      value={activeSettings.consentPolicy}
                      onChange={(e) => set({ consentPolicy: e.target.value })}
                      className="min-h-[120px] w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                    />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Shown to learners at consent collection and referenced in the learner profile.
                    </p>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader className="border-b border-border pb-3.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Notification rules</CardTitle>
                      <Bell className="size-4 text-muted-foreground" />
                    </div>
                    <CardDescription className="mt-0.5">
                      Simulated automated reminders
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
                    <ListEditor
                      label="Reminder channels (simulated)"
                      items={activeSettings.notificationRules.channels || []}
                      onChange={(v) => setRules({ channels: v })}
                      placeholder="Add channel…"
                    />
                    <div className="flex flex-col gap-3">
                      <label className="flex items-center gap-2 text-[13px] text-foreground">
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={!!activeSettings.notificationRules.followUpSameDay}
                          onChange={(e) => setRules({ followUpSameDay: e.target.checked })}
                        />
                        Auto-remind coordinators about follow-ups due today
                      </label>
                      <Field label="Overdue digest">
                        <TextInput
                          value={activeSettings.notificationRules.overdueDigest || ''}
                          onChange={(v) => setRules({ overdueDigest: v })}
                        />
                      </Field>
                      <Field label="Consent expiry reminder (days before)">
                        <TextInput
                          type="number"
                          value={String(
                            activeSettings.notificationRules.consentExpiryReminderDays ?? 30
                          )}
                          onChange={(v) =>
                            setRules({ consentExpiryReminderDays: Number(v) || 0 })
                          }
                        />
                      </Field>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={() => void save()} disabled={saving || !draft}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {draft ? 'Save changes' : 'No changes'}
                </Button>
              </div>
              <p className="text-right text-[11px] text-muted-foreground">
                {data.trainees.length} learners in registry · {db.verifications.length} verifications
              </p>
            </>
          ) : null}
        </DataState>
      </div>
    </AppShell>
  )
}