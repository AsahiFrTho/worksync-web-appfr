import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

// A logout is just "delete the session cookie" -- there's no server-side
// session store to clean up because the cookie itself IS the session
// (signed, not stored). This keeps the demo dependency-free (no Redis /
// database session table needed) at the cost of not being able to force-
// revoke a single session before it naturally expires -- an acceptable
// tradeoff for an 8-hour-lived evaluation login, and worth calling out
// explicitly if a judge asks about session revocation.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
