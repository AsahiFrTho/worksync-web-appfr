'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, Lock } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import type { TraineeLite, ConsentRecord } from '@/lib/types'

interface SearchRow {
  _id: string
  traineeId: string
  name: string
  district: string
  consentActive: boolean
}

// Header search: learner by name or ID with a live dropdown. Consent-aware:
// learners without active consent are shown pseudonymised ("Learner ID").
export function GlobalSearch({ className }: { className?: string }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<SearchRow[]>([])
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/trainees', { cache: 'no-store' }).then((r) => r.json()),
      fetch('/api/consent', { cache: 'no-store' }).then((r) => r.json()),
    ])
      .then(([tj, cj]) => {
        if (cancelled) return
        const trainees: TraineeLite[] = tj.trainees || []
        const consents: ConsentRecord[] = cj.consents || []
        const active = new Set(
          consents.filter((c) => c.consentStatus === 'active').map((c) => c.traineeId)
        )
        setRows(
          trainees.map((t) => ({
            _id: t._id,
            traineeId: t.traineeId,
            name: t.name,
            district: t.district,
            consentActive: active.has(t.traineeId),
          }))
        )
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return []
    return rows
      .filter(
        (l) =>
          (l.consentActive && l.name.toLowerCase().includes(t)) ||
          l.traineeId.toLowerCase().includes(t)
      )
      .slice(0, 6)
  }, [q, rows])

  return (
    <div ref={boxRef} className={`relative ${className || ''}`}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search learner by name or ID…"
        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors duration-200 focus:border-primary focus:ring-1 focus:ring-primary/25"
      />
      {open && q.trim() ? (
        <div className="absolute top-full z-40 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card py-1.5 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              No learners match “{q}”.
            </p>
          ) : (
            results.map((l) => (
              <Link
                key={l._id}
                href={`/learners/${l.traineeId}`}
                onClick={() => {
                  setQ('')
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left transition-colors hover:bg-muted"
              >
                <Avatar name={l.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground truncate">
                    {l.consentActive ? l.name : `Learner ${l.traineeId}`}
                    {!l.consentActive && (
                      <Lock className="size-3 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {l.traineeId} · {l.district}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}