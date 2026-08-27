import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Calendar } from 'lucide-react'

export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string
  description: string
  eyebrow?: string
}) {
  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow ? (
              <Badge variant="default" className="uppercase tracking-wider text-[10px] px-2.5 py-0.5">
                {eyebrow}
              </Badge>
            ) : null}
            <Badge variant="outline" className="text-xs px-2.5 py-0.5 flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Prototype — Demonstration Data</span>
            </Badge>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border px-3 py-1 rounded-md bg-muted/30">
            <Calendar className="size-3.5 text-primary" />
            <span>Reporting Period: FY 2024–25 (Longitudinal Audit)</span>
          </div>
        </div>

        <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-foreground break-words animate-fade-in">
          {title}
        </h1>
        <p className="max-w-4xl text-xs sm:text-sm leading-relaxed font-normal text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
    </div>
  )
}