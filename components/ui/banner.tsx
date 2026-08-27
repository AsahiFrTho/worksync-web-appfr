import type * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Banner({
  tone = 'warn',
  icon: Icon = ShieldAlert,
  title,
  children,
  className,
}: {
  tone?: 'warn' | 'danger' | 'info' | 'success'
  icon?: LucideIcon
  title?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs leading-relaxed',
        tone === 'warn' && 'border-warning/30 bg-warning/10 text-warning',
        tone === 'danger' && 'border-destructive/30 bg-destructive/10 text-destructive',
        tone === 'info' && 'border-border bg-muted text-foreground',
        tone === 'success' && 'border-success/30 bg-success/10 text-success',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title ? <p className="mb-0.5 font-semibold">{title}</p> : null}
        {children ? <div className="font-normal opacity-95">{children}</div> : null}
      </div>
    </div>
  )
}