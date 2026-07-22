import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET || "pelayanan-desa-secret-key-2026";
const encodedKey = new TextEncoder().encode(secretKey);

export interface Session {
  userId: string;
  username: string;
  role: string;
}

export async function createSession(session: Session) {
  const expiresIn = 7 * 24 * 60 * 60 * 1000; // 7 days
  const expires = new Date(Date.now() + expiresIn);

  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });

  return token;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

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

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function getSessionFromRequest(
  request: Request
): Promise<Session | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/session=([^;]+)/);
  if (!match) return null;

  try {
    const { payload } = await jwtVerify(match[1], encodedKey);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function getSessionFromToken(
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
