// Single source of truth for "who is allowed to see what".
//
// This file is intentionally framework-agnostic (no `server-only`, no
// Node-only APIs) because it is imported from THREE very different places
// that must never disagree with each other:
//   1. proxy.ts        -- the server-side gate that actually blocks a request
//   2. app-shell.tsx    -- the client-side sidebar, which hides links a
//                          signed-in user isn't allowed to click anyway
//   3. api/auth routes  -- to know where to send someone after login
//
// If we had duplicated this mapping in each place, it would be easy for
// them to quietly drift apart (e.g. a link visible in the sidebar that the
// proxy then blocks). Keeping ONE list and importing it everywhere makes
// that class of bug structurally impossible.

export type Role = "admin" | "provider" | "employer" | "trainee";

export interface RoleInfo {
  role: Role;
  label: string;
  shortLabel: string;
  organization: string;
  /** Where a signed-in user of this role lands after login, and where an
   *  authenticated-but-not-permitted request gets redirected back to. */
  homeHref: string;
}

export const ROLES: Record<Role, RoleInfo> = {
  admin: {
    role: "admin",
    label: "Government / Administrator",
    shortLabel: "Admin",
    organization: "MSSDS Mantralaya, Mumbai",
    homeHref: "/dashboard",
  },
  provider: {
    role: "provider",
    label: "Training Provider",
    shortLabel: "Provider",
    organization: "Sahyadri Vocational Institute, Pune",
    homeHref: "/analytics",
  },
  employer: {
    role: "employer",
    label: "Employer",
    shortLabel: "Employer",
    organization: "Deccan Electricals Pvt. Ltd.",
    homeHref: "/employer",
  },
  trainee: {
    role: "trainee",
    label: "Trainee",
    shortLabel: "Trainee",
    organization: "KP-0001 · Pune District",
    homeHref: "/trainee",
  },
};

// ── Section access rules ─────────────────────────────────────────────────
// Business rule: the Government/Administrator role has statewide oversight
// authority -- that IS the point of this problem statement -- so it can see
// every section. Every other stakeholder is scoped to only the part of the
// system that concerns them:
//   - Training providers see their own analytics + skill-gap / policy
//     signals (they need this to actually act on curriculum feedback).
//   - Employers only manage their own hiring & verification portal.
//   - Trainees only see their own outcome passport.
//   - Internal programme-operations tooling (learner registry, follow-up
//     queue, verification queue, provider scorecards, data quality,
//     settings) is government/coordinator-facing and stays admin-only.
export const SECTION_ACCESS: { prefix: string; roles: Role[] }[] = [
  { prefix: "/dashboard", roles: ["admin"] },
  { prefix: "/analytics", roles: ["admin", "provider"] },
  { prefix: "/employer", roles: ["admin", "employer"] },
  { prefix: "/trainee", roles: ["admin", "trainee"] },
  { prefix: "/insights", roles: ["admin", "provider"] },
  { prefix: "/skillgaps", roles: ["admin", "provider"] },
  { prefix: "/learners", roles: ["admin"] },
  { prefix: "/followups", roles: ["admin"] },
  { prefix: "/verification", roles: ["admin"] },
  { prefix: "/scorecard", roles: ["admin"] },
  { prefix: "/dataquality", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },
];

/** Paths not listed in SECTION_ACCESS at all (e.g. /login) are considered
 *  public and are never gated by this function -- proxy.ts only calls this
 *  for paths its matcher already restricted to the list above. */
export function isPathAllowedForRole(pathname: string, role: Role): boolean {
  const rule = SECTION_ACCESS.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return true;
  return rule.roles.includes(role);
}

/** Given a role, which of the section prefixes above can it open? Used by
 *  the sidebar to filter nav links so we never show a link that the proxy
 *  would immediately bounce the user back out of. */
export function sectionsForRole(role: Role): string[] {
  return SECTION_ACCESS.filter((r) => r.roles.includes(role)).map((r) => r.prefix);
}
