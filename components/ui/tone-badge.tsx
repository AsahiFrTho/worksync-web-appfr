import type * as React from 'react'
import { cn } from '@/lib/utils'
import { STATUS_COLORS } from '@/lib/compute-types'

// Tone-aware badge driven by the status-color map (emerald/violet/sky/...).
export function ToneBadge({
  tone,
  children,
  className,
}: {
  tone: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap',
        STATUS_COLORS[tone] || STATUS_COLORS.slate,
        className,
      )}
    >
      {children}
    </span>
  )
}