import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  signAccessToken, signRefreshToken,
  hashToken, setAuthCookies,
} from "@/lib/auth";
import { LoginSchema, formatZodError } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const INVALID_CREDS = "Telefon raqami yoki parol noto'g'ri";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
// Dummy hash for constant-time comparison when user not found
const DUMMY_HASH = "$2a$12$KIHxoZtCgvv7fKmePgT5OecMDZBhxmolLFKU.0MdPv4wQYXSP9N9a";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`login:${ip}`, { limit: 10, window: 900 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 900) } }
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", fields: formatZodError(parsed.error) },
      { status: 422 }
    );
  }

  const { phone, password } = parsed.data;

  await connectDB();

  const user = await User.findOne({ phone }).select("+password +refreshTokens");

  // Always run bcrypt to prevent timing attacks
  const hashToCompare = user?.password ?? DUMMY_HASH;
  const match = await bcrypt.compare(password, hashToCompare);

  if (!user || !match) {
    return NextResponse.json({ error: INVALID_CREDS }, { status: 401 });
  }

  if (!user.isActive) {
    return NextResponse.json(
      { error: "Akkauntingiz bloklangan. Qo'llab-quvvatlash xizmatiga murojaat qiling." },
      { status: 403 }
    );
  }

  const [accessToken, { token: refreshToken }] = await Promise.all([
    signAccessToken(user._id.toString(), user.role, user.plan, user.jobLimit, user.name),
    signRefreshToken(user._id.toString()),
  ]);

  // Prune expired tokens, keep max 5 sessions
  const now = new Date();
  const pruned = user.refreshTokens
    .filter(t => t.expiresAt > now)
    .slice(-4);

  pruned.push({
    token:     hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip,
    createdAt: new Date(),
  });

  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: pruned } });

  const res = NextResponse.json({
    message: "Muvaffaqiyatli kirdingiz",
    user: {
      id:             user._id,
      name:           user.name,
      phone:          user.phone,
      role:           user.role,
      plan:           user.plan,
      planExpireDate: user.planExpireDate ?? null,
      topCredits:     user.topCredits,
      jobLimit:       user.jobLimit,
    },
  });

  return setAuthCookies(res, accessToken, refreshToken);
}
