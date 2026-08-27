import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
}: {
  label: string
  value: string
  sublabel?: string
  icon: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' | 'flat' }
}) {
  return (
    <Card className="group relative overflow-hidden border border-border bg-card p-5 shadow-card transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover rounded-xl">
      {/* soft gradient accent on the top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/[0.07] blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-70" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-heading mt-1.5 text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40 text-primary transition-transform duration-300 ease-premium group-hover:scale-105">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
        {sublabel ? (
          <p className="text-xs font-normal text-muted-foreground truncate">{sublabel}</p>
        ) : <span />}

        {trend ? (
          <div
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
              trend.direction === 'up' && 'bg-success/10 text-success border border-success/25',
              trend.direction === 'down' && 'bg-destructive/10 text-destructive border border-destructive/25',
              trend.direction === 'flat' && 'bg-muted text-muted-foreground border border-border',
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="size-3.5" aria-hidden="true" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="size-3.5" aria-hidden="true" />
            ) : (
              <Minus className="size-3.5 text-muted-foreground" aria-hidden="true" />
            )}
            <span>{trend.value}</span>
          </div>
        ) : null}
      </div>
    </Card>
  )
}