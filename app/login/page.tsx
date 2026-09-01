'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Landmark,
  GraduationCap,
  Briefcase,
  IdCard,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  BarChart3,
  Loader2,
  Lock,
  Mail,
  KeyRound,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { ROLES, type Role } from '@/lib/auth/roles'
import { cn } from '@/lib/utils'

interface RoleDossier {
  id: Role
  name: string
  title: string
  badgeText: string
  organization: string
  location: string
  secondaryOrgLine?: string
  description: string
  capabilities: string[]
  demoEmail: string
  buttonLabel: string
  icon: typeof Landmark
}

const ROLE_DOSSIERS: RoleDossier[] = [
  {
    id: 'admin',
    name: 'Dr. Sanjay Patil',
    title: 'Director of Policy & Analytics',
    badgeText: 'Executive Oversight',
    organization: 'Maharashtra State Skill Development Society (MSSDS)',
    location: 'Mantralaya, Mumbai',
    description:
      'Statewide longitudinal outcomes, 12-district comparative analytics, certification-to-placement funnels, wage growth indices, and 6-month retention monitoring.',
    capabilities: [
      'Executive KPI Funnel (Enrolled → Certified → Retained)',
      '12-District & Course-Wise Performance Benchmarks',
      'Longitudinal Wage Growth & 6-Month Retention Audits',
    ],
    demoEmail: 'admin@worksync.gov',
    buttonLabel: 'Sign in as Government',
    icon: Landmark,
  },
  {
    id: 'provider',
    name: 'Sahyadri Vocational Institute',
    title: 'Centre Head / Training Officer',
    badgeText: 'Curriculum & Gaps',
    organization: 'Affiliated to MSSDS (Pune & Nashik Centres)',
    location: 'Pune Center (96 Active VTPs)',
    description:
      'Batch certification outcomes, skill gap diagnostics mapped against live employer demand, trade-wise placement rates, and candidate non-placement root causes.',
    capabilities: [
      'Trade Skill-Gap Matrix vs. Industry Demand',
      'Course Placement Rates & Median Wage Metrics',
      'Dropout & Unplaced Trainee Diagnostic Signals',
    ],
    demoEmail: 'provider@worksync.gov',
    buttonLabel: 'Sign in as Training Provider',
    icon: GraduationCap,
  },
  {
    id: 'employer',
    name: 'Deccan Electricals Pvt. Ltd.',
    title: 'HR Operations & Talent Verification Cell',
    badgeText: 'Verification & Retention',
    organization: 'Chakan Industrial Area, Pune',
    location: 'Manufacturing & Power Sector',
    description:
      'Direct candidate employment confirmation, wage verification, 30/90/180-day retention milestone audits, and trade relevance validation.',
    capabilities: [
      '1-Click Employment & Wage Record Confirmation',
      '30-Day, 90-Day & 180-Day Retention Milestones',
      'Direct Trade Alignment & Dispute Flagging',
    ],
    demoEmail: 'employer@worksync.gov',
    buttonLabel: 'Sign in as Employer',
    icon: Briefcase,
  },
  {
    id: 'trainee',
    name: 'Rahul Pawar',
    title: 'Trainee ID: KP-0001 (Electrician)',
    badgeText: 'Outcome Passport',
    organization: 'Yashaswi Skill Academy, Pune',
    location: 'Employed at Deccan Electricals (₹16,800/mo)',
    description:
      'Verifiable Trainee Outcome Passport, NSQF Level 4 certification records, verified multi-stage employment timeline, and AI Career Intelligence recommendations.',
    capabilities: [
      'Verifiable Digital Outcome Passport (NSQF Level 4)',
      'Multi-Stage Retention & Monthly Wage Timeline',
      'AI Career Intelligence & Upskilling Pathways',
    ],
    demoEmail: 'trainee@worksync.gov',
    buttonLabel: 'Sign in as Trainee',
    icon: IdCard,
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [loadingRole, setLoadingRole] = useState<Role | null>(null)
  const [isCustomAuthLoading, setIsCustomAuthLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCustomLogin, setShowCustomLogin] = useState(false)

  // Per-card form states prefilled with demo credentials
  const [credentials, setCredentials] = useState<Record<Role, { email: string; password: string }>>({
    admin: { email: 'admin@worksync.gov', password: 'sih2024' },
    provider: { email: 'provider@worksync.gov', password: 'sih2024' },
    employer: { email: 'employer@worksync.gov', password: 'sih2024' },
    trainee: { email: 'trainee@worksync.gov', password: 'sih2024' },
  })

  // Custom login state
  const [customEmail, setCustomEmail] = useState('')
  const [customPassword, setCustomPassword] = useState('')

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

  const executeLogin = async (email: string, password: string, roleForLoader?: Role) => {
    setError(null)
    if (roleForLoader) {
      setLoadingRole(roleForLoader)
    } else {
      setIsCustomAuthLoading(true)
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Invalid credentials. Please try again.')
        setLoadingRole(null)
        setIsCustomAuthLoading(false)
        return
      }
      const from = new URLSearchParams(window.location.search).get('from')
      router.push(from || json.redirectTo)
    } catch {
      setError('Could not connect to the authentication server. Please try again.')
      setLoadingRole(null)
      setIsCustomAuthLoading(false)
    }
  }

  const handleCardSubmit = (e: FormEvent, roleId: Role) => {
    e.preventDefault()
    const { email, password } = credentials[roleId]
    executeLogin(email, password, roleId)
  }

  const handleFillDemoPassword = (roleId: Role) => {
    setCredentials((prev) => ({
      ...prev,
      [roleId]: { ...prev[roleId], password: 'sih2024' },
    }))
  }

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!customEmail.trim() || !customPassword) {
      setError('Please provide both email and password.')
      return
    }
    executeLogin(customEmail, customPassword)
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07090e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-7 animate-spin text-[#c5a059]" />
          <span className="text-xs font-semibold text-zinc-300">Verifying session…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden text-foreground font-sans antialiased selection:bg-[#c5a059]/30 selection:text-white bg-[#06090e]">
      
      {/* ========================================================================= */}
      {/* BACKGROUND IMAGE: public/UIUX.png (Brighter & Positioned Slightly Upward)  */}
      {/* ========================================================================= */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-no-repeat pointer-events-none select-none"
        style={{
          backgroundImage: "url('/UIUX.png')",
          backgroundPosition: 'center 58%',
        }}
        aria-hidden="true"
      />

      {/* Subtle, restrained institutional dark gradient to keep artwork crisp and text 100% readable */}
      <div
        className="fixed inset-0 z-1 pointer-events-none select-none bg-gradient-to-b from-black/35 via-black/15 to-black/50"
        aria-hidden="true"
      />

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTAINER                                                   */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 max-w-[1520px] mx-auto">
        
        {/* ========================================================================= */}
        {/* TOP: WORKSYNC INSTITUTIONAL HEADER & BRANDING                             */}
        {/* ========================================================================= */}
        <header className="flex flex-col items-center text-center space-y-2 pt-2 sm:pt-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/90 border border-[#c5a059]/50 shadow-md ring-1 ring-[#c5a059]/30">
              <Image
                src="/favicon.png"
                alt="WorkSync Institutional Crest"
                width={48}
                height={48}
                className="size-full object-cover"
                priority
              />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                  WorkSync
                </span>
                <span className="text-[#c5a059] font-light text-sm">|</span>
                <span className="text-xs sm:text-sm font-bold text-[#c5a059] tracking-wide">
                  महाराष्ट्र शासन
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-zinc-200 drop-shadow-sm">
                Department of Skills, Employment, Entrepreneurship &amp; Innovation
              </p>
            </div>
          </div>

          <div className="space-y-0.5 max-w-xl">
            <p className="text-xs sm:text-sm font-bold text-[#d4af5a] tracking-wider uppercase drop-shadow-sm">
              One Platform. Many Opportunities.
            </p>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* CENTER / MAIN: DETAILED ROLE LOGIN PANELS (SOURCE OF TRUTH)               */}
        {/* ========================================================================= */}
        <main className="my-auto py-6 sm:py-8 w-full mx-auto flex flex-col items-center">
          
          {/* Section Titles */}
          <div className="text-center mb-6 sm:mb-8 space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white uppercase drop-shadow-md">
              Login to Your Account
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200 drop-shadow-sm">
              Choose your role to continue
            </p>
          </div>

          {/* Global Error Notification */}
          {error && (
            <div className="mb-6 w-full max-w-lg flex items-start gap-2.5 rounded-xl border border-red-500/50 bg-red-950/90 p-3 text-xs font-medium text-red-100 shadow-xl backdrop-blur-md">
              <AlertTriangle className="size-4 shrink-0 text-red-400 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* 4 Rich Role Panels (Horizontal on Desktop, 2x2 Tablet, 1-col Mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {ROLE_DOSSIERS.map((role) => {
              const Icon = role.icon
              const isCurrentLoading = loadingRole === role.id
              const roleCreds = credentials[role.id]

              return (
                <div
                  key={role.id}
                  className="flex flex-col justify-between rounded-2xl border border-[#c5a059]/30 bg-[#0a1016]/90 backdrop-blur-md p-5 sm:p-6 transition-all duration-200 hover:border-[#c5a059]/75 hover:bg-[#0d141e]/94 shadow-[0_12px_36px_rgba(0,0,0,0.55)] hover:shadow-[0_16px_42px_rgba(0,0,0,0.7),0_0_24px_rgba(197,160,89,0.18)]"
                >
                  <div className="space-y-4">
                    {/* Header: Icon, Person/Org Name, Title & Outlined Gold Badge */}
                    <div className="flex items-start justify-between gap-3 border-b border-white/8 pb-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#c5a059]/40 bg-[#141b26] text-[#c5a059] shadow-inner">
                          <Icon className="size-5.5 text-[#c5a059]" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-white tracking-tight truncate leading-tight">
                            {role.name}
                          </h2>
                          <p className="text-xs font-semibold text-[#d4af5a] truncate mt-0.5">
                            {role.title}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 inline-flex items-center rounded-full border border-[#c5a059]/40 bg-[#1b170e]/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d4af5a] shadow-2xs">
                        {role.badgeText}
                      </span>
                    </div>

                    {/* Organization & Location Meta */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-zinc-100 font-medium">
                        <Building2 className="size-3.5 text-[#c5a059] shrink-0" />
                        <span className="truncate">{role.organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin className="size-3.5 text-[#c5a059]/70 shrink-0" />
                        <span className="truncate">{role.location}</span>
                      </div>
                    </div>

                    {/* Role Description */}
                    <p className="text-xs text-zinc-300 leading-relaxed min-h-[56px]">
                      {role.description}
                    </p>

                    {/* Operational Capabilities Checklist */}
                    <div className="space-y-2 border-t border-white/8 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">
                        Operational Capabilities:
                      </span>
                      <div className="space-y-1.5">
                        {role.capabilities.map((cap, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-[#c5a059]" />
                            <span className="leading-snug">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Role Authentication Form */}
                  <form
                    onSubmit={(e) => handleCardSubmit(e, role.id)}
                    className="mt-5 pt-3.5 border-t border-white/8 space-y-3"
                  >
                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor={`email-${role.id}`}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block mb-1"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#c5a059]" />
                        <input
                          id={`email-${role.id}`}
                          type="email"
                          required
                          value={roleCreds.email}
                          onChange={(e) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [role.id]: { ...prev[role.id], email: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#080d14] py-2 pl-8.5 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor={`password-${role.id}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block"
                        >
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => handleFillDemoPassword(role.id)}
                          className="text-[10px] font-semibold text-[#c5a059] hover:text-[#d4af5a] transition-colors cursor-pointer"
                        >
                          Use demo password
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#c5a059]" />
                        <input
                          id={`password-${role.id}`}
                          type="password"
                          required
                          value={roleCreds.password}
                          onChange={(e) =>
                            setCredentials((prev) => ({
                              ...prev,
                              [role.id]: { ...prev[role.id], password: e.target.value },
                            }))
                          }
                          className="w-full rounded-xl border border-white/10 bg-[#080d14] py-2 pl-8.5 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/50 transition-all"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={loadingRole !== null || isCustomAuthLoading}
                      className={cn(
                        'w-full h-11 rounded-xl bg-[#c5a059] hover:bg-[#d8b568] active:bg-[#b89345] text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 px-4 shadow-[0_2px_12px_rgba(197,160,89,0.22)] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isCurrentLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin text-black" />
                          <span>Signing in…</span>
                        </>
                      ) : (
                        <>
                          <span>{role.buttonLabel}</span>
                          <ArrowRight className="size-3.5 text-black" />
                        </>
                      )}
                    </button>

                    {/* Evaluator Credentials Note */}
                    <p className="text-center text-[10px] text-zinc-400">
                      Demo: <code className="text-[#d4af5a] font-mono">{role.demoEmail}</code> · password <code className="text-[#d4af5a] font-mono">sih2024</code>
                    </p>
                  </form>
                </div>
              )
            })}
          </div>

          {/* Prototype Access Architecture Notice (Restrained & Institutional) */}
          <div className="mt-8 w-full max-w-4xl rounded-xl border border-[#c5a059]/25 bg-[#080d14]/85 p-3.5 backdrop-blur-sm text-xs">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div className="text-zinc-300 font-normal leading-relaxed text-[11px] sm:text-xs">
                <strong className="font-semibold text-white">Prototype Access Architecture: </strong>
                This evaluation portal uses a real password-checked, signed-cookie session (see the Sign In forms above) —
                it is not a one-click role switcher. In production, this same login step would be replaced by
                State Single Sign-On (SSO) and Aadhaar e-KYC verified candidate registries.
              </div>
            </div>
          </div>

          {/* Collapsible Custom Credentials Login Link */}
          <div className="mt-5 w-full max-w-md flex flex-col items-center">
            <button
              type="button"
              onClick={() => setShowCustomLogin(!showCustomLogin)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-[#d4af5a] transition-colors py-1.5 px-3 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-sm cursor-pointer shadow-sm"
            >
              <Lock className="size-3.5 text-[#c5a059]" />
              <span>{showCustomLogin ? 'Hide Custom Credentials Form' : 'Login with Custom Credentials'}</span>
              {showCustomLogin ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showCustomLogin && (
              <form
                onSubmit={handleCustomSubmit}
                className="mt-3 w-full rounded-2xl border border-[#c5a059]/40 bg-[#0a1016]/95 p-5 backdrop-blur-xl shadow-2xl space-y-3.5 transition-all"
              >
                <div className="text-left border-b border-white/10 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#c5a059]">
                    Official Gateway Sign-In
                  </h3>
                  <p className="text-[11px] text-zinc-300">
                    Enter your authorized official email and password.
                  </p>
                </div>

                <div className="text-left">
                  <label htmlFor="custom-email" className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#c5a059]" />
                    <input
                      id="custom-email"
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#121822] py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/50"
                      placeholder="e.g. admin@worksync.gov"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <label htmlFor="custom-password" className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#c5a059]" />
                    <input
                      id="custom-password"
                      type="password"
                      required
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#121822] py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]/50"
                      placeholder="Enter password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCustomAuthLoading || loadingRole !== null}
                  className="w-full h-10 rounded-xl bg-[#c5a059] hover:bg-[#d8b568] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isCustomAuthLoading ? (
                    <Loader2 className="size-4 animate-spin text-black" />
                  ) : (
                    <>
                      <span>Authorize &amp; Sign In</span>
                      <ArrowRight className="size-3.5 text-black" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </main>

        {/* ========================================================================= */}
        {/* BOTTOM: RESTRAINED INSTITUTIONAL TRUST STRIP & FOOTER                      */}
        {/* ========================================================================= */}
        <footer className="w-full pt-4 pb-2 space-y-3">
          
          {/* Institutional Trust Strip */}
          <div className="w-full max-w-4xl mx-auto rounded-xl border border-[#c5a059]/25 bg-[#080c12]/85 backdrop-blur-md px-4 py-2.5 shadow-md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100">
                <ShieldCheck className="size-4 text-[#c5a059] shrink-0" />
                <span>Secure &amp; Trusted</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100">
                <Fingerprint className="size-4 text-[#c5a059] shrink-0" />
                <span>Aadhaar e-KYC Ready</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100">
                <Landmark className="size-4 text-[#c5a059] shrink-0" />
                <span>State SSO Ready</span>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-100">
                <BarChart3 className="size-4 text-[#c5a059] shrink-0" />
                <span>Data-Driven Impact</span>
              </div>

            </div>
          </div>

          {/* Official Footer Text */}
          <div className="text-center text-[11px] text-zinc-300 space-y-0.5 drop-shadow-sm">
            <p>
              Department of Skills, Employment, Entrepreneurship &amp; Innovation • Government of Maharashtra
            </p>
          </div>
        </footer>

      </div>
    </div>
  )
}
