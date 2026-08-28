'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Something went wrong</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            An unexpected error occurred while loading this section. You can try again or return to the dashboard.
          </p>
          {error?.message ? (
            <pre className="mt-1 max-h-32 overflow-auto rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
              {error.message}
            </pre>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => reset()}
              className={cn(buttonVariants({ variant: 'default', size: 'default' }))}
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: 'outline', size: 'default' }))}
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
