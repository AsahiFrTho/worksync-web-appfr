import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

// Lets client components (the sidebar identity card, the login page's
// "already signed in?" check) find out who's logged in WITHOUT being able
// to read the session cookie directly -- the cookie is httpOnly specifically
// so client-side JavaScript can't touch it. This route is the one
// controlled, read-only window into that cookie's contents.
export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ success: true, session: null });
  }

  return NextResponse.json({
    success: true,
    session: { email: session.email, role: session.role, name: session.name },
  });
}
