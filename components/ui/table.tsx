import type * as React from 'react'
import { cn } from '@/lib/utils'

// Scroll-safe table wrapper + consistent header/cell styling for the
// operational modules.
export function Table({
  className,
  minWidthClass = 'min-w-[760px]',
  ...props
}: React.ComponentProps<'div'> & { minWidthClass?: string }) {
  return (
    <div className={cn('overflow-x-auto scroll-thin', className)}>
      <table className={cn('w-full border-collapse text-left', minWidthClass)} {...props} />
    </div>
  )
}

export const thClass =
  'border-b border-border px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap'

export const tdClass =
  'border-b border-border/60 px-4 py-3 align-middle text-xs text-foreground'

export function Th({
  className,
  ...props
}: React.ComponentProps<'th'>) {
  return <th className={cn(thClass, className)} {...props} />
}

export function Td({
  className,
  ...props
}: React.ComponentProps<'td'>) {
  return <td className={cn(tdClass, className)} {...props} />
}