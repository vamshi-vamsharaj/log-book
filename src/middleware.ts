import { getSessionCookie } from "better-auth/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/planner",
  "/calendar",
  "/journal",
  "/notes",
  "/habits",
  "/goals",
  "/analytics",
  "/settings",
  "/tasks",
];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Only redirect away from auth routes if a cookie is present AND it's not a prefetch
  if (isAuthRoute && sessionCookie) {
    const isPrefetch =
      request.headers.get("x-middleware-prefetch") ||
      request.headers.get("purpose") === "prefetch";

    if (!isPrefetch) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/planner/:path*",
    "/calendar/:path*",
    "/journal/:path*",
    "/notes/:path*",
    "/habits/:path*",
    "/goals/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/tasks/:path*",
    "/sign-in",
    "/sign-up",
  ],
};