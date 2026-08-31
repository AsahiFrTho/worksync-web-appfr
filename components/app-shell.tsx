'use client'

import type * as React from 'react'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  Building2,
  UserCheck,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  PhoneCall,
  BadgeCheck,
  Puzzle,
  ClipboardCheck,
  Settings as SettingsIcon,
  RefreshCw,
  LogOut,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { GlobalSearch } from '@/components/global-search'
import { ROLES, sectionsForRole, type Role } from '@/lib/auth/roles'

const stakeholderPortals = [
  {
    label: 'Government / Admin',
    href: '/dashboard',
    icon: LayoutDashboard,
    hint: 'State-wide macro metrics',
    roleBadge: 'Admin',
  },
  {
    label: 'Training Provider',
    href: '/analytics',
    icon: LineChart,
    hint: 'Skill gaps & performance',
    roleBadge: 'Provider',
  },
  {
    label: 'Employer Portal',
    href: '/employer',
    icon: Building2,
    hint: 'Join & wage verification',
    roleBadge: 'Employer',
  },
  {
    label: 'Trainee Passport',
    href: '/trainee',
    icon: UserCheck,
    hint: 'Verifiable outcome record',
    roleBadge: 'Trainee',
  },
]

const intelligenceTools = [
  {
    label: 'AI Insights & Policy',
    href: '/insights',
    icon: Sparkles,
    hint: 'Automated policy signals',
    roleBadge: 'Policy AI',
  },
]

const operationsTools = [
  {
    label: 'Learners',
    href: '/learners',
    icon: Users,
    hint: 'Registry & consent records',
    roleBadge: 'Registry',
  },
  {
    label: 'Follow-ups',
    href: '/followups',
    icon: PhoneCall,
    hint: 'Contact queue & outcomes',
    roleBadge: 'Field',
  },
  {
    label: 'Employer Verification',
    href: '/verification',
    icon: BadgeCheck,
    hint: 'Approve / reject / evidence',
    roleBadge: 'Verifier',
  },
  {
    label: 'Skill Gaps',
    href: '/skillgaps',
    icon: Puzzle,
    hint: 'Gap analysis & recommendations',
    roleBadge: 'Curriculum',
  },
  {
    label: 'Provider Scorecard',
    href: '/scorecard',
    icon: Building2,
    hint: 'Provider accountability',
    roleBadge: 'Pulse',
  },
  {
    label: 'Data Quality',
    href: '/dataquality',
    icon: ClipboardCheck,
    hint: 'Audit & completeness',
    roleBadge: 'Audit',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    hint: 'Programme configuration',
    roleBadge: 'Admin',
  },
]

// Icons are a UI-only concern, so they're mapped here rather than inside
// lib/auth/roles.ts -- that file is imported by proxy.ts (server) too, and
// there's no reason for the server-side access-control logic to know or
// care what icon a role displays.
const ROLE_ICONS: Record<Role, typeof ShieldCheck> = {
  admin: ShieldCheck,
  provider: GraduationCap,
  employer: Briefcase,
  trainee: Users,
}

interface SessionInfo {
  email: string
  role: Role
  name: string
}

// Fetches the real, server-verified session once on mount. We intentionally
// do NOT try to read any cookie directly here -- the session cookie is
// httpOnly precisely so client-side code (including this component) cannot
// read or forge it. This hook is the one sanctioned way the UI finds out
// who's signed in.
function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setSession(json.session || null)
      })
      .catch(() => {
        if (!cancelled) setSession(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { session, loading }
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 text-foreground group min-w-0">
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card border border-border transition-opacity duration-200 ease-in-out group-hover:opacity-90">
        <Image
          src="/favicon.png"
          alt="WorkSync"
          width={38}
          height={38}
          className="size-full object-cover"
          priority
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-heading text-base font-semibold tracking-tight text-foreground">
            WORK<span className="text-primary">SYNC</span>
          </span>
        </div>
        <span className="text-[10px] font-normal text-muted-foreground truncate">
          Skilling Outcomes & Intelligence
        </span>
      </div>
    </Link>
  )
}

function ResetDataButton() {
  const [busy, setBusy] = useState(false)
  const reset = async () => {
    if (!window.confirm('Reset all demo data to the original sample dataset?')) return
    setBusy(true)
    try {
      const res = await fetch('/api/seed/operations', { method: 'POST' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Could not reset demo data')
      window.location.reload()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Could not reset demo data')
      setBusy(false)
    }
  }
  return (
    <button
      onClick={() => void reset()}
      disabled={busy}
      className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-[11px] font-medium text-muted-foreground transition-colors duration-200 ease-in-out hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <RefreshCw className={cn('size-3.5 text-primary', busy && 'animate-spin')} />
      Reset demo data
    </button>
  )
}

// Signs the user out by asking the server to delete the session cookie
// (see app/api/auth/logout/route.ts), then sends them to /login. We
// deliberately do NOT just navigate to /login without calling the API --
// that would leave the old session cookie valid, so typing the dashboard
// URL back into the address bar would let them straight back in.
function SignOutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const signOut = useCallback(async () => {
    setBusy(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      router.push('/login')
    }
  }, [router])

  return (
    <button type="button" onClick={() => void signOut()} disabled={busy} className={className}>
      {busy ? <Loader2 className="size-3.5 animate-spin text-primary" /> : <LogOut className="size-3.5 text-primary" />}
      {children}
    </button>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { session, loading } = useSession()

  // Fall back to the Admin identity while the session is still loading so
  // the layout doesn't flash empty/broken on first paint. proxy.ts has
  // already verified real access before this page was ever served, so by
  // the time this component renders we're guaranteed a valid session is
  // sitting in the cookie -- this is purely about avoiding a loading flicker,
  // not a security boundary (that boundary is proxy.ts).
  const role: Role = session?.role || 'admin'
  const roleInfo = ROLES[role]
  const RoleIcon = ROLE_ICONS[role]
  const allowedSections = sectionsForRole(role)
  const canSee = (href: string) => allowedSections.some((prefix) => href.startsWith(prefix))

  const visiblePortals = stakeholderPortals.filter((item) => canSee(item.href))
  const visibleIntelligence = intelligenceTools.filter((item) => canSee(item.href))
  const visibleOperations = operationsTools.filter((item) => canSee(item.href))

  const displayName = loading ? '…' : session?.name || roleInfo.label
  const displayOrg = loading ? 'Verifying session…' : session?.email || roleInfo.organization

  return (
    <div className="flex min-h-screen w-full bg-background lg:h-screen lg:min-h-0 lg:overflow-hidden font-sans">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar lg:h-full lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-col gap-6 p-5">
          <Brand />

          {visiblePortals.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-2.5">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Stakeholder Portals
                </p>
              </div>
              <nav className="flex flex-col gap-0.5" aria-label="Stakeholder portals">
                {visiblePortals.map((item) => {
                  const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-start justify-between rounded-lg px-3 py-2.5 text-xs transition-all duration-200 ease-in-out',
                        active
                          ? 'border-l-2 border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-l-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground font-normal',
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {Icon && (
                          <Icon
                            className={cn(
                              'mt-0.5 size-4 shrink-0 transition-colors duration-200 ease-in-out',
                              active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                            )}
                            aria-hidden="true"
                          />
                        )}
                        <span className="flex flex-col leading-tight truncate">
                          <span className="text-xs tracking-tight">{item.label}</span>
                          <span className="text-[10px] font-normal text-muted-foreground truncate">
                            {item.hint}
                          </span>
                        </span>
                      </div>
                      <span
                        className={cn(
                          'ml-1.5 mt-0.5 rounded border px-1.5 py-0.2 text-[9px] tracking-wide shrink-0 font-medium',
                          active
                            ? 'border-primary/25 bg-primary/10 text-primary'
                            : 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        {item.roleBadge}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}

          {visibleIntelligence.length > 0 && (
            <>
              <div className="h-px w-full bg-border" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-2.5">
                  <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                    Intelligence & Signals
                  </p>
                </div>
                <nav className="flex flex-col gap-0.5" aria-label="Intelligence tools">
                  {visibleIntelligence.map((item) => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'group flex items-start justify-between rounded-lg px-3 py-2.5 text-xs transition-all duration-200 ease-in-out',
                          active
                            ? 'border-l-2 border-primary bg-primary/10 text-foreground font-medium'
                            : 'border-l-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground font-normal',
                        )}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={cn(
                                'mt-0.5 size-4 shrink-0 transition-colors duration-200 ease-in-out',
                                active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                              )}
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex flex-col leading-tight truncate">
                            <span className="text-xs tracking-tight">{item.label}</span>
                            <span className="text-[10px] font-normal text-muted-foreground truncate">
                              {item.hint}
                            </span>
                          </span>
                        </div>
                        <span
                          className={cn(
                            'ml-1.5 mt-0.5 rounded border px-1.5 py-0.2 text-[9px] tracking-wide shrink-0 font-medium',
                            active
                              ? 'border-primary/25 bg-primary/10 text-primary'
                              : 'border-border bg-muted text-muted-foreground',
                          )}
                        >
                          {item.roleBadge}
                        </span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </>
          )}

          {visibleOperations.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-2.5">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  Programme Operations
                </p>
              </div>
              <nav className="flex flex-col gap-0.5" aria-label="Programme operations">
                {visibleOperations.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group flex items-start justify-between rounded-lg px-3 py-2.5 text-xs transition-all duration-200 ease-in-out',
                        active
                          ? 'border-l-2 border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-l-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground font-normal',
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {Icon && (
                          <Icon
                            className={cn(
                              'mt-0.5 size-4 shrink-0 transition-colors duration-200 ease-in-out',
                              active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                            )}
                            aria-hidden="true"
                          />
                        )}
                        <span className="flex flex-col leading-tight truncate">
                          <span className="text-xs tracking-tight">{item.label}</span>
                          <span className="text-[10px] font-normal text-muted-foreground truncate">
                            {item.hint}
                          </span>
                        </span>
                      </div>
                      <span
                        className={cn(
                          'ml-1.5 mt-0.5 rounded border px-1.5 py-0.5 text-[9px] tracking-wide shrink-0 font-medium',
                          active
                            ? 'border-primary/25 bg-primary/10 text-primary'
                            : 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        {item.roleBadge}
                      </span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4 space-y-2.5">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                Active Session
              </span>
              <span className="rounded px-1.5 py-0.2 text-[9px] font-medium border border-primary/25 bg-primary/10 text-primary">
                {roleInfo.shortLabel}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                <RoleIcon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{displayName}</p>
                <p className="truncate text-[10px] font-normal text-muted-foreground">{displayOrg}</p>
              </div>
            </div>
          </div>

          <SignOutButton className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition-colors duration-200 ease-in-out hover:bg-muted">
            <span className="flex items-center gap-1.5">
              <span>Sign Out</span>
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              End Session
            </span>
          </SignOutButton>

          {/* Only the Government/Admin role can wipe and reseed the shared
              demo dataset -- everyone else's portal reads the same MongoDB
              collections, so this is treated as a destructive, coordinator-
              level action rather than something every role can trigger. */}
          {role === 'admin' && <ResetDataButton />}

          <p className="px-1 text-[10px] leading-tight text-muted-foreground font-normal">
            Evaluation Platform • MSSDS Skilling Intelligence
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:h-full lg:min-h-0 bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
            <Brand />
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <SignOutButton className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors duration-200 ease-in-out">
                <span>Sign Out</span>
              </SignOutButton>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <RoleIcon className="size-3.5 text-primary shrink-0" />
              <span className="truncate text-muted-foreground font-normal">
                Signed in as: <strong className="text-foreground font-medium">{displayName}</strong>
              </span>
            </div>
            <span className="ml-2 rounded px-1.5 py-0.2 text-[9px] font-medium border border-primary/25 bg-primary/10 text-primary shrink-0">
              {roleInfo.shortLabel}
            </span>
          </div>

          <nav
            className="flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2 bg-card"
            aria-label="Primary mobile"
          >
            {[...visiblePortals, ...visibleIntelligence, ...visibleOperations].map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-in-out',
                    active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        <div className="hidden lg:flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-5 xl:px-8 py-3 text-xs">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex shrink-0 items-center gap-2 font-normal text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-md border border-border bg-muted text-primary">
                <ShieldCheck className="size-3.5" />
              </span>
              <span>
                Active Stakeholder: <strong className="text-foreground font-medium">{roleInfo.label}</strong>
              </span>
            </div>
            <span className="text-border">|</span>
            <span className="truncate text-muted-foreground font-normal">
              {displayName} <span className="text-muted-foreground/80">({displayOrg})</span>
            </span>
            <GlobalSearch className="ml-auto w-full max-w-xs mr-4" />
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <span className="rounded px-2 py-0.5 text-[10px] font-medium border border-border text-muted-foreground">
              {roleInfo.label}
            </span>
            <ThemeToggle />
            <SignOutButton className="inline-flex items-center gap-1.5 font-medium text-primary hover:opacity-90 border border-border px-2.5 py-1 rounded-md text-xs transition-colors duration-200 ease-in-out hover:bg-muted">
              <span>Sign Out</span>
            </SignOutButton>
          </div>
        </div>

        <main className="flex-1 min-w-0 lg:min-h-0 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
