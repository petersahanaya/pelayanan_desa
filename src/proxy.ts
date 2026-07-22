import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("session")?.value;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register", "/api/auth", "/api/information", "/api/village-settings"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // PWA assets that must always be accessible
  if (pathname === "/manifest.json" || pathname === "/sw.js" || pathname === "/~offline.html" || pathname.startsWith("/icons/")) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    // If logged in and trying to access login/register, redirect to home
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // If no session, redirect to login
  if (!session) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
