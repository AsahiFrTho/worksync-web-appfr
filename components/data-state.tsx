'use client'

import { Loader2, Database, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Shared loading / seed-prompt / error wrapper for all operational pages.
// On first visit with an empty database it offers "Load demo data", which
// calls POST /api/seed/operations (ported from the Source demo dataset).
export function DataState({
  loading,
  error,
  seeded,
  loadingLabel = 'Loading programme data…',
  onSeed,
  onRetry,
  children,
}: {
  loading: boolean
  error: string | null
  seeded: boolean
  loadingLabel?: string
  onSeed: () => Promise<void>
  onRetry: () => void
  children: React.ReactNode
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      </div>
    )
  }

  if (!seeded) {
    return (
      <Card className="mx-auto mt-10 max-w-xl border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
          <Database className="size-6" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-base font-semibold text-foreground">
          No programme data yet
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          The operational modules (learners, follow-ups, verification, scorecard, data quality,
          settings) run on the MongoDB collections behind this app. Load the curated demo dataset
          to explore them — it mirrors the Source sample data with realistic consent, outcome,
          follow-up and verification records.
        </p>
        <Button className="mt-5" onClick={() => void onSeed()}>
          <Database className="size-4" />
          Load demo data
        </Button>
        {error ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3.5" />
            {error}
          </p>
        ) : null}
      </Card>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
        <AlertTriangle className="size-6 text-warning" aria-hidden="true" />
        <p className="text-sm text-foreground">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  return <>{children}</>
}