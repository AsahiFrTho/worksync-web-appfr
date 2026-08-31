'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  BadgeCheck,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  TimerReset,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  FileCheck2,
  UserCheck,
  FileBadge,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ITraineePopulated {
  _id: string
  traineeId: string
  name: string
  district: string
  course: string
  status: string
}

interface IEmploymentRecordItem {
  _id: string
  trainee: ITraineePopulated | null
  traineeId: string
  employerName: string
  employerContactEmail?: string
  jobRole: string
  employmentType: string
  district: string
  startDate: string
  monthlyWage: number
  trainingRelevance?: 'directly_related' | 'partially_related' | 'unrelated'
  verificationStatus: 'pending' | 'verified' | 'disputed' | 'flagged'
  verificationMetadata?: {
    verifiedAt?: string
    verifiedBy?: string
    disputeReason?: string
    remarks?: string
    method?: string
  }
}

const statusMeta = {
  verified: {
    label: 'Verified Outcome',
    variant: 'success' as const,
    Icon: BadgeCheck,
    cardClasses:
      'border-border border-l-2 border-l-success bg-card hover:bg-muted/40',
    badgeClasses: 'bg-success/15 text-success border-success/30 font-medium',
    badgeTextClass: 'text-success',
    iconColor: 'text-success',
    evidenceBoxClasses: 'border-success/30 bg-success/10 text-foreground',
    evidenceBorderClass: 'border-border',
    tagClass: 'bg-success/10 text-success border-success/30',
  },
  pending: {
    label: 'Pending Verification',
    variant: 'warning' as const,
    Icon: Clock,
    cardClasses:
      'border-border border-l-2 border-l-warning bg-card hover:bg-muted/40',
    badgeClasses: 'bg-warning/15 text-warning border-warning/30 font-medium',
    badgeTextClass: 'text-warning',
    iconColor: 'text-warning',
    evidenceBoxClasses: 'border-warning/30 bg-warning/10 text-foreground',
    evidenceBorderClass: 'border-border',
    tagClass: 'bg-warning/10 text-warning border-warning/30',
  },
  disputed: {
    label: 'Disputed Claim',
    variant: 'destructive' as const,
    Icon: AlertTriangle,
    cardClasses:
      'border-border border-l-2 border-l-destructive bg-card hover:bg-muted/40',
    badgeClasses: 'bg-destructive/15 text-destructive border-destructive/30 font-medium',
    badgeTextClass: 'text-destructive',
    iconColor: 'text-destructive',
    evidenceBoxClasses: 'border-destructive/30 bg-destructive/10 text-foreground',
    evidenceBorderClass: 'border-border',
    tagClass: 'bg-destructive/10 text-destructive border-destructive/30',
  },
  flagged: {
    label: 'Needs Review',
    variant: 'destructive' as const,
    Icon: AlertTriangle,
    cardClasses:
      'border-border border-l-2 border-l-destructive bg-card hover:bg-muted/40',
    badgeClasses: 'bg-destructive/15 text-destructive border-destructive/30 font-medium',
    badgeTextClass: 'text-destructive',
    iconColor: 'text-destructive',
    evidenceBoxClasses: 'border-destructive/30 bg-destructive/10 text-foreground',
    evidenceBorderClass: 'border-border',
    tagClass: 'bg-destructive/10 text-destructive border-destructive/30',
  },
}

const relevanceMeta = {
  directly_related: {
    label: 'Direct Trade Alignment',
    variant: 'success' as const,
    badgeClasses: 'bg-success/10 text-success border-success/30 font-medium',
  },
  partially_related: {
    label: 'Partially Related',
    variant: 'warning' as const,
    badgeClasses: 'bg-warning/10 text-warning border-warning/30 font-medium',
  },
  unrelated: {
    label: 'Unrelated Sector',
    variant: 'neutral' as const,
    badgeClasses: 'bg-muted text-muted-foreground border-border font-medium',
  },
}

const methodLabels: Record<string, string> = {
  employer_portal: 'Employer Direct Verification Portal',
  hr_call: 'HR Telephonic Verification Cell',
  offer_letter: 'Offer Letter & Joining Audit',
  payslip: 'Monthly Payslip Verification',
  pf_uan: 'EPFO / UAN Confirmation',
}

const inr = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)

export default function EmployerPage() {
  const [records, setRecords] = useState<IEmploymentRecordItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ id: string; type: 'success' | 'error'; message: string } | null>(null)

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'disputed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/employment?isCurrent=true')
      const data = await res.json()

      if (data.success && Array.isArray(data.employmentRecords)) {
        setRecords(data.employmentRecords)
      } else {
        setError(data.error || 'Failed to load employment records')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error loading records')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const handleConfirm = async (id: string) => {
    setActionInProgress(id)
    setFeedback(null)
    try {
      const res = await fetch(`/api/employment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'verified',
          verifiedBy: 'Employer HR',
        }),
      })
      const data = await res.json()

      if (data.success && data.employmentRecord) {
        setFeedback({
          id,
          type: 'success',
          message: 'Employment successfully confirmed & stamped in database!',
        })
        setRecords((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...data.employmentRecord } : r))
        )
      } else {
        setFeedback({
          id,
          type: 'error',
          message: data.error || 'Failed to verify employment',
        })
      }
    } catch (err) {
      setFeedback({
        id,
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error during verification',
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleDispute = async (id: string, reason: string = 'Trainee did not join on scheduled start date') => {
    setActionInProgress(id)
    setFeedback(null)
    try {
      const res = await fetch(`/api/employment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'disputed',
          disputeReason: reason,
        }),
      })
      const data = await res.json()

      if (data.success && data.employmentRecord) {
        setFeedback({
          id,
          type: 'success',
          message: `Record marked as disputed: "${reason}".`,
        })
        setRecords((prev) =>
          prev.map((r) => (r._id === id ? { ...r, ...data.employmentRecord } : r))
        )
      } else {
        setFeedback({
          id,
          type: 'error',
          message: data.error || 'Failed to dispute record',
        })
      }
    } catch (err) {
      setFeedback({
        id,
        type: 'error',
        message: err instanceof Error ? err.message : 'Network error during dispute',
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Aggregate counts
  const totalCount = records.length
  const verifiedCount = records.filter((e) => e.verificationStatus === 'verified').length
  const pendingCount = records.filter((e) => e.verificationStatus === 'pending').length
  const disputedCount = records.filter(
    (e) => e.verificationStatus === 'disputed' || e.verificationStatus === 'flagged'
  ).length

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Status filter
      if (statusFilter === 'pending' && rec.verificationStatus !== 'pending') return false
      if (statusFilter === 'verified' && rec.verificationStatus !== 'verified') return false
      if (
        statusFilter === 'disputed' &&
        rec.verificationStatus !== 'disputed' &&
        rec.verificationStatus !== 'flagged'
      )
        return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const traineeName = (rec.trainee?.name || '').toLowerCase()
        const traineeId = (rec.traineeId || '').toLowerCase()
        const employer = (rec.employerName || '').toLowerCase()
        const role = (rec.jobRole || '').toLowerCase()
        const course = (rec.trainee?.course || '').toLowerCase()
        const district = (rec.district || rec.trainee?.district || '').toLowerCase()

        return (
          traineeName.includes(q) ||
          traineeId.includes(q) ||
          employer.includes(q) ||
          role.includes(q) ||
          course.includes(q) ||
          district.includes(q)
        )
      }

      return true
    })
  }, [records, statusFilter, searchQuery])

  return (
    <AppShell>
      <PageHeader
        eyebrow="EMPLOYER VERIFICATION"
        title="Employment Outcome Verification Command Center"
        description="Review, validate, and resolve employment outcome claims reported by trainees and training providers across Maharashtra. Real-time employer verification turns reported placements into authoritative, audit-ready skilling evidence."
      />

      {/* Expanded Canvas Container (1180–1240px wide matching Trainee Passport) */}
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* 1. TOP VERIFICATION KPI STRIP (4-Metric Operational Health with Semantic Visual Identity) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: TOTAL CLAIMS (Primary / Government Navy) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-[4px] border-l-primary bg-card p-5 shadow-2xs transition-all duration-200 hover:bg-muted/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Claims
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary shadow-2xs">
                <Users className="size-4.5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums">
                {totalCount}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 text-xs font-medium text-muted-foreground">
              Submitted placement records
            </div>
          </div>

          {/* Card 2: PENDING ACTION (Amber / Warning) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-[4px] border-l-warning bg-card p-5 shadow-2xs transition-all duration-200 hover:bg-muted/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pending Action
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-warning/30 bg-warning/10 text-warning shadow-2xs">
                <TimerReset className="size-4.5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums">
                {pendingCount}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 text-xs font-medium text-muted-foreground">
              Awaiting employer audit
            </div>
          </div>

          {/* Card 3: VERIFIED OUTCOMES (Emerald / Verified Evidence) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-[4px] border-l-success bg-card p-5 shadow-2xs transition-all duration-200 hover:bg-muted/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verified Outcomes
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-success/30 bg-success/10 text-success shadow-2xs">
                <ShieldCheck className="size-4.5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums">
                {verifiedCount}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 text-xs font-medium text-muted-foreground">
              Employment confirmed in DB
            </div>
          </div>

          {/* Card 4: DISPUTED / FLAGGED (Rose / Dispute) */}
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-border border-l-[4px] border-l-destructive bg-card p-5 shadow-2xs transition-all duration-200 hover:bg-muted/30 hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Disputed / Flagged
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive shadow-2xs">
                <AlertTriangle className="size-4.5" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground tabular-nums">
                {disputedCount}
              </span>
            </div>
            <div className="border-t border-border pt-2.5 text-xs font-medium text-muted-foreground">
              Outcome disputes recorded
            </div>
          </div>
        </section>

        {/* 2. VERIFICATION PIPELINE VISUAL RIBBON */}
        <Card className="overflow-hidden border border-border bg-card shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-5 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <span className="font-bold uppercase tracking-wider text-foreground text-[10px] sm:text-xs">
                Longitudinal Verification Pipeline Overview
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
              OPERATIONAL AUDIT TRAIL
            </span>
          </div>

          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Stage 1: Placement Claim */}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3 text-xs shadow-2xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-primary font-black text-xs shadow-xs">
                  01
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground">Placement Reported</span>
                  <span className="text-muted-foreground font-medium text-[11px]">
                    Candidate & institution report job offer
                  </span>
                  <span className="mt-1 font-mono text-[11px] font-bold text-primary">
                    {totalCount} claims in registry
                  </span>
                </div>
              </div>

              {/* Stage 2: Employer Review */}
              <div className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs shadow-2xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning text-warning-foreground font-black text-xs shadow-xs">
                  02
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-warning">Employer Verification Review</span>
                  <span className="text-muted-foreground font-medium text-[11px]">
                    Employer confirms joining, role & wage
                  </span>
                  <span className="mt-1 font-mono text-[11px] font-bold text-warning">
                    {pendingCount} awaiting confirmation
                  </span>
                </div>
              </div>

              {/* Stage 3: Longitudinal Outcome */}
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-3 text-xs shadow-2xs">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground font-black text-xs shadow-xs">
                  03
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-success">Verified Outcome / Audit</span>
                  <span className="text-muted-foreground font-medium text-[11px]">
                    30 / 90 / 180 / 365-day retention tracked
                  </span>
                  <span className="mt-1 font-mono text-[11px] font-bold text-success">
                    {verifiedCount} verified · {disputedCount} disputed
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. OPERATIONAL VERIFICATION QUEUE & FILTERS */}
        <Card className="overflow-hidden border border-border bg-card shadow-xs">
          {/* Queue Header with Controls */}
          <CardHeader className="border-b border-border bg-muted/20 px-5 py-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/20 text-primary shadow-xs">
                    <ShieldCheck className="size-4.5" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-bold text-foreground sm:text-lg">
                      Verification Queue
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      Audit and validate employment claims against live database records
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRecords}
                  disabled={loading}
                  className="h-8.5 text-xs font-bold border-border bg-card hover:bg-muted text-foreground shadow-2xs"
                >
                  {loading ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1.5 size-3.5 text-primary" />
                  )}
                  Refresh Queue
                </Button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-border md:flex-row md:items-center md:justify-between">
              {/* Status Segmented Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs',
                    statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  All Claims ({totalCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs',
                    statusFilter === 'pending'
                      ? 'bg-warning text-warning-foreground shadow-xs'
                      : 'border border-border bg-card text-muted-foreground hover:bg-warning/10 hover:text-warning hover:border-warning/30'
                  )}
                >
                  <Clock className="size-3" />
                  Pending Action ({pendingCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('verified')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs',
                    statusFilter === 'verified'
                      ? 'bg-success text-success-foreground shadow-xs'
                      : 'border border-border bg-card text-muted-foreground hover:bg-success/10 hover:text-success hover:border-success/30'
                  )}
                >
                  <BadgeCheck className="size-3" />
                  Verified ({verifiedCount})
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter('disputed')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow-2xs',
                    statusFilter === 'disputed'
                      ? 'bg-destructive text-destructive-foreground shadow-xs'
                      : 'border border-border bg-card text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                  )}
                >
                  <AlertTriangle className="size-3" />
                  Disputed ({disputedCount})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search candidate, ID, employer, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {/* Loading State: Skeleton Pulse Cards */}
            {loading && records.length === 0 ? (
              <div className="flex flex-col gap-4 py-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-48 rounded bg-muted" />
                      <div className="h-5 w-24 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-72 rounded bg-muted" />
                    <div className="h-14 rounded-lg bg-muted/60" />
                  </div>
                ))}
              </div>
            ) : error && records.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
                <AlertTriangle className="size-8 text-destructive" />
                <p className="text-sm font-bold text-destructive">Database Connection Error</p>
                <p className="max-w-md text-xs font-medium text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRecords}
                  className="mt-2 text-xs font-bold border-destructive/30 bg-card text-foreground hover:bg-destructive/10"
                >
                  <RefreshCw className="mr-1.5 size-3.5" /> Retry Connection
                </Button>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <ShieldCheck className="size-8 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">
                  {statusFilter === 'pending'
                    ? 'No Pending Employment Records'
                    : statusFilter === 'verified'
                    ? 'No Verified Records Found'
                    : statusFilter === 'disputed'
                    ? 'No Disputed Records in Registry'
                    : 'No Matching Employment Claims Found'}
                </p>
                <p className="max-w-md text-xs font-medium text-muted-foreground">
                  {searchQuery
                    ? `No records matched your search query "${searchQuery}". Try clearing filters.`
                    : statusFilter === 'pending'
                    ? 'All submitted employment claims have been audited and resolved.'
                    : 'Adjust the filter criteria above or refresh the queue.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter('all')
                      setSearchQuery('')
                    }}
                    className="mt-2 text-xs font-bold border-border bg-card hover:bg-muted text-foreground"
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              /* Operational Records Queue with High-Impact Semantic Status Treatment */
              <div className="flex flex-col gap-4">
                {filteredRecords.map((e) => {
                  const meta = statusMeta[e.verificationStatus] || statusMeta.pending
                  const Icon = meta.Icon
                  const relevance = e.trainingRelevance
                    ? relevanceMeta[e.trainingRelevance]
                    : relevanceMeta.directly_related
                  const traineeName = e.trainee?.name || e.traineeId
                  const traineeInitials = traineeName
                    .split(' ')
                    .map((p: string) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()
                  const courseName = e.trainee?.course || 'Vocational Trade'
                  const candidateDistrict = e.district || e.trainee?.district || 'Maharashtra'
                  const formattedDate = e.startDate
                    ? new Date(e.startDate).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'
                  const isItemProcessing = actionInProgress === e._id
                  const itemFeedback = feedback?.id === e._id ? feedback : null
                  const verifiedAtDate = e.verificationMetadata?.verifiedAt
                    ? new Date(e.verificationMetadata.verifiedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : null
                  const verificationMethodStr = e.verificationMetadata?.method
                    ? methodLabels[e.verificationMetadata.method] || e.verificationMetadata.method.replace(/_/g, ' ')
                    : 'Employer Verification Portal'

                  return (
                    <div
                      key={e._id}
                      className={cn(
                        'flex flex-col gap-4 rounded-xl border p-5 transition-all shadow-xs duration-200 hover:shadow-md',
                        meta.cardClasses
                      )}
                    >
                      {/* 1. TOP HEADER: STATUS -> CANDIDATE -> WAGE (Immediate Scannability) */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
                        {/* Candidate Identity Profile */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/80 to-primary font-black text-primary-foreground text-xs shadow-xs border border-border">
                            {traineeInitials}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 min-w-0">
                            <span className="text-base font-black tracking-tight text-foreground sm:text-lg truncate">
                              {traineeName}
                            </span>
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/25 shadow-2xs shrink-0">
                              {e.traineeId}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges & Reported Wage */}
                        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                          <Badge className={cn('text-xs px-3 py-1 shadow-xs', meta.badgeClasses)}>
                            <Icon className={cn('size-3.5 mr-1.5', meta.iconColor)} aria-hidden="true" />
                            <span className={meta.badgeTextClass}>{meta.label}</span>
                          </Badge>

                          <Badge className={cn('text-xs px-2.5 py-1 border shadow-2xs', relevance.badgeClasses)}>
                            {relevance.label}
                          </Badge>

                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground bg-muted/40 px-3 py-1 rounded-md border border-border shadow-2xs">
                            <span className="text-muted-foreground font-semibold">Reported:</span>
                            <span className="text-foreground font-extrabold tabular-nums">{inr(e.monthlyWage)}/mo</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. INNER INFORMATION PANELS: EMPLOYER, ROLE, TRADE & CONTEXT */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        {/* Panel 1: Employer & Role */}
                        <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3.5 border border-border shadow-2xs">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                            <Building2 className="size-4.5" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                              Employer & Job Role
                            </span>
                            <span className="font-bold text-foreground text-xs sm:text-sm truncate mt-0.5">
                              {e.employerName}
                            </span>
                            <span className="font-semibold text-muted-foreground truncate">{e.jobRole}</span>
                            <span className="text-[11px] text-muted-foreground/80 capitalize mt-0.5">
                              {e.employmentType ? e.employmentType.replace(/_/g, ' ') : 'Full Time Employment'}
                            </span>
                          </div>
                        </div>

                        {/* Panel 2: Certified Trade & Location */}
                        <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-3.5 border border-border shadow-2xs">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                            <GraduationCap className="size-4.5" />
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                              Certified Trade & Location
                            </span>
                            <span className="font-bold text-foreground text-xs sm:text-sm truncate mt-0.5">
                              {courseName}
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground font-medium text-[11px] mt-0.5">
                              <MapPin className="size-3 text-muted-foreground/70 shrink-0" /> {candidateDistrict} District
                            </span>
                            <span className="flex items-center gap-1 text-muted-foreground font-medium text-[11px]">
                              <Calendar className="size-3 text-muted-foreground/70 shrink-0" /> Joining Date: {formattedDate}
                            </span>
                          </div>
                        </div>

                        {/* Panel 3: Registry Status / Quick Action */}
                        <div className="flex flex-col justify-center gap-2 rounded-lg bg-muted/30 p-3.5 border border-border shadow-2xs md:col-span-2 lg:col-span-1">
                          {e.verificationStatus === 'verified' ? (
                            <div className="flex items-center gap-2">
                              <div className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success/15 py-2 text-xs font-bold text-success shadow-2xs">
                                <CheckCircle2 className="size-4 text-success" />
                                <span>Authoritative Registry Record</span>
                              </div>
                            </div>
                          ) : e.verificationStatus === 'disputed' ? (
                            <div className="flex items-center gap-2">
                              <div className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/15 py-2 text-xs font-bold text-destructive shadow-2xs">
                                <XCircle className="size-4 text-destructive" />
                                <span>Flagged Audit Dispute</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDispute(e._id, 'Trainee did not join on scheduled start date')}
                                disabled={isItemProcessing}
                                className="flex-1 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 font-bold text-xs h-9 shadow-2xs"
                              >
                                {isItemProcessing ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  'Dispute'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirm(e._id)}
                                disabled={isItemProcessing}
                                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 shadow-xs"
                              >
                                {isItemProcessing ? (
                                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                ) : (
                                  <BadgeCheck className="mr-1.5 size-4" />
                                )}
                                Confirm
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. VERIFIED EVIDENCE SECTION (Emerald Green Treatment) */}
                      {e.verificationStatus === 'verified' && (
                        <div className={cn('rounded-lg border p-4 text-xs shadow-2xs', meta.evidenceBoxClasses)}>
                          <div className="flex flex-wrap items-center justify-between gap-2 font-bold border-b border-success/20 pb-2.5">
                            <span className="flex items-center gap-2 text-success text-xs sm:text-[13px]">
                              <FileCheck2 className="size-4.5 text-success" />
                              <span>✓ AUTHORITATIVE REGISTRY EVIDENCE</span>
                            </span>
                            {verifiedAtDate && (
                              <span className="text-success text-[11px] font-bold bg-success/20 px-2.5 py-0.5 rounded border border-success/30">
                                Verified: {verifiedAtDate}
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-foreground">
                            <div>
                              <span className="text-muted-foreground font-semibold">Verified By: </span>
                              <strong className="font-bold text-foreground">{e.verificationMetadata?.verifiedBy || 'Employer HR'}</strong>
                            </div>
                            <div>
                              <span className="text-muted-foreground font-semibold">Audit Channel: </span>
                              <strong className="font-bold text-foreground">{verificationMethodStr}</strong>
                            </div>
                          </div>

                          {e.verificationMetadata?.remarks && (
                            <div className="mt-2.5 rounded-md bg-background/60 p-3 text-xs font-medium text-foreground italic border border-success/20 shadow-2xs">
                              &ldquo;{e.verificationMetadata.remarks}&rdquo;
                            </div>
                          )}

                          <div className="mt-2 text-[11px] text-success font-semibold pt-1">
                            Joining and wage outcome confirmed and stamped into longitudinal retention tracking ledger.
                          </div>
                        </div>
                      )}

                      {/* 4. DISPUTED SECTION (Rose Red Treatment — Surfacing WHY it failed) */}
                      {e.verificationStatus === 'disputed' && (
                        <div className={cn('rounded-lg border p-4 text-xs shadow-2xs', meta.evidenceBoxClasses)}>
                          <div className="flex items-center gap-2 font-black text-destructive border-b border-destructive/20 pb-2.5">
                            <AlertTriangle className="size-4.5 text-destructive shrink-0" />
                            <span className="text-xs sm:text-[13px] uppercase tracking-wider">⚠ OFFICIAL DISPUTE REASON</span>
                          </div>

                          <div className="mt-2.5 rounded-md bg-background/60 p-3 border border-destructive/20 shadow-2xs">
                            <p className="text-sm font-bold text-destructive">
                              {e.verificationMetadata?.disputeReason || 'Trainee did not join on scheduled start date'}
                            </p>
                            {e.verificationMetadata?.remarks && (
                              <p className="mt-1.5 text-xs font-medium text-muted-foreground italic pt-1.5 border-t border-border">
                                &ldquo;{e.verificationMetadata.remarks}&rdquo;
                              </p>
                            )}
                          </div>

                          <div className="mt-2 text-[11px] text-destructive font-semibold pt-1">
                            Flagged for Maharashtra State Skill Development Society (MSSDS) coordinator and placement cell intervention.
                          </div>
                        </div>
                      )}

                      {/* 5. PENDING ACTION BANNER (Amber Treatment) */}
                      {e.verificationStatus === 'pending' && (
                        <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border p-3.5 text-xs shadow-2xs', meta.evidenceBoxClasses)}>
                          <div className="flex items-center gap-2.5 font-medium text-foreground">
                            <Clock className="size-4.5 text-warning shrink-0" />
                            <span>
                              <strong className="font-bold text-warning">Action Required:</strong> Review reported job offer and confirm candidate has joined with reported wage, or dispute claim.
                            </span>
                          </div>
                          <span className="font-bold text-[11px] uppercase tracking-wider text-warning bg-warning/20 px-2.5 py-1 rounded border border-warning/30 shrink-0 self-start sm:self-auto shadow-2xs">
                            Awaiting Employer Action
                          </span>
                        </div>
                      )}

                      {/* Feedback Banner */}
                      {itemFeedback && (
                        <div
                          className={cn(
                            'flex items-center gap-2 rounded-lg p-3 text-xs font-bold shadow-2xs',
                            itemFeedback.type === 'success'
                              ? 'border border-success/30 bg-success/10 text-success'
                              : 'border border-destructive/30 bg-destructive/10 text-destructive'
                          )}
                        >
                          {itemFeedback.type === 'success' ? (
                            <CheckCircle2 className="size-4 text-success shrink-0" />
                          ) : (
                            <XCircle className="size-4 text-destructive shrink-0" />
                          )}
                          <span>{itemFeedback.message}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
