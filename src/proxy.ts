import { auth } from "@/lib/auth/middleware-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection matrix:
 *
 * /admin/*        → requires any authenticated user (admin or agent)
 * /auth/login     → redirects to /admin if already authenticated
 * /api/auth/*     → always public (NextAuth internals)
 * everything else → public
 */

const PROTECTED_PREFIXES = ["/admin"];
const AUTH_ROUTES = ["/auth/login", "/auth/error"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── Already logged in → redirect away from login page ──────────────────────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (session?.user) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // ── Protected routes ────────────────────────────────────────────────────────
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected) {
    // No session → redirect to login with callbackUrl
    if (!session?.user) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-based enforcement
    // Only super_admin and admin can access /admin/properties (destructive actions)
    if (
      pathname.startsWith("/admin/properties") &&
      pathname !== "/admin/properties" &&
      session.user.role === "agent"
    ) {
      // Agents can view but not add/edit/delete
      if (
        pathname.includes("/new") ||
        pathname.includes("/edit") ||
        pathname.includes("/delete")
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

/**
 * Matcher config:
 * Runs middleware on all routes EXCEPT Next.js internals,
 * static files, and image optimisation routes.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
