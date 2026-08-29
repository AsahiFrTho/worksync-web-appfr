import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { Role } from "./roles";

export const SESSION_COOKIE_NAME = "worksync_session";

// Deliberately short-lived for a public evaluation build -- if a laptop is
// left logged in at a demo booth, the session self-expires within a work
// day instead of staying valid indefinitely.
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

export interface SessionPayload {
  email: string;
  role: Role;
  name: string;
  issuedAt: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.trim()) return secret.trim();
  // Fallback so the prototype still runs out of the box on a fresh clone or
  // a quick Vercel deploy without extra setup. This is fine for a hackathon
  // demo; it is NOT fine for a real production rollout -- SESSION_SECRET
  // must come from a real secret manager / environment variable before any
  // deployment that handles real user data.
  console.warn(
    "[auth] SESSION_SECRET is not set — using an insecure development fallback. " +
      "Set SESSION_SECRET in your environment before any non-demo deployment."
  );
  return "worksync-dev-only-fallback-secret-change-me";
}

// We deliberately did NOT reach for a JWT library for a 4-role demo login.
// This is a plain HMAC-signed cookie: base64url(payload) + "." + hex(hmac).
// The payload itself is NOT encrypted -- it's just base64, so it's readable
// -- but it IS signed. That's the actual security property a session cookie
// needs here: the browser can see its own role/name, but cannot edit the
// cookie in devtools to grant itself a different role, because it does not
// know SESSION_SECRET and therefore cannot produce a signature that
// verifySessionToken() will accept.
export function signSession(payload: Omit<SessionPayload, "issuedAt">): string {
  const full: SessionPayload = { ...payload, issuedAt: Date.now() };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret()).update(body).digest("hex");
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expectedSignature = createHmac("sha256", getSessionSecret()).update(body).digest("hex");

  // Constant-time comparison. A naive `signature === expectedSignature`
  // check would return faster for a signature that's wrong in the first
  // character than one that's wrong in the last -- in theory that timing
  // difference can be measured over many requests to guess a valid
  // signature byte-by-byte. timingSafeEqual always takes the same amount
  // of time regardless of where the mismatch is.
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    const ageMs = Date.now() - payload.issuedAt;
    if (ageMs > SESSION_MAX_AGE_SECONDS * 1000 || ageMs < 0) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript running on the page can never read this cookie (blocks XSS token theft)
  secure: process.env.NODE_ENV === "production", // HTTPS-only once actually deployed
  sameSite: "lax" as const, // cookie is not sent on cross-site POSTs from other domains (CSRF hardening)
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
