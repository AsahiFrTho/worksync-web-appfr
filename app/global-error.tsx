'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-background font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Application error</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A critical error occurred. Please try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-95"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
