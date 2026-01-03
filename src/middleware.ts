import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(['/dashboard/admin(.*)', '/admin(.*)', '/api/admin(.*)']);
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/api/system/config(.*)', '/omni-gate', '/command-center-z', '/marketplace(.*)', '/products(.*)', '/cart(.*)', '/stories(.*)']);
const isIdentityRoute = createRouteMatcher(['/onboarding(.*)', '/api/auth/onboard(.*)', '/api/auth/sync(.*)', '/api/users/me(.*)', '/api/runner(.*)', '/api/orders(.*)', '/api/vendor(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // 🚨 GOD MODE BYPASS: The Ultimate Override 🚨
  // If user has GOD_MODE role, they bypass ALL restrictions (Admin tokens, Maintenance, Onboarding)
  const role = (sessionClaims?.metadata as any)?.role;
  if (role === 'GOD_MODE') {
    return NextResponse.next();
  }

  // 1. ADMIN PROTECTION
  if (isAdminRoute(req)) {
    // Allow the unlock endpoint (it verifies password internally)
    if (pathname === '/api/admin/unlock-command-center') {
      return NextResponse.next();
    }

    // Check for BOSS TOKEN first - allows Command Center to work without Clerk login
    const bossToken = req.cookies.get('OMNI_BOSS_TOKEN');
    console.log('[MIDDLEWARE] Admin route check - Token:', bossToken?.value, 'Path:', pathname);

    if (bossToken && bossToken.value === 'AUTHORIZED_ADMIN') {
      console.log('[MIDDLEWARE] BOSS TOKEN valid - granting access');
      return NextResponse.next();
    }

    if (!userId) {
      // API routes get JSON error
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'AUTHENTICATION_REQUIRED', message: 'Please sign in' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/', req.url));
    }

  }

  // 2. IDENTITY PROTECTION (The Strict Guard)
  // If signed in, not on a public route, and not already on the onboarding flow
  if (userId && !isPublicRoute(req) && !isIdentityRoute(req)) {
    const identityVerified = req.cookies.get('OMNI_IDENTITY_VERIFIED');

    if (!identityVerified || identityVerified.value !== 'TRUE') {
      console.log(`[IDENTITY GUARD] User ${userId} unauthorized for ${pathname}. Redirecting to /onboarding`);

      // CRITICAL: If it's an API route, return JSON error instead of redirect
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            error: 'IDENTITY_VERIFICATION_REQUIRED',
            message: 'Please complete onboarding first',
            redirect: '/onboarding'
          }),
          {
            status: 403,
            headers: { 'content-type': 'application/json' }
          }
        );
      }

      // For pages, redirect to onboarding
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // Security: Clear Administrative Tokens if signed out
  // NOTE: We do NOT clear OMNI_IDENTITY_VERIFIED here because that is our Hybrid Sync bridge
  // for the mobile app which functions even if the web clerk session isn't hot yet.
  if (!userId && req.cookies.has('OMNI_BOSS_TOKEN')) {
    const response = NextResponse.next();
    response.cookies.delete('OMNI_BOSS_TOKEN');
    return response;
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
