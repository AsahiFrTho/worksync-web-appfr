import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatTone = 'default' | 'emerald' | 'violet' | 'amber' | 'blue' | 'rose'

const TONES: Record<
  StatTone,
  { icon: string; line: string; chip: string }
> = {
  default: {
    icon: 'border-primary/20 bg-primary/10 text-primary',
    line: 'via-primary/70',
    chip: 'border-primary/25 bg-primary/10 text-primary',
  },
  emerald: {
    icon: 'border-success/20 bg-success/10 text-success',
    line: 'via-success/70',
    chip: 'border-success/25 bg-success/10 text-success',
  },
  violet: {
    icon: 'border-violet-600/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    line: 'via-violet-500/70',
    chip: 'border-violet-600/25 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  amber: {
    icon: 'border-warning/25 bg-warning/10 text-warning',
    line: 'via-warning/70',
    chip: 'border-warning/25 bg-warning/10 text-warning',
  },
  blue: {
    icon: 'border-blue-600/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    line: 'via-blue-500/70',
    chip: 'border-blue-600/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  },
  rose: {
    icon: 'border-destructive/20 bg-destructive/10 text-destructive',
    line: 'via-destructive/70',
    chip: 'border-destructive/25 bg-destructive/10 text-destructive',
  },
}

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  trend,
  tone = 'default',
}: {
  label: string
  value: string
  sublabel?: string
  icon: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' | 'flat' }
  tone?: StatTone
}) {
  const t = TONES[tone]
  return (
    <Card className="group relative overflow-hidden border border-border bg-card p-5 shadow-card transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:shadow-card-hover rounded-xl">
      {/* soft gradient accent on the top edge */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent',
          t.line
        )}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/[0.07] opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="font-heading mt-1.5 text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <div
          className={cn(
            'flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl border',
            t.icon,
            'transition-transform duration-300 ease-premium group-hover:scale-105'
          )}
        >
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
              'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
              trend.direction === 'down'
                ? 'border-destructive/25 bg-destructive/10 text-destructive'
                : trend.direction === 'flat'
                  ? 'border-border bg-muted text-muted-foreground'
                  : t.chip
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