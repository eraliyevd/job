import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { connectDB } from "@/lib/db";
import AuditLog, { type AuditAction } from "@/models/AuditLog";

export const ADMIN_RATE        = { limit: 30, window: 60 } as const;
export const ADMIN_MUTATE_RATE = { limit: 20, window: 60 } as const;

type GuardOk    = { ok: true;  admin: { sub: string; role: string; name?: string }; ip: string };
type GuardError = { ok: false; response: NextResponse };

export async function requireAdmin(req: NextRequest, mutating = false): Promise<GuardOk | GuardError> {
  // Rate limit
  const ip      = getClientIp(req);
  const opts    = mutating ? ADMIN_MUTATE_RATE : ADMIN_RATE;
  const rl      = await rateLimit(`admin:${ip}`, opts);

  if (!rl.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Juda ko'p so'rov. Bir daqiqadan keyin urinib ko'ring." },
        {
          status: 429,
          headers: {
            "Retry-After":           String(rl.retryAfter ?? 60),
            "X-RateLimit-Limit":     String(opts.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      ),
    };
  }

  // Auth + role check
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) {
    return { ok: false, response: NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 }) };
  }
  if (tokenUser.role !== "admin") {
    return { ok: false, response: NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 }) };
  }

  return { ok: true, admin: tokenUser, ip };
}

export async function audit(params: {
  adminId:     string;
  adminName:   string;
  action:      AuditAction;
  targetId?:   string;
  targetType?: "job" | "payment" | "user";
  detail?:     string;
  ip:          string;
  userAgent?:  string;
}): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create(params);
  } catch (e) {
    console.error("[Audit]", e);
  }
}
