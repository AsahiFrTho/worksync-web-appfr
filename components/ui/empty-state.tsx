import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
}: {
  icon?: LucideIcon
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
      {action ? <div className="mt-1.5">{action}</div> : null}
    </div>
  )
}