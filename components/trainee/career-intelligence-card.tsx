'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Brain,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { IAICareerIntelligenceResult } from '@/lib/ai/types'

interface CareerIntelligenceCardProps {
  traineeId: string
}

const outcomeVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral' | 'default'> = {
  'Strong': 'success',
  'Positive': 'success',
  'Moderate': 'neutral',
  'Needs Attention': 'warning',
  'At Risk': 'destructive',
}

const alignmentVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  'Direct Match': 'success',
  'Partial Match': 'warning',
  'Unrelated': 'destructive',
  'Mismatched': 'destructive',
}

const riskVariantMap: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  'Low': 'success',
  'Moderate': 'warning',
  'High': 'destructive',
  'Critical': 'destructive',
}

export function CareerIntelligenceCard({ traineeId }: CareerIntelligenceCardProps) {
  const [data, setData] = useState<IAICareerIntelligenceResult | null>(null)
  const [source, setSource] = useState<'gemini' | 'evidence-fallback'>('gemini')
  const [loading, setLoading] = useState(true)
  const [errorStatus, setErrorStatus] = useState<number | null>(null)

  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true)
      setErrorStatus(null)
      const res = await fetch(`/api/ai/career-intelligence?traineeId=${traineeId}`)
      if (!res.ok) {
        setErrorStatus(res.status)
        return
      }
      const json = await res.json()
      if (json.success && json.data) {
        setData(json.data)
        if (json.source) {
          setSource(json.source)
        }
      } else if (json.traineeId) {
        setData(json)
      } else {
        setErrorStatus(500)
      }
    } catch {
      setErrorStatus(500)
    } finally {
      setLoading(false)
    }
  }, [traineeId])

  useEffect(() => {
    fetchIntelligence()
  }, [fetchIntelligence])

  const evidenceItems: string[] = data?.evidenceUsed
    ? Array.isArray(data.evidenceUsed)
      ? data.evidenceUsed
      : (Object.values(data.evidenceUsed) as string[])
    : []

  const isFallback = source === 'evidence-fallback'

  return (
    <Card className="overflow-hidden border border-border bg-card">
      {/* Header Banner */}
      <CardHeader className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="text-sm font-bold text-purple-950 sm:text-base">
                AI Career Intelligence & Upskilling Pathway
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-purple-800">
                Decision support synthesizing verified credentials, trade alignment, and career trajectories
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="default" className="border-purple-300 bg-purple-100 text-purple-950 font-bold text-[11px]">
              {isFallback ? (
                <span className="flex items-center gap-1">
                  <Cpu className="size-3 text-purple-700" /> Evidence Synthesis
                </span>
              ) : (
                'Policy AI'
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        {/* Skeleton Pulse Loading State */}
        {loading && (
          <div className="flex flex-col gap-4 py-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-purple-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
              <div className="h-20 rounded-xl bg-slate-100" />
            </div>
            <div className="h-24 rounded-xl bg-purple-50/70" />
          </div>
        )}

        {/* Error State */}
        {!loading && errorStatus && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-6 text-center">
            <AlertTriangle className="size-6 text-amber-700" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-slate-950">
                Career Intelligence Unavailable
              </p>
              <p className="max-w-md text-xs font-medium text-slate-700">
                The career intelligence engine could not locate records for this candidate. Please ensure database is seeded.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchIntelligence}
              className="mt-1 h-8 text-xs font-bold border-slate-300 bg-white hover:bg-slate-100"
            >
              <RefreshCw className="mr-1.5 size-3.5" /> Retry Synthesis
            </Button>
          </div>
        )}

        {/* Success Content */}
        {!loading && data && (
          <div className="flex flex-col gap-5">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Career Trajectory
                </span>
                <div className="mt-2 flex items-center">
                  <Badge
                    variant={outcomeVariantMap[data.careerOutcome] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.careerOutcome}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Training Alignment
                </span>
                <div className="mt-2 flex items-center">
                  <Badge
                    variant={alignmentVariantMap[data.trainingEmploymentAlignment] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.trainingEmploymentAlignment}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Retention Risk
                  </span>
                  <Badge
                    variant={riskVariantMap[data.riskLevel] || 'neutral'}
                    className="text-xs font-bold px-2.5 py-0.5"
                  >
                    {data.riskLevel}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Model Confidence:</span>
                    <span className="font-extrabold text-slate-950 tabular-nums">
                      {data.outcomeConfidence}%
                    </span>
                  </div>
                  <Progress value={data.outcomeConfidence} className="h-1.5" />
                </div>
              </div>
            </div>

            {/* Strategic Narrative */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4 text-slate-900 shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Brain className="size-4 text-purple-700" aria-hidden="true" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950">
                  Synthesized Career Insight
                </h4>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed font-medium text-slate-900 text-pretty">
                {data.careerInsight}
              </p>
            </div>

            {/* Alignment & Risk Detailed Reasons */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-950">
                  <CheckCircle2 className="size-3.5 text-emerald-700" />
                  <span>Alignment Rationale</span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {data.alignmentReason}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-950">
                  <AlertCircle className="size-3.5 text-amber-700" />
                  <span>Retention Risk Assessment</span>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {data.riskReason}
                </p>
              </div>
            </div>

            {/* Recommended Next Skill Card */}
            <div className="flex items-start gap-3.5 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-slate-900 shadow-2xs">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs">
                <Lightbulb className="size-4.5" aria-hidden="true" />
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                    Recommended Next Skill:
                  </span>
                  <Badge variant="default" className="text-xs font-bold py-0.5 px-2.5">
                    {data.recommendedNextSkill?.skill || 'Domain Skill Enhancement'}
                  </Badge>
                </div>
                <p className="text-xs font-medium text-slate-800 leading-relaxed text-pretty">
                  {data.recommendedNextSkill?.rationale}
                </p>
              </div>
            </div>

            {/* Evidence Grounding Badges */}
            <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                <FileCheck className="size-3.5 text-blue-700" aria-hidden="true" />
                <span>Evidence Grounding:</span>
              </div>
              {evidenceItems.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {evidenceItems.map((ev: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono font-bold text-slate-800 shadow-2xs"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-1 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-medium italic">
                {isFallback
                  ? 'Synthesized from verified training, employment, verification, and wage evidence (evidence-grounded fallback mode).'
                  : 'AI-generated from available verified training, employment, verification, and wage evidence.'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
