import "server-only";
import type { Role } from "./roles";
import { ROLES } from "./roles";

export interface DemoAccount {
  email: string;
  password: string;
  role: Role;
  name: string;
}

// Hardcoded demo accounts, one per stakeholder role. This is deliberate and
// disclosed directly on the login screen (see the "Prototype Access" and
// "Coming Soon: State SSO / Aadhaar e-KYC" notices) -- this build has no
// real identity provider yet, and judges/evaluators need a working way in.
//
// The password itself is read from an environment variable so a team
// member can rotate it before a public demo without touching source code
// or committing a new value to git, but it falls back to a fixed value so
// the app still runs out of the box on a fresh clone.
const DEMO_PASSWORD = process.env.DEMO_LOGIN_PASSWORD?.trim() || "sih2024";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "admin@worksync.gov", password: DEMO_PASSWORD, role: "admin", name: "Dr. Sanjay Patil" },
  { email: "provider@worksync.gov", password: DEMO_PASSWORD, role: "provider", name: "Sahyadri Vocational Institute" },
  { email: "employer@worksync.gov", password: DEMO_PASSWORD, role: "employer", name: "Deccan Electricals Pvt. Ltd." },
  { email: "trainee@worksync.gov", password: DEMO_PASSWORD, role: "trainee", name: "Rahul Pawar" },
];

export function findAccount(email: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === normalized) || null;
}

export function homeHrefForRole(role: Role): string {
  return ROLES[role].homeHref;
}
