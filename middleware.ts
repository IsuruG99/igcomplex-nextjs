import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { hasSupabasePublicEnv } from "./src/lib/env";
import { parseOwnerSession, ownerSessionCookieName } from "./src/lib/owner-auth";

function buildLoginUrl(request: NextRequest, message?: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);

  if (message) {
    loginUrl.searchParams.set("message", message);
  }

  return loginUrl;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedPath =
    pathname.startsWith("/hub") || pathname.startsWith("/tracker") || pathname.startsWith("/workspace");
  const isLoginPath = pathname === "/login";

  const ownerCookie = request.cookies.get(ownerSessionCookieName())?.value;
  const owner = await parseOwnerSession(ownerCookie);

  if (isProtectedPath && !owner) {
    return NextResponse.redirect(buildLoginUrl(request));
  }

  if (isLoginPath && owner) {
    const nextPath = request.nextUrl.searchParams.get("next") ?? "/workspace";
    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  // Still need Supabase for public content reads on protected pages (hub etc.)
  if (!hasSupabasePublicEnv()) {
    if (isProtectedPath) {
      return NextResponse.redirect(buildLoginUrl(request, "auth-not-configured"));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/hub/:path*", "/login", "/tracker/:path*", "/workspace/:path*"],
};