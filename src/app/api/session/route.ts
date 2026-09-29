import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/server/firebaseAdmin";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/server/session";

// Exchanges a fresh Firebase ID token (from any sign-in method) for an
// httpOnly session cookie that server components and the proxy can check.
export async function POST(request: NextRequest) {
  const { idToken } = (await request.json().catch(() => ({}))) as { idToken?: string };
  if (!idToken) return NextResponse.json({ error: "Missing idToken" }, { status: 400 });

  try {
    const decoded = await adminAuth().verifyIdToken(idToken, true);
    // Only mint a session from a recent sign-in, so a leaked old token can't be upgraded.
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ error: "Sign-in is too old; please sign in again" }, { status: 401 });
    }
    const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_SECONDS * 1000 });
    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid sign-in" }, { status: 401 });
  }
}

export async function DELETE() {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
