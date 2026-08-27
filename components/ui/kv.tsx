import type * as React from 'react'
import { cn } from '@/lib/utils'

export function KV({
  label,
  masked,
  children,
  className,
}: {
  label: React.ReactNode
  masked?: boolean
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[10.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-xs text-foreground',
          masked && 'italic text-muted-foreground',
        )}
      >
        {masked ? 'Hidden — no consent' : children || '—'}
      </span>
    </div>
  )
}