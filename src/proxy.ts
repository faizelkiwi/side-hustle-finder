import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate: visitors without a session cookie are sent to /login before
// any protected page renders. The cookie itself is verified in each page via
// requireUser() (src/lib/server/session.ts); this only avoids a wasted render.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/opportunities",
  "/ideas",
  "/my-opportunities",
  "/assistant",
  "/budget-calculator",
  "/alerts",
  "/settings",
  "/billing",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isProtected && !request.cookies.has("__session")) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
