'use client'

import type * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  LineChart,
  Building2,
  UserCheck,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface DemoPersona {
  roleTitle: string
  name: string
  organization: string
  roleCategory: string
  shortRole: string
  icon: typeof ShieldCheck
}

function getPersonaForPath(pathname: string): DemoPersona {
  if (pathname.startsWith('/analytics')) {
    return {
      roleTitle: 'Training Provider',
      name: 'Sahyadri Vocational Institute',
      organization: 'Pune Division Training Center',
      roleCategory: 'Training Partner',
      shortRole: 'Provider',
      icon: GraduationCap,
    }
  }
  if (pathname.startsWith('/employer')) {
    return {
      roleTitle: 'Employer Partner',
      name: 'Deccan Electricals Pvt. Ltd.',
      organization: 'Talegaon Industrial Area, Pune',
      roleCategory: 'Industry Partner',
      shortRole: 'Employer',
      icon: Briefcase,
    }
  }
  if (pathname.startsWith('/trainee')) {
    return {
      roleTitle: 'Trainee Candidate',
      name: 'Rahul Pawar',
      organization: 'ID: KP-0001 • Pune District',
      roleCategory: 'Certified Candidate',
      shortRole: 'Trainee',
      icon: Users,
    }
  }
  if (pathname.startsWith('/insights')) {
    return {
      roleTitle: 'Intelligence Engine',
      name: 'Kaushal Policy AI Engine',
      organization: 'Directorate Analytics Cell',
      roleCategory: 'Policy AI',
      shortRole: 'AI Signal',
      icon: Sparkles,
    }
  }
  return {
    roleTitle: 'Government / Administrator',
    name: 'Dr. Sanjay Patil',
    organization: 'MSSDS Mantralaya, Mumbai',
    roleCategory: 'State Directorate',
    shortRole: 'Govt Admin',
    icon: ShieldCheck,
  }
}

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 px-1 py-1 text-foreground group min-w-0">
      <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-card border border-border transition-opacity duration-200 ease-in-out group-hover:opacity-90">
        <Image
          src="/favicon1.png"
          alt="KaushalPulse"
          width={38}
          height={38}
          className="size-full object-contain p-0.5"
          priority
        />
      </div>
      <div className="flex flex-col leading-tight min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-heading text-base font-semibold tracking-tight text-foreground">
            KAUSHAL<span className="text-primary">PULSE</span>
          </span>
        </div>
        <span className="text-[10px] font-normal text-muted-foreground truncate">
          Skilling Outcomes & Intelligence
        </span>
      </div>
    </Link>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const activePersona = getPersonaForPath(pathname)
  const PersonaIcon = activePersona.icon

  return (
    <div className="flex min-h-screen w-full bg-background lg:h-screen lg:min-h-0 lg:overflow-hidden font-sans">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar lg:h-full lg:min-h-0 lg:overflow-y-auto">
        <div className="flex flex-col gap-6 p-5">
          <Brand />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2.5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Stakeholder Portals
              </p>
            </div>
            <nav className="flex flex-col gap-0.5" aria-label="Stakeholder portals">
              {stakeholderPortals.map((item) => {
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

          <div className="h-px w-full bg-border" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-2.5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Intelligence & Signals
              </p>
            </div>
            <nav className="flex flex-col gap-0.5" aria-label="Intelligence tools">
              {intelligenceTools.map((item) => {
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
        </div>

        <div className="border-t border-border p-4 space-y-2.5">
          <div className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                Active Session
              </span>
              <span className="rounded px-1.5 py-0.2 text-[9px] font-medium border border-primary/25 bg-primary/10 text-primary">
                {activePersona.shortRole}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-primary">
                {PersonaIcon && <PersonaIcon className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                  {activePersona.name}
                </p>
                <p className="truncate text-[10px] font-normal text-muted-foreground">
                  {activePersona.organization}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs font-medium text-foreground transition-colors duration-200 ease-in-out hover:bg-muted"
          >
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight className="size-3.5 text-primary" />
              <span>Switch Demo Role</span>
            </span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              Select
            </span>
          </Link>

          <p className="px-1 text-[10px] leading-tight text-muted-foreground font-normal">
            Evaluation Platform • MSSDS Skilling Intelligence
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden lg:h-full lg:min-h-0 bg-background">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
            <Brand />
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors duration-200 ease-in-out"
            >
              <ArrowLeftRight className="size-3 text-primary" />
              <span>Switch Role</span>
            </Link>
          </div>

          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              {PersonaIcon && <PersonaIcon className="size-3.5 text-primary shrink-0" />}
              <span className="truncate text-muted-foreground font-normal">
                Persona: <strong className="text-foreground font-medium">{activePersona.name}</strong>
              </span>
            </div>
            <span className="ml-2 rounded px-1.5 py-0.2 text-[9px] font-medium border border-primary/25 bg-primary/10 text-primary shrink-0">
              {activePersona.shortRole}
            </span>
          </div>

          <nav
            className="flex gap-1.5 overflow-x-auto border-t border-border px-3 py-2 bg-card"
            aria-label="Primary mobile"
          >
            {[...stakeholderPortals, ...intelligenceTools].map((item) => {
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
                Active Stakeholder: <strong className="text-foreground font-medium">{activePersona.roleTitle}</strong>
              </span>
            </div>
            <span className="text-border">|</span>
            <span className="truncate text-muted-foreground font-normal">
              {activePersona.name} <span className="text-muted-foreground/80">({activePersona.organization})</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <span className="rounded px-2 py-0.5 text-[10px] font-medium border border-border text-muted-foreground">
              {activePersona.roleCategory}
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:opacity-90 border border-border px-2.5 py-1 rounded-md text-xs transition-colors duration-200 ease-in-out hover:bg-muted"
            >
              <ArrowLeftRight className="size-3" />
              <span>Switch Role</span>
            </Link>
          </div>
        </div>

        <main className="flex-1 min-w-0 lg:min-h-0 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
