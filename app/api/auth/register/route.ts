import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  signAccessToken, signRefreshToken,
  hashToken, setAuthCookies,
} from "@/lib/auth";
import { RegisterSchema, formatZodError } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const BCRYPT_ROUNDS = 12;
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit(`register:${ip}`, { limit: 5, window: 600 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Ko'p urinish. 10 daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter ?? 600) } }
    );
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", fields: formatZodError(parsed.error) },
      { status: 422 }
    );
  }

  const { name, phone, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ phone }).select("_id").lean();
  if (existing) {
    return NextResponse.json(
      { error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" },
      { status: 409 }
    );
  }

  const hashedPwd = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user first to get real _id
  const user = await User.create({
    name,
    phone,
    password: hashedPwd,
    role:         "user",
    plan:         "free",
    jobLimit:     1,
    topCredits:   0,
    refreshTokens: [],
  });

  const userId = user._id.toString();

  // Sign tokens with the real userId
  const [accessToken, { token: refreshToken }] = await Promise.all([
    signAccessToken(userId, user.role, user.plan, user.jobLimit, user.name),
    signRefreshToken(userId),
  ]);

  // Single update — add refresh token
  await User.updateOne({ _id: user._id }, {
    $push: {
      refreshTokens: {
        token:     hashToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        userAgent: req.headers.get("user-agent") ?? undefined,
        ip,
      },
    },
  });

  const res = NextResponse.json({
    message: "Muvaffaqiyatli ro'yxatdan o'tdingiz",
    user: {
      id:             user._id,
      name:           user.name,
      phone:          user.phone,
      role:           user.role,
      plan:           user.plan,
      planExpireDate: null,
      topCredits:     user.topCredits,
      jobLimit:       user.jobLimit,
    },
  }, { status: 201 });

  return setAuthCookies(res, accessToken, refreshToken);
}
