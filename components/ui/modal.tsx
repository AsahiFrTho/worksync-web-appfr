'use client'

import type * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  title,
  sub,
  wide,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: React.ReactNode
  sub?: React.ReactNode
  wide?: boolean
  children: React.ReactNode
  className?: string
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 sm:p-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative mt-8 w-full rounded-xl border border-border bg-card text-card-foreground shadow-2xl',
          wide ? 'max-w-3xl' : 'max-w-xl',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-heading text-sm sm:text-base font-semibold text-foreground leading-tight">
              {title}
            </h2>
            {sub ? <p className="mt-0.5 text-xs text-muted-foreground truncate">{sub}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}