import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-11 text-sm',
}

export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name?: string
  size?: keyof typeof SIZES
  className?: string
}) {
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border border-border bg-muted font-semibold text-muted-foreground uppercase',
        SIZES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}