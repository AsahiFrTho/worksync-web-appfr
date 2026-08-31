'use client'

import { useEffect, useState, type FormEvent } from 'react'
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
  Info,
  Check,
  Lock,
  MapPin,
  Loader2,
  AlertTriangle,
  Clock,
  KeyRound,
  Mail,
} from 'lucide-react'
import { summary } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { ROLES, type Role } from '@/lib/auth/roles'

interface RoleOption {
  id: Role
  title: string
  marathiTitle: string
  category: string
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
  demoEmail: string
}

const roles: RoleOption[] = [
  {
    id: 'admin',
    title: 'Government / Administrator',
    marathiTitle: 'शासकीय / प्रशासक',
    category: 'State & District Directorate',
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
    demoEmail: 'admin@worksync.gov',
  },
  {
    id: 'provider',
    title: 'Training Provider',
    marathiTitle: 'प्रशिक्षण संस्था',
    category: 'VTPs, ITIs & Implementing Agencies',
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
    demoEmail: 'provider@worksync.gov',
  },
  {
    id: 'employer',
    title: 'Employer',
    marathiTitle: 'नियोक्ता / उद्योग भागीदार',
    category: 'Industry & Hiring Partners',
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
    demoEmail: 'employer@worksync.gov',
  },
  {
    id: 'trainee',
    title: 'Trainee',
    marathiTitle: 'प्रशिक्षणार्थी उमेदवार',
    category: 'Certified Candidate & Alumni',
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
    demoEmail: 'trainee@worksync.gov',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [selectedRoleId, setSelectedRoleId] = useState<Role>('admin')
  const [email, setEmail] = useState(roles[0].demoEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0]

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return
        if (json.session) {
          const from = new URLSearchParams(window.location.search).get('from')
          router.replace(from || ROLES[json.session.role as Role].homeHref)
        } else {
          setCheckingSession(false)
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingSession(false)
      })
    return () => {
      cancelled = true
    }
  }, [router])

  const selectRole = (roleId: Role) => {
    setSelectedRoleId(roleId)
    setError(null)
    const role = roles.find((r) => r.id === roleId)
    if (role) setEmail(role.demoEmail)
  }

  const fillDemoPassword = () => setPassword('sih2024')

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Invalid email or password.')
        setIsLoading(false)
        return
      }
      const from = new URLSearchParams(window.location.search).get('from')
      router.push(from || json.redirectTo)
    } catch {
      setError('Could not reach the server. Please try again.')
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070605]">
        <Loader2 className="size-6 animate-spin text-[#c9a24a]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#070605] text-foreground font-sans antialiased selection:bg-[#c9a24a]/30 selection:text-white">
      {/* ========================================================================= */}
      {/* BACKGROUND ARTWORK & ATMOSPHERIC COMPOSITION (Pure Black & Gold Theme)   */}
      {/* ========================================================================= */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
        {/* Render the artwork: 25% larger scale, shifted left & slightly lifted, warm gold filter */}
        <div className="relative h-full w-full">
          <img
            src="/rwex.png"
            alt=""
            className="absolute left-[-4%] sm:left-[-3%] md:left-[-4%] lg:left-[-5%] xl:left-[-3%] bottom-[-2%] md:bottom-[-1%] h-[112vh] sm:h-[118vh] md:h-[122vh] w-auto max-w-none object-contain object-left-bottom opacity-75 sm:opacity-88 md:opacity-95"
            style={{
              filter: 'grayscale(100%) sepia(90%) hue-rotate(5deg) saturate(210%) brightness(0.84) contrast(1.22)',
            }}
          />
        </div>

        {/* Bottom-Up Gradient: softens lower edge while keeping bridge & architecture clearly visible */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(0deg, rgba(7, 6, 5, 0.72) 0%, rgba(7, 6, 5, 0.35) 16%, transparent 36%)',
          }}
        />

        {/* Horizontal Gradient Overlay: crystal clear across left India map, smoothly darkens right side behind login card */}
        <div
          className="absolute inset-0 z-15"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, transparent 35%, rgba(7, 6, 5, 0.35) 55%, rgba(7, 6, 5, 0.82) 80%, rgba(7, 6, 5, 0.96) 94%, #070605 100%)',
          }}
        />

        {/* Atmospheric Grounding Vignette & Ambient Warm Gold Radial Glow over India Map */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background:
              'radial-gradient(circle at 24% 28%, rgba(201, 162, 74, 0.18) 0%, transparent 52%), radial-gradient(circle at 85% 65%, rgba(201, 162, 74, 0.04) 0%, transparent 45%), linear-gradient(180deg, rgba(7, 6, 5, 0.30) 0%, transparent 12%, transparent 88%, rgba(7, 6, 5, 0.75) 100%)',
          }}
        />
      </div>

      {/* Main Unified 2-Column Responsive Workspace strictly constrained within 1440px viewport */}
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10 grid min-h-screen grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
        
        {/* ========================================================================= */}
        {/* LEFT / BRAND & INSTITUTIONAL OVERVIEW (6 of 12 Columns, ~48-50%)          */}
        {/* ========================================================================= */}
        <div className="w-full min-w-0 flex flex-col justify-between space-y-5 lg:col-span-6 lg:py-2">
          <div className="space-y-6">
            {/* WorkSync Logo & Department Header */}
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-black border border-[#c9a24a]/30 shadow-md ring-1 ring-[#c9a24a]/20">
                <Image
                  src="/favicon.png"
                  alt="WorkSync Logo"
                  width={48}
                  height={48}
                  className="size-full object-cover"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white">WORKSYNC</span>
                  <span className="text-[#c9a24a]/50 font-light">|</span>
                  <span className="text-xs font-bold text-zinc-300">महाराष्ट्र शासन</span>
                </div>
                <p className="text-[11px] font-semibold text-[#a7a29a]">
                  Department of Skills, Employment & Innovation
                </p>
              </div>
            </div>

            {/* Platform Badge & Main Headline */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a24a]/30 bg-[#1a150c]/80 px-3.5 py-1 text-xs font-bold text-[#d4af5a] backdrop-blur-md shadow-2xs">
                <Sparkles className="size-3.5 text-[#c9a24a]" />
                <span>Skilling Outcome Intelligence Platform</span>
              </div>

              <h1 className="mt-3.5 text-2xl sm:text-3xl lg:text-[31px] font-extrabold tracking-tight text-white leading-[1.22] text-balance">
                From training and certification to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-[#d4af5a]">
                  verified employment, retention and wage progression.
                </span>
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm font-normal leading-relaxed text-[#a7a29a]">
                A unified, verifiable outcome monitoring platform tracking every candidate across the longitudinal skill-to-employment trajectory in Maharashtra.
              </p>
            </div>

            {/* Longitudinal Skilling Journey */}
            <div className="rounded-2xl border border-[#c9a24a]/20 bg-[#0c0a07]/75 p-4 backdrop-blur-md shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a24a] block mb-2.5">
                Longitudinal Skilling Journey
              </span>
              <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold">
                <div className="rounded-lg bg-[#14120e]/80 p-2 text-zinc-300 border border-white/5">
                  <span className="block text-[#c9a24a]/70 text-[8px] font-mono">01</span>
                  <span>Train</span>
                </div>
                <div className="rounded-lg bg-[#14120e]/80 p-2 text-zinc-300 border border-white/5">
                  <span className="block text-[#c9a24a]/70 text-[8px] font-mono">02</span>
                  <span>Certify</span>
                </div>
                <div className="rounded-lg bg-[#14120e]/80 p-2 text-zinc-300 border border-white/5">
                  <span className="block text-[#c9a24a]/70 text-[8px] font-mono">03</span>
                  <span>Place</span>
                </div>
                <div className="rounded-lg bg-[#241a0b]/90 p-2 text-white border border-[#c9a24a]/50 shadow-[0_0_10px_rgba(201,162,74,0.15)]">
                  <span className="block text-[#c9a24a] text-[8px] font-mono">04</span>
                  <span>Verify</span>
                </div>
                <div className="rounded-lg bg-[#241a0b]/90 p-2 text-white border border-[#c9a24a]/50 shadow-[0_0_10px_rgba(201,162,74,0.15)]">
                  <span className="block text-[#c9a24a] text-[8px] font-mono">05</span>
                  <span>Retain</span>
                </div>
                <div className="rounded-lg bg-[#241a0b]/90 p-2 text-white border border-[#c9a24a]/50 shadow-[0_0_10px_rgba(201,162,74,0.15)]">
                  <span className="block text-[#c9a24a] text-[8px] font-mono">06</span>
                  <span>Progress</span>
                </div>
              </div>
            </div>

            {/* Evidence-Led Outcome Monitoring */}
            <div className="space-y-2 rounded-2xl border border-[#c9a24a]/20 bg-[#0c0a07]/75 p-4 text-xs backdrop-blur-md shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a24a] block mb-1">
                Evidence-Led Outcome Monitoring
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-zinc-200 font-medium">
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded-full bg-[#c9a24a]/15 text-[#c9a24a]">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Verified Employment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded-full bg-[#c9a24a]/15 text-[#c9a24a]">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Longitudinal Retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded-full bg-[#c9a24a]/15 text-[#c9a24a]">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Wage Progression</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex size-4 items-center justify-center rounded-full bg-[#c9a24a]/15 text-[#c9a24a]">
                    <Check className="size-2.5 stroke-[3]" />
                  </div>
                  <span>Programme Intelligence</span>
                </div>
              </div>
            </div>

            {/* Statewide Aggregates Metric Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#c9a24a]/20 bg-[#0c0a07]/75 p-3.5 backdrop-blur-md shadow-xl">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#c9a24a]">
                  <span>Tracked Candidates</span>
                  <Users className="size-3.5 text-[#c9a24a]" />
                </div>
                <p className="mt-1 text-2xl font-black text-white tabular-nums">
                  {summary.totalTrainees.toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-[#a7a29a] font-medium block mt-0.5">{summary.activeDistricts} Active Districts</span>
              </div>

              <div className="rounded-2xl border border-[#c9a24a]/30 bg-[#120e09]/80 p-3.5 backdrop-blur-md shadow-xl ring-1 ring-[#c9a24a]/20">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#c9a24a]">
                  <span>Verified Retention</span>
                  <ShieldCheck className="size-3.5 text-[#c9a24a]" />
                </div>
                <p className="mt-1 text-2xl font-black text-white tabular-nums">
                  {summary.retentionRate}%
                </p>
                <span className="text-[10px] text-[#a7a29a] font-medium block mt-0.5">6-Month Stability</span>
              </div>
            </div>

            <p className="text-[10px] font-medium text-zinc-500 italic">
              Illustrative statewide figures for demonstration — see the live prototype cohort count after signing in.
            </p>
          </div>

          {/* Left Footer Info */}
          <div className="pt-4 border-t border-white/8 text-[11px] text-[#a7a29a] flex items-center justify-between">
            <span>Maharashtra State Skill Development Society (MSSDS)</span>
            <span className="font-mono text-[10px] bg-[#14100a] px-2.5 py-0.5 rounded-full border border-[#c9a24a]/30 text-[#d4af5a]">
              MSSDS • EVALUATION
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT / MAIN LOGIN & STAKEHOLDER PORTAL FORM (6 of 12 Columns, ~42-45%)   */}
        {/* ========================================================================= */}
        <div className="w-full min-w-0 lg:col-span-6 lg:max-w-[580px] lg:ml-auto lg:py-2">
          <div className="w-full rounded-2xl border border-[#c9a24a]/28 bg-[#0c0a07]/90 p-5 sm:p-6 md:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_35px_rgba(201,162,74,0.06)] backdrop-blur-xl space-y-4 sm:space-y-5">

            {/* Header & Status Badges */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
              <div>
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white">
                  Sign in to WorkSync
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-[#a7a29a]">
                  Access your skilling outcome intelligence workspace.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1.5 rounded-full border border-[#c9a24a]/30 bg-[#1a150c]/80 px-3 py-1 text-xs font-bold text-[#d4af5a] shadow-2xs">
                  <ShieldCheck className="size-3.5 text-[#c9a24a]" />
                  <span>Authorized Gateway</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-[#c9a24a]/20 bg-[#1a150c]/80 px-3 py-1 text-xs font-bold text-[#a7a29a] shadow-2xs">
                  <Clock className="size-3.5 text-[#c9a24a]" />
                  <span>Coming Soon: State SSO / Aadhaar e-KYC</span>
                </div>
              </div>
            </div>

            {/* Stakeholder Persona Selection */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#c9a24a] block mb-2">
                Select Stakeholder Persona:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles.map((role) => {
                  const Icon = role.icon
                  const isSelected = selectedRoleId === role.id

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => selectRole(role.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer',
                        isSelected
                          ? 'border-[#cda041]/75 bg-[#281f10]/85 ring-1 ring-[#cda041]/40 shadow-[0_0_20px_rgba(205,160,65,0.18)]'
                          : 'border-white/7 bg-[#12100c]/75 hover:border-[#c9a24a]/30 hover:bg-[#18140e]/90 text-zinc-300'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                          isSelected
                            ? 'border-[#c9a24a]/40 bg-[#c9a24a] text-black'
                            : 'border-white/10 bg-[#1a1610] text-[#c9a24a]'
                        )}
                      >
                        <Icon className="size-4.5" />
                      </span>

                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-white truncate">
                            {role.title.split('/')[0].trim()}
                          </span>
                          {isSelected && (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#c9a24a] text-black">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span className={cn('text-[11px] font-medium truncate mt-0.5', isSelected ? 'text-[#d4af5a]' : 'text-[#a7a29a]')}>
                          {role.marathiTitle}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Persona Dossier & Credentials Card */}
            <div className="rounded-2xl border border-[#c9a24a]/25 bg-[#0e0c08]/90 p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/8 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#c9a24a] to-[#a88233] text-black font-bold shrink-0 shadow-sm">
                    {selectedRole.icon && <selectedRole.icon className="size-5" />}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {selectedRole.persona.name}
                    </h3>
                    <p className="text-xs font-semibold text-[#d4af5a] mt-0.5">
                      {selectedRole.persona.designation}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full border border-[#c9a24a]/40 bg-[#241a0b] px-2.5 py-0.5 text-xs font-bold text-[#d4af5a] self-start sm:self-auto shadow-2xs">
                  {selectedRole.badgeText}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Building2 className="size-3.5 text-[#c9a24a] shrink-0" />
                  <span>{selectedRole.persona.organization}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#a7a29a]">
                  <MapPin className="size-3.5 text-[#c9a24a]/70 shrink-0" />
                  <span>{selectedRole.persona.location}</span>
                </span>
              </div>

              <p className="text-xs leading-relaxed font-normal text-[#a7a29a]">
                {selectedRole.description}
              </p>

              <div className="space-y-1.5 border-t border-white/8 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a24a] block mb-1">
                  Operational Capabilities:
                </span>
                {selectedRole.highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs font-medium text-zinc-200">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#c9a24a]" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              {/* Real Credential Form */}
              <form onSubmit={handleLogin} className="mt-4 pt-3.5 border-t border-white/8 space-y-3.5">
                <div>
                  <label htmlFor="login-email" className="text-[10px] font-bold uppercase tracking-wider text-[#c9a24a] block mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#c9a24a]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080807]/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a]/50 transition-all"
                      placeholder="you@worksync.gov"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="login-password" className="text-[10px] font-bold uppercase tracking-wider text-[#c9a24a] block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={fillDemoPassword}
                      className="text-[10px] font-bold text-[#c9a24a] hover:text-[#d4af5a] transition-colors cursor-pointer"
                    >
                      Use demo password
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#c9a24a]" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#080807]/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c9a24a] focus:ring-1 focus:ring-[#c9a24a]/50 transition-all"
                      placeholder="Demo password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-2.5 text-xs font-medium text-red-300">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#c9a24a] via-[#d4af5a] to-[#c9a24a] hover:from-[#d4af5a] hover:to-[#dfbb68] text-black font-bold text-sm flex items-center justify-between px-5 shadow-[0_4px_20px_rgba(201,162,74,0.22)] transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? <Loader2 className="size-4 animate-spin text-black" /> : <Lock className="size-4 text-black" />}
                    <span>{isLoading ? 'Authenticating…' : `Sign in as ${selectedRole.title.split('/')[0].trim()}`}</span>
                  </span>
                  <ArrowRight className="size-4 text-black" />
                </button>

                <p className="text-center text-[10px] font-medium text-[#a7a29a]">
                  Demo credentials for evaluators: <code className="rounded bg-[#16130e] border border-[#c9a24a]/20 px-1.5 py-0.5 font-mono text-[#d4af5a]">{selectedRole.demoEmail}</code> ·{' '}
                  password <code className="rounded bg-[#16130e] border border-[#c9a24a]/20 px-1.5 py-0.5 font-mono text-[#d4af5a]">sih2024</code>
                </p>
              </form>
            </div>

            {/* Prototype & Governance Notice */}
            <div className="rounded-xl border border-[#c9a24a]/20 bg-[#100d08]/80 p-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <Info className="size-4 text-[#c9a24a] shrink-0 mt-0.5" />
                <div className="text-[#a7a29a] font-normal leading-relaxed text-[11px] sm:text-xs">
                  <strong className="font-semibold text-white">Prototype Access Architecture: </strong>
                  This evaluation portal uses a real password-checked, signed-cookie session (see the Sign In form above) —
                  it is not a one-click role switcher. In production, this same login step would be replaced by
                  State Single Sign-On (SSO) and Aadhaar e-KYC verified candidate registries, which are not yet integrated.
                </div>
              </div>
            </div>

            <footer className="pt-2 text-center text-xs text-[#a7a29a] font-medium">
              <p>
                Department of Skills, Employment, Entrepreneurship & Innovation • Government of Maharashtra
              </p>
            </footer>
          </div>
        </div>

      </div>
    </div>
  )
}
