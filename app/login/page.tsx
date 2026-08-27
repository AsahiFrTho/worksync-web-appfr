'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  Activity,
  Users,
  Sparkles,
  Info,
  Check,
  TrendingUp,
  Award,
  Layers,
  Lock,
  FileCheck,
  MapPin,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { summary, inr, compact } from '@/lib/mock-data'
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
  accentColor: {
    bg: string
    border: string
    text: string
    badgeBg: string
    badgeText: string
    activeBorder: string
    activeRing: string
  }
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
    accentColor: {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      badgeBg: 'bg-blue-100 border-blue-200',
      badgeText: 'text-blue-900',
      activeBorder: 'border-blue-600',
      activeRing: 'ring-2 ring-blue-500/30',
    },
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
    accentColor: {
      bg: 'bg-indigo-100',
      border: 'border-indigo-300',
      text: 'text-indigo-800',
      badgeBg: 'bg-indigo-100 border-indigo-200',
      badgeText: 'text-indigo-900',
      activeBorder: 'border-indigo-600',
      activeRing: 'ring-2 ring-indigo-500/30',
    },
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
    accentColor: {
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      text: 'text-emerald-800',
      badgeBg: 'bg-emerald-100 border-emerald-200',
      badgeText: 'text-emerald-900',
      activeBorder: 'border-emerald-600',
      activeRing: 'ring-2 ring-emerald-500/30',
    },
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
    accentColor: {
      bg: 'bg-amber-100',
      border: 'border-amber-300',
      text: 'text-amber-800',
      badgeBg: 'bg-amber-100 border-amber-200',
      badgeText: 'text-amber-900',
      activeBorder: 'border-amber-600',
      activeRing: 'ring-2 ring-amber-500/30',
    },
  },
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
      {/* 2-PANEL INSTITUTIONAL COMPOSITION */}
      <div className="grid min-h-screen lg:grid-cols-12">
        {/* ========================================================================= */}
        {/* LEFT / BRAND & INSTITUTIONAL PANEL (5 of 12 Columns on Large Screens)     */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-background p-6 text-foreground sm:p-8 lg:col-span-5 lg:p-12 border-r border-border">
          {/* Decorative Institutional Background Asset */}
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-no-repeat opacity-55 select-none"
            style={{
              backgroundImage: "url('/login-bg.png')",
              backgroundPosition: 'center bottom',
              backgroundSize: 'cover',
            }}
            aria-hidden="true"
          />

          {/* Subtle Central Atmospheric Glow for Depth & Visual Integration */}
          <div
            className="pointer-events-none absolute inset-0 z-0 select-none opacity-35"
            style={{
              background:
                'radial-gradient(circle at 60% 42%, rgba(197, 160, 89, 0.12) 0%, rgba(10, 10, 10, 0.08) 45%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-2 ring-white/20">
                <Image
                  src="/favicon1.png"
                  alt="Kaushal Emblem"
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">
                    KAUSHAL
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs font-bold text-slate-300">
                    महाराष्ट्र शासन
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Department of Skills, Employment & Innovation
                </p>
              </div>
            </div>

            {/* Platform Identity & Value Proposition */}
            <div className="mt-7 lg:mt-9">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/35 bg-blue-950/70 px-3.5 py-1 text-xs font-bold text-blue-300 backdrop-blur-xs">
                <Sparkles className="size-3.5 text-blue-400" />
                <span>Skilling Outcome Intelligence Platform</span>
              </div>

              <h1 className="mt-3.5 text-2xl sm:text-3xl lg:text-[31px] font-extrabold tracking-tight text-white leading-[1.22] text-balance">
                From training and certification to verified employment, retention and wage progression.
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm font-normal leading-relaxed text-slate-300">
                A unified, verifiable outcome monitoring platform tracking every candidate across the longitudinal skill-to-employment trajectory in Maharashtra.
              </p>
            </div>

            {/* Compact Longitudinal Outcome Journey */}
            <div className="mt-5 rounded-xl border border-slate-800/90 bg-slate-900/85 p-3.5 backdrop-blur-sm shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                Longitudinal Skilling Journey
              </span>
              <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold">
                <div className="rounded-lg bg-slate-800/85 p-2 text-slate-300 border border-slate-700/60">
                  <span className="block text-slate-400 text-[8px]">01</span>
                  <span>Train</span>
                </div>
                <div className="rounded-lg bg-slate-800/85 p-2 text-slate-300 border border-slate-700/60">
                  <span className="block text-slate-400 text-[8px]">02</span>
                  <span>Certify</span>
                </div>
                <div className="rounded-lg bg-slate-800/85 p-2 text-slate-300 border border-slate-700/60">
                  <span className="block text-slate-400 text-[8px]">03</span>
                  <span>Place</span>
                </div>
                <div className="rounded-lg bg-emerald-950/90 p-2 text-emerald-300 border border-emerald-700/70">
                  <span className="block text-emerald-400 text-[8px]">04</span>
                  <span>Verify</span>
                </div>
                <div className="rounded-lg bg-amber-950/90 p-2 text-amber-300 border border-amber-700/70">
                  <span className="block text-amber-400 text-[8px]">05</span>
                  <span>Retain</span>
                </div>
                <div className="rounded-lg bg-purple-950/90 p-2 text-purple-300 border border-purple-700/70">
                  <span className="block text-purple-400 text-[8px]">06</span>
                  <span>Progress</span>
                </div>
              </div>
            </div>

            {/* Trust & Evidence Pillars */}
            <div className="mt-3.5 space-y-2 rounded-xl border border-slate-800/90 bg-slate-900/85 p-3.5 text-xs backdrop-blur-sm shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Evidence-Led Outcome Monitoring
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-400 stroke-[3]" />
                  <span>Verified Employment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-400 stroke-[3]" />
                  <span>Longitudinal Retention</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-400 stroke-[3]" />
                  <span>Wage Progression</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-emerald-400 stroke-[3]" />
                  <span>Programme Intelligence</span>
                </div>
              </div>
            </div>

            {/* Statewide Aggregates Metric Highlights */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800/90 bg-slate-900/85 p-3 backdrop-blur-sm shadow-xs">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <span>Tracked Candidates</span>
                  <Users className="size-3 text-blue-400" />
                </div>
                <p className="mt-0.5 text-xl font-black text-white tabular-nums">
                  {summary.totalTrainees.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-slate-400 font-medium">{summary.activeDistricts} Active Districts</span>
              </div>

              <div className="rounded-xl border border-emerald-900/70 bg-slate-900/90 p-3 backdrop-blur-sm shadow-xs ring-1 ring-emerald-500/25">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                  <span>Verified Retention</span>
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                </div>
                <p className="mt-0.5 text-xl font-black text-emerald-400 tabular-nums">
                  {summary.retentionRate}%
                </p>
                <span className="text-[10px] text-slate-400 font-medium">6-Month Stability</span>
              </div>
            </div>
          </div>

          {/* Left Panel Footer */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Maharashtra State Skill Development Society (MSSDS)</span>
            <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              MSSDS • EVALUATION
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT / LOGIN & STAKEHOLDER PORTAL GATEWAY PANEL (7 of 12 Columns)         */}
        {/* ========================================================================= */}
        <div className="flex flex-col justify-between bg-card p-6 sm:p-8 lg:col-span-7 lg:p-12">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            {/* Header & Security Badge Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-black tracking-tight text-slate-950">
                  Sign in to Kaushal
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">
                  Access your skilling outcome intelligence workspace.
                </p>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-900 shadow-2xs">
                <ShieldCheck className="size-3.5 text-blue-600" />
                <span>Authorized Gateway</span>
              </div>
            </div>

            {/* Persona Switcher / Role Selector Grid */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Select Stakeholder Persona:
              </span>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles.map((role) => {
                  const Icon = role.icon
                  const isSelected = selectedRoleId === role.id

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:border-white/15 hover:bg-muted/40'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                          isSelected
                            ? 'border-primary/30 bg-primary text-primary-foreground'
                            : 'border-border bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>

                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-slate-950 truncate">
                            {role.title.split('/')[0].trim()}
                          </span>
                          {isSelected && (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 truncate mt-0.5">
                          {role.marathiTitle}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Stakeholder Detail Dossier Card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                    {selectedRole.icon && <selectedRole.icon className="size-5" />}
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-950 leading-tight">
                      {selectedRole.persona.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {selectedRole.persona.designation}
                    </p>
                  </div>
                </div>

                <Badge variant="default" className="text-xs font-bold self-start sm:self-auto py-0.5 px-2.5 bg-blue-50 text-blue-900 border-blue-200/80">
                  {selectedRole.badgeText}
                </Badge>
              </div>

              {/* Organization & Location Strip */}
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Building2 className="size-3.5 text-blue-600 shrink-0" />
                  <span>{selectedRole.persona.organization}</span>
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" />
                  <span>{selectedRole.persona.location}</span>
                </span>
              </div>

              {/* Persona Description */}
              <p className="mt-2.5 text-xs leading-relaxed font-normal text-slate-600">
                {selectedRole.description}
              </p>

              {/* Key Capabilities */}
              <div className="mt-3.5 space-y-1.5 border-t border-slate-100 pt-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                  Operational Capabilities:
                </span>
                {selectedRole.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-800">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Primary Action Button */}
              <div className="mt-5 pt-3.5 border-t border-slate-100">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => handleQuickLaunch(selectedRole.targetHref)}
                  disabled={isLoading}
                  className="w-full justify-between font-medium text-sm h-12 rounded-xl transition-all duration-200 ease-in-out cursor-pointer"
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
            </div>

            {/* Prototype & Governance Notice */}
            <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Info className="size-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-slate-500 font-normal leading-relaxed text-[11px] sm:text-xs">
                  <strong className="font-semibold text-slate-800">Prototype Access Architecture: </strong>
                  This evaluation portal provides immediate role-based inspection of Maharashtra skilling outcome data.
                  In production, authentication connects to State Single Sign-On (SSO) and Aadhaar e-KYC verified candidate registries.
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel Footer */}
          <footer className="mx-auto mt-6 w-full max-w-2xl border-t border-slate-200/80 pt-4 text-center text-xs text-slate-400 font-medium">
            <p>
              Department of Skills, Employment, Entrepreneurship & Innovation • Government of Maharashtra
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
