'use client'

import { useMemo } from 'react'
import { Building2, Award } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, Th, Td } from '@/components/ui/table'
import { DataState } from '@/components/data-state'
import { useProgramData } from '@/lib/use-program-data'
import { providerScorecards } from '@/lib/compute'
import { cn } from '@/lib/utils'

const BADGE_STYLES: Record<string, string> = {
  Strong: 'bg-emerald-600 text-white',
  Improving: 'bg-amber-500 text-white',
  'Needs attention': 'bg-rose-600 text-white',
}

const BADGE_TONES: Record<string, 'success' | 'warning' | 'destructive'> = {
  Strong: 'success',
  Improving: 'warning',
  'Needs attention': 'destructive',
}

function MiniBar({ value, invert = false }: { value: number; invert?: boolean }) {
  const tone = invert
    ? value >= 80
      ? 'bg-success'
      : value >= 50
        ? 'bg-warning'
        : 'bg-destructive'
    : value >= 70
      ? 'bg-success'
      : value >= 45
        ? 'bg-warning'
        : 'bg-destructive'
  return (
    <div className="flex min-w-[110px] items-center gap-2">
      <Progress value={value} indicatorClassName={tone} className="flex-1" />
      <span className="w-9 text-right text-[11px] font-semibold text-foreground">{value}%</span>
    </div>
  )
}

export default function ScorecardPage() {
  const { db, loading, error, seeded, refresh, seed } = useProgramData()
  const cards = useMemo(() => providerScorecards(db), [db])
  const best = [...cards].sort((a, b) => b.composite - a.composite)[0]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Provider Accountability"
        title="Provider Scorecard"
        description="Accountability view — outcome quality, data hygiene and verification per training provider. Composite = outcome quality 40% · data & verification 35% · follow-up & gaps 25%."
      />
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DataState loading={loading} error={error} seeded={seeded} onSeed={seed} onRetry={refresh}>
          <div className="grid gap-6 lg:grid-cols-3">
            {cards.map((c) => (
              <Card key={c.provider.id} className="overflow-hidden">
                <div
                  className={cn(
                    'flex items-center justify-between px-5 py-4',
                    BADGE_STYLES[c.badge]
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4.5" />
                    <div>
                      <div className="text-sm font-bold leading-tight">{c.provider.name}</div>
                      <div className="text-[10.5px] opacity-80">
                        {c.provider.district} · {c.learners} learners
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[22px] font-extrabold leading-none">{c.composite}</div>
                    <div className="text-[9px] uppercase tracking-wide opacity-80">score</div>
                  </div>
                </div>

                <CardContent className="flex flex-col gap-2 pt-3.5">
                  {[
                    ['Placement rate', c.placementRate],
                    ['Verified placement', c.verifiedRate],
                    ['Retention (3 mo)', c.retentionRate],
                    ['Data completeness', c.completeness],
                    ['Follow-up completion', c.followUpRate],
                    ['Employer verification', c.employerVerRate],
                  ].map(([label, v]) => (
                    <div key={label as string} className="flex items-center gap-2">
                      <span className="w-[132px] shrink-0 text-[11px] text-muted-foreground">
                        {label}
                      </span>
                      <MiniBar value={v as number} />
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="w-[132px] shrink-0 text-[11px] text-muted-foreground">
                      Avg wage growth
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold',
                        c.wageGrowth >= 0 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      +{c.wageGrowth}%
                    </span>
                    <span className="ml-6 text-[11px] text-muted-foreground">Skill gap score</span>
                    <span className="text-xs font-bold text-foreground">{c.gapScore}</span>
                  </div>
                </CardContent>

                <div className="flex items-center justify-between border-t border-border px-5 py-3">
                  <Badge variant={BADGE_TONES[c.badge]}>{c.badge}</Badge>
                  {best?.provider.id === c.provider.id && (
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Award className="size-3.5 text-warning" />
                      best performer
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-3.5">
              <CardTitle className="text-sm">All metrics, side by side</CardTitle>
              <CardDescription className="mt-0.5">
                Composite = outcome quality 40% · data & verification 35% · follow-up & gaps 25%
              </CardDescription>
            </CardHeader>
            <Table minWidthClass="min-w-[980px]">
              <thead className="bg-muted/20">
                <tr>
                  {[
                    'Provider',
                    'Learners',
                    'Placement',
                    'Verified placement',
                    'Retention 3mo',
                    'Wage growth',
                    'Completeness',
                    'Follow-ups',
                    'Verification',
                    'Gap score',
                    'Badge',
                  ].map((h) => (
                    <Th key={h}>{h}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cards.map((c) => (
                  <tr key={c.provider.id} className="transition-colors hover:bg-muted/30">
                    <Td className="font-medium">{c.provider.name}</Td>
                    <Td>{c.learners}</Td>
                    <Td>{c.placementRate}%</Td>
                    <Td>{c.verifiedRate}%</Td>
                    <Td>{c.retentionRate}%</Td>
                    <Td className="font-semibold text-success">+{c.wageGrowth}%</Td>
                    <Td>{c.completeness}%</Td>
                    <Td>{c.followUpRate}%</Td>
                    <Td>{c.employerVerRate}%</Td>
                    <Td>{c.gapScore}</Td>
                    <Td>
                      <Badge variant={BADGE_TONES[c.badge]}>{c.badge}</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </DataState>
      </div>
    </AppShell>
  )
}