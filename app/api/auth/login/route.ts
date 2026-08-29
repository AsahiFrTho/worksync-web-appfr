import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { findAccount, homeHrefForRole } from "@/lib/auth/credentials";
import { signSession, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth/session";

// Same constant-time comparison reasoning as verifySessionToken() in
// lib/auth/session.ts -- we never want a login attempt's success/failure
// to be distinguishable by how long the response took.
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email.trim() || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const account = findAccount(email);

    // Deliberately return the exact same generic error whether the email
    // doesn't match any demo account or the password is wrong for one that
    // does. Distinguishing the two ("no such user" vs "wrong password")
    // would let someone enumerate which demo emails are valid.
    if (!account || !safeCompare(password, account.password)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = signSession({ email: account.email, role: account.role, name: account.name });

    const response = NextResponse.json({
      success: true,
      role: account.role,
      name: account.name,
      redirectTo: homeHrefForRole(account.role),
    });
    response.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not process the login request." },
      { status: 500 }
    );
  }
}
