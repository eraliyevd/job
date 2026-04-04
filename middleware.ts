import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken, verifyRefreshToken, COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth";

/**
 * ADMIN_SLUG — set in Railway env vars.
 * Default "cp" is only for local dev. In production use a random string.
 * NEVER commit the real slug.
 */
const ADMIN_SLUG = process.env.ADMIN_SLUG ?? "cp";

const PROTECTED  = ["/post-job", "/dashboard", "/profile", "/payment"];
const AUTH_ONLY  = ["/login", "/register"];  // redirect logged-in users away

function seg(pathname: string, s: string) {
  return pathname === `/${s}` || pathname.startsWith(`/${s}/`);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals, static files, public locales
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/locales") ||
    pathname.match(/\.[a-zA-Z0-9]+$/)  // any file extension
  ) return NextResponse.next();

  // Hard-hide /admin — pretend it doesn't exist
  if (seg(pathname, "admin")) {
    return NextResponse.rewrite(new URL("/not-found-page", req.url));
  }

  // Parse auth
  const accessToken  = req.cookies.get(COOKIE_ACCESS)?.value;
  const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;
  let user = accessToken ? await verifyAccessToken(accessToken) : null;

  // If access expired but refresh is valid → let through with refresh hint
  if (!user && refreshToken) {
    const rp = await verifyRefreshToken(refreshToken);
    if (rp) {
      const res = NextResponse.next();
      res.headers.set("x-needs-refresh", "1");

      // Still block admin routes even with valid refresh (force re-login)
      if (seg(pathname, ADMIN_SLUG) && pathname !== `/${ADMIN_SLUG}/login`) {
        return NextResponse.redirect(new URL(`/${ADMIN_SLUG}/login?from=${encodeURIComponent(pathname)}`, req.url));
      }

      return res;
    }
  }

  /* ── Admin panel ── */
  if (seg(pathname, ADMIN_SLUG)) {
    const loginPath = `/${ADMIN_SLUG}/login`;

    if (pathname === loginPath) {
      // Already admin → go to panel
      if (user?.role === "admin") return NextResponse.redirect(new URL(`/${ADMIN_SLUG}`, req.url));
      return NextResponse.next();
    }

    if (!user) {
      return NextResponse.redirect(new URL(`${loginPath}?from=${encodeURIComponent(pathname)}`, req.url));
    }

    if (user.role !== "admin") {
      // Don't reveal panel exists
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  }

  /* ── Protected user routes ── */
  if (PROTECTED.some(r => pathname === r || pathname.startsWith(r + "/"))) {
    if (!user) {
      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(pathname)}`, req.url));
    }
    return NextResponse.next();
  }

  /* ── Redirect authenticated users away from auth pages ── */
  if (AUTH_ONLY.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
