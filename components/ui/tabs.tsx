'use client'

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  count?: number
}

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: TabItem[]
  active: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/40 p-1', className)}
      role="tablist"
    >
      {tabs.map((t) => {
        const isActive = t.id === active
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-300 ease-premium',
              isActive
                ? 'bg-card text-foreground shadow-soft border border-border'
                : 'border border-transparent bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span
                className={cn(
                  'rounded px-1 py-0.5 text-[10px] font-semibold tabular-nums transition-colors duration-200',
                  isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}