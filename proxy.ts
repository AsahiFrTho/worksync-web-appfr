import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isPathAllowedForRole, ROLES } from "@/lib/auth/roles";

// NOTE for future maintainers: this file is named `proxy.ts`, not
// `middleware.ts`. Next.js 16 renamed the middleware file convention to
// "Proxy" -- `middleware.ts` still half-works via a compatibility shim but
// is deprecated, and code written against the old name/APIs from an older
// Next.js version will not behave correctly here. Always check
// node_modules/next/dist/docs before touching this file.
//
// This is the ONE place that actually enforces access control server-side.
// The sidebar in components/app-shell.tsx also hides links a role can't
// use, but that's just UX polish -- if someone bypasses the UI and types a
// restricted URL directly, THIS is what stops them. Both places import the
// same lib/auth/roles.ts rules, so they can't silently disagree.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    // Not signed in (or the cookie was tampered with / expired) -- bounce
    // to the login page and remember where they were trying to go via
    // ?from=, so we can send them back there after a successful login.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isPathAllowedForRole(pathname, session.role)) {
    // Signed in, but this role has no business here -- e.g. a Trainee
    // session trying to open the Government dashboard by guessing the URL.
    // Send them back to their own home portal instead of a generic 403.
    return NextResponse.redirect(new URL(ROLES[session.role].homeHref, request.url));
  }

  return NextResponse.next();
}

// Next.js requires `matcher` to be a static, literal array it can analyze
// at build time -- it CANNOT be computed from lib/auth/roles.ts's
// SECTION_ACCESS list at runtime. We accepted that small duplication
// deliberately rather than fight the framework; if you add a new
// protected section to SECTION_ACCESS, add its path here too.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/employer/:path*",
    "/trainee/:path*",
    "/insights/:path*",
    "/skillgaps/:path*",
    "/learners/:path*",
    "/followups/:path*",
    "/verification/:path*",
    "/scorecard/:path*",
    "/dataquality/:path*",
    "/settings/:path*",
  ],
};
