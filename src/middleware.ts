import { NextRequest, NextResponse } from "next/server";

import { jwtVerify } from "jose";

const secretKey =
  process.env.SESSION_SECRET || "pelayanan-desa-secret-key-2026";

const encodedKey = new TextEncoder().encode(secretKey);

export interface Session {
  userId: string;
  username: string;
  role: string;
}

export async function verifySessionToken(
  token: string
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey);

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("session")?.value;

  const session = token
    ? await verifySessionToken(token)
    : null;

  const publicPaths = [
    "/login",
    "/register",
    "/api/auth",
    "/api/information",
    "/api/village-settings",
  ];

  const isPublicPath = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/~offline.html" ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  if (isPublicPath) {
    if (
      session &&
      (pathname === "/login" || pathname === "/register")
    ) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    return NextResponse.next();
  }

  if (!session) {
    const response = pathname.startsWith("/api/")
      ? NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      : NextResponse.redirect(
          new URL("/login", request.url)
        );

    if (token) {
      response.cookies.delete("session");
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
