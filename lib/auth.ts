export const runtime = "nodejs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { UserRole, UserPlan } from "@/models/User";

/* ── TTLs ── */
export const ACCESS_TOKEN_TTL  = 15 * 60;           // 15 min (s)
export const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days (s)

export const COOKIE_ACCESS  = "jb_access";
export const COOKIE_REFRESH = "jb_refresh";

/* ── Secret loader ── */
function getSecret(key: string): Uint8Array {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env variable: ${key}`);
  return new TextEncoder().encode(v);
}

/* ── Token payloads ── */
export interface AccessTokenPayload extends JWTPayload {
  sub:      string;   // userId
  role:     UserRole;
  plan:     UserPlan;
  jobLimit: number;   // cached from user doc
  name:     string;   // for admin panel display
}

export interface RefreshTokenPayload extends JWTPayload {
  sub: string;
  jti: string;
}

/* ── Sign ── */
export async function signAccessToken(
  userId:   string,
  role:     UserRole,
  plan:     UserPlan,
  jobLimit: number,
  name:     string,
): Promise<string> {
  return new SignJWT({ role, plan, jobLimit, name } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL}s`)
    .sign(getSecret("JWT_ACCESS_SECRET"));
}

export async function signRefreshToken(userId: string): Promise<{ token: string; jti: string }> {
  const jti   = crypto.randomUUID();
  const token = await new SignJWT({ jti })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_TTL}s`)
    .sign(getSecret("JWT_REFRESH_SECRET"));
  return { token, jti };
}

/* ── Verify ── */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret("JWT_ACCESS_SECRET"));
    return payload as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret("JWT_REFRESH_SECRET"));
    return payload as RefreshTokenPayload;
  } catch {
    return null;
  }
}

/* ── Token hashing (SHA-256 for DB storage) ── */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/* ── Cookie helpers ── */
const isProd = process.env.NODE_ENV === "production";

export function setAuthCookies(
  response: NextResponse,
  accessToken:  string,
  refreshToken: string,
): NextResponse {
  const base = { httpOnly: true, secure: isProd, sameSite: "strict" as const, path: "/" };

  response.cookies.set(COOKIE_ACCESS, accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_TTL,
  });

  response.cookies.set(COOKIE_REFRESH, refreshToken, {
    ...base,
    maxAge: REFRESH_TOKEN_TTL,
    path:   "/api/auth",   // restrict refresh token to auth routes only
  });

  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_ACCESS);
  response.cookies.set(COOKIE_REFRESH, "", {
    httpOnly: true,
    secure:   isProd,
    sameSite: "strict",
    path:     "/api/auth",
    maxAge:   0,
  });
  return response;
}

/* ── Server-component helper ── */
export async function getServerUser(): Promise<AccessTokenPayload | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_ACCESS)?.value;
    if (!token) return null;
    return verifyAccessToken(token);
  } catch {
    return null;
  }
}

/* ── Route-handler helper ── */
export function getUserFromRequest(req: NextRequest): Promise<AccessTokenPayload | null> {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;
  if (!token) return Promise.resolve(null);
  return verifyAccessToken(token);
}

/* ── Standard error responses ── */
export function unauthorized(message = "Avtorizatsiya talab qilinadi"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}
export function forbidden(message = "Ruxsat yo'q"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}
