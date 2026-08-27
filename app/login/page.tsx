'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Building2,
  GraduationCap,
  Briefcase,
  IdCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Check,
  Lock,
  MapPin,
  Loader2,
  Info,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { summary } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface RoleOption {
  id: string
  title: string
  marathiTitle: string
  category: string
  targetHref: string
  icon: typeof Building2
  persona: {
    name: string
    designation: string
    organization: string
    location: string
  }
  description: string
  highlights: string[]
  badgeText: string
  primaryActionLabel: string
}

const roles: RoleOption[] = [
  {
    id: 'admin',
    title: 'Government / Administrator',
    marathiTitle: 'शासकीय / प्रशासक',
    category: 'State & District Directorate',
    targetHref: '/dashboard',
    icon: Building2,
    persona: {
      name: 'Dr. Sanjay Patil',
      designation: 'Director of Policy & Analytics',
      organization: 'Maharashtra State Skill Development Society (MSSDS)',
      location: 'Mantralaya, Mumbai',
    },
    description:
      'Statewide longitudinal outcomes, 12-district comparative analytics, certification-to-placement funnels, wage growth indices, and 6-month retention monitoring.',
    highlights: [
      'Executive KPI Funnel (Enrolled → Certified → Retained)',
      '12-District & Course-Wise Performance Benchmarks',
      'Longitudinal Wage Growth & 6-Month Retention Audits',
    ],
    badgeText: 'Executive Oversight',
    primaryActionLabel: 'Enter Administrator Portal',
  },
  {
    id: 'provider',
    title: 'Training Provider',
    marathiTitle: 'प्रशिक्षण संस्था',
    category: 'VTPs, ITIs & Implementing Agencies',
    targetHref: '/analytics',
    icon: GraduationCap,
    persona: {
      name: 'Sahyadri Vocational Institute',
      designation: 'Centre Head / Training Officer',
      organization: 'Affiliated to MSSDS (Pune & Nashik Centres)',
      location: 'Pune Center (96 Active VTPs)',
    },
    description:
      'Batch certification outcomes, skill gap diagnostics mapped against live employer demand, trade-wise placement rates, and candidate non-placement root causes.',
    highlights: [
      'Trade Skill-Gap Matrix vs. Industry Demand',
      'Course Placement Rates & Median Wage Metrics',
      'Dropout & Unplaced Trainee Diagnostic Signals',
    ],
    badgeText: 'Curriculum & Gaps',
    primaryActionLabel: 'Enter Provider Analytics',
  },
  {
    id: 'employer',
    title: 'Employer',
    marathiTitle: 'नियोक्ता / उद्योग भागीदार',
    category: 'Industry & Hiring Partners',
    targetHref: '/employer',
    icon: Briefcase,
    persona: {
      name: 'Deccan Electricals Pvt. Ltd.',
      designation: 'HR Operations & Talent Verification Cell',
      organization: 'Chakan Industrial Area, Pune',
      location: 'Manufacturing & Power Sector',
    },
    description:
      'Direct candidate employment confirmation, wage verification, 30/90/180-day retention milestone audits, and trade relevance validation.',
    highlights: [
      '1-Click Employment & Wage Record Confirmation',
      '30-Day, 90-Day & 180-Day Retention Milestones',
      'Direct Trade Alignment & Dispute Flagging',
    ],
    badgeText: 'Verification & Retention',
    primaryActionLabel: 'Enter Employer Portal',
  },
  {
    id: 'trainee',
    title: 'Trainee',
    marathiTitle: 'प्रशिक्षणार्थी उमेदवार',
    category: 'Certified Candidate & Alumni',
    targetHref: '/trainee',
    icon: IdCard,
    persona: {
      name: 'Rahul Pawar',
      designation: 'Trainee ID: KP-0001 (Electrician)',
      organization: 'Yashaswi Skill Academy, Pune',
      location: 'Employed at Deccan Electricals (₹16,800/mo)',
    },
    description:
      'Verifiable Trainee Outcome Passport, NSQF Level 4 certification records, verified multi-stage employment timeline, and AI Career Intelligence recommendations.',
    highlights: [
      'Verifiable Digital Outcome Passport (NSQF Level 4)',
      'Multi-Stage Retention & Monthly Wage Timeline',
      'AI Career Intelligence & Upskilling Pathways',
    ],
    badgeText: 'Outcome Passport',
    primaryActionLabel: 'Enter Trainee Passport',
  },
]

const JOURNEY_STEPS = [
  { label: 'Train', tint: '' },
  { label: 'Certify', tint: '' },
  { label: 'Place', tint: '' },
  { label: 'Verify', tint: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' },
  { label: 'Retain', tint: 'border-amber-400/40 bg-amber-400/10 text-amber-300' },
  { label: 'Progress', tint: 'border-violet-400/40 bg-violet-400/10 text-violet-300' },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState<string>('admin')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0]

  const handleQuickLaunch = (targetHref: string) => {
    setIsLoading(true)
    router.push(targetHref)
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT — always-dark institutional brand panel (readable in both themes)    */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0e1424] via-[#0b101c] to-[#0a0e17] p-6 text-white sm:p-8 lg:col-span-5 lg:p-12">
          {/* Decorative background asset */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-no-repeat opacity-40 select-none"
            style={{
              backgroundImage: "url('/login-bg.png')",
              backgroundPosition: 'center bottom',
              backgroundSize: 'cover',
            }}
            aria-hidden="true"
          />
          {/* Soft primary glow for depth */}
          <div
            className="pointer-events-none absolute inset-0 z-0 opacity-60 select-none"
            style={{
              background:
                'radial-gradient(circle at 62% 38%, rgba(140,160,248,0.18) 0%, rgba(11,15,23,0.1) 45%, transparent 72%)',
            }}
            aria-hidden="true"
          />
          {/* Subtle top sheen */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-white/[0.06] to-transparent"
            aria-hidden="true"
          />

          <div className="relative z-10">
            {/* Brand */}
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] p-1 shadow-soft backdrop-blur-sm">
                <Image
                  src="/favicon1.png"
                  alt="Kaushal Emblem"
                  width={40}
                  height={40}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold tracking-tight text-white">
                    KAUSHAL<span className="text-[#a5b4fc]">PULSE</span>
                  </span>
                  <span className="text-white/25">|</span>
                  <span className="text-[11px] font-medium text-white/60">
                    महाराष्ट्र शासन
                  </span>
                </div>
                <p className="text-[11px] font-normal text-white/50">
                  Department of Skills, Employment & Innovation
                </p>
              </div>
            </div>

            {/* Identity */}
            <div className="mt-8 lg:mt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm">
                <Sparkles className="size-3.5 text-[#a5b4fc]" />
                <span>Skilling Outcome Intelligence Platform</span>
              </div>

              <h1 className="mt-4 text-2xl font-semibold leading-[1.2] tracking-tight text-white text-balance sm:text-3xl">
                From training and certification to verified employment, retention and wage progression.
              </h1>

              <p className="mt-3 text-xs font-normal leading-relaxed text-white/55 sm:text-sm">
                A unified, verifiable outcome monitoring platform tracking every candidate across the longitudinal skill-to-employment trajectory in Maharashtra.
              </p>
            </div>

            {/* Longitudinal journey */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <span className="mb-3 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Longitudinal Skilling Journey
              </span>
              <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-medium">
                {JOURNEY_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className={cn(
                      'rounded-lg border p-2 text-white/75 transition-all duration-300 ease-premium hover:-translate-y-0.5',
                      step.tint || 'border-white/10 bg-white/[0.05]',
                    )}
                  >
                    <span className={cn('block pb-1 text-[8px] font-semibold', step.tint ? '' : 'text-white/35')}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {step.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence pillars */}
            <div className="mt-3.5 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-xs backdrop-blur-sm">
              <span className="mb-2.5 block text-[10px] font-semibold uppercase tracking-wider text-white/45">
                Evidence-Led Outcome Monitoring
              </span>
              <div className="grid grid-cols-1 gap-2 font-medium text-white/75 sm:grid-cols-2">
                {['Verified Employment', 'Longitudinal Retention', 'Wage Progression', 'Programme Intelligence'].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 border border-emerald-400/30">
                        <Check className="size-2.5 text-emerald-300 stroke-[3]" />
                      </span>
                      <span>{item}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Aggregate metrics */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3.5 backdrop-blur-sm transition-all duration-300 ease-premium hover:border-blue-400/30">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-white/45">
                  <span>Tracked Candidates</span>
                  <Users className="size-3 text-[#a5b4fc]" />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {summary.totalTrainees.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] font-normal text-white/40">
                  {summary.activeDistricts} Active Districts
                </span>
              </div>

              <div className="rounded-xl border border-emerald-400/25 bg-white/[0.05] p-3.5 backdrop-blur-sm transition-all duration-300 ease-premium hover:border-emerald-400/40">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-emerald-300/80">
                  <span>Verified Retention</span>
                  <ShieldCheck className="size-3.5 text-emerald-300" />
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-300">
                  {summary.retentionRate}%
                </p>
                <span className="text-[10px] font-normal text-white/40">6-Month Stability</span>
              </div>
            </div>
          </div>

          {/* Left footer */}
          <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-[11px] font-normal text-white/40">
            <span>Maharashtra State Skill Development Society (MSSDS)</span>
            <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-white/60">
              MSSDS • EVALUATION
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT — theme-token login panel                                            */}
        {/* ========================================================================= */}
        <div className="flex flex-col justify-between bg-card p-6 sm:p-8 lg:col-span-7 lg:p-12">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[26px]">
                  Sign in to Kaushal
                </h2>
                <p className="mt-1 text-xs font-normal text-muted-foreground sm:text-sm">
                  Access your skilling outcome intelligence workspace.
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ShieldCheck className="size-3.5" />
                <span>Authorized Gateway</span>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Select Stakeholder Persona:
              </span>
              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {roles.map((role) => {
                  const Icon = role.icon
                  const isSelected = selectedRoleId === role.id
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 ease-premium cursor-pointer',
                        isSelected
                          ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/30 shadow-soft'
                          : 'border-border bg-card hover:border-primary/25 hover:bg-muted/40',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ease-premium',
                          isSelected
                            ? 'border-primary/40 bg-primary text-primary-foreground shadow-soft'
                            : 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-semibold text-foreground sm:text-sm">
                            {role.title.split('/')[0].trim()}
                          </span>
                          {isSelected && (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="mt-0.5 truncate text-[11px] font-normal text-muted-foreground">
                          {role.marathiTitle}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dossier */}
            <Card className="shadow-card">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/25 text-primary">
                      {selectedRole.icon && <selectedRole.icon className="size-5" />}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold leading-tight text-foreground">
                        {selectedRole.persona.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                        {selectedRole.persona.designation}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="self-start text-[11px] sm:self-auto">
                    {selectedRole.badgeText}
                  </Badge>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="size-3.5 shrink-0 text-primary" />
                    <span>{selectedRole.persona.organization}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                    <span>{selectedRole.persona.location}</span>
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed font-normal text-muted-foreground">
                  {selectedRole.description}
                </p>

                <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                  <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Operational Capabilities:
                  </span>
                  {selectedRole.highlights.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs font-medium text-foreground/85"
                    >
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-border pt-4">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => handleQuickLaunch(selectedRole.targetHref)}
                    disabled={isLoading}
                    className="h-12 w-full justify-between rounded-xl text-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Lock className="size-4" />
                      )}
                      <span>{isLoading ? 'Authenticating...' : selectedRole.primaryActionLabel}</span>
                    </span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Governance notice */}
            <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-[11px] leading-relaxed font-normal text-muted-foreground sm:text-xs">
                  <strong className="font-semibold text-foreground">Prototype Access Architecture: </strong>
                  This evaluation portal provides immediate role-based inspection of Maharashtra skilling outcome data.
                  In production, authentication connects to State Single Sign-On (SSO) and Aadhaar e-KYC verified candidate registries.
                </div>
              </div>
            </div>
          </div>

          {/* Right footer */}
          <footer className="mx-auto mt-8 w-full max-w-2xl border-t border-border pt-4 text-center text-xs font-normal text-muted-foreground">
            <p>
              Department of Skills, Employment, Entrepreneurship & Innovation • Government of Maharashtra
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}