import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  verifyRefreshToken, signAccessToken, signRefreshToken,
  hashToken, setAuthCookies, clearAuthCookies, COOKIE_REFRESH,
} from "@/lib/auth";

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token topilmadi" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload?.sub) {
    return clearAuthCookies(NextResponse.json({ error: "Noto'g'ri token" }, { status: 401 }));
  }

  await connectDB();

  const user = await User.findById(payload.sub).select("+refreshTokens");
  if (!user || !user.isActive) {
    return clearAuthCookies(
      NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 })
    );
  }

  const hashed = hashToken(refreshToken);
  const now    = new Date();
  const idx    = user.refreshTokens.findIndex(t => t.token === hashed && t.expiresAt > now);

  if (idx === -1) {
    // Reuse detection — revoke all sessions
    await User.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });
    return clearAuthCookies(
      NextResponse.json(
        { error: "Token qayta ishlatilgan. Barcha sessiyalar bekor qilindi." },
        { status: 401 }
      )
    );
  }

  // Rotate tokens
  const [newAccess, { token: newRefresh }] = await Promise.all([
    signAccessToken(user._id.toString(), user.role, user.plan, user.jobLimit, user.name),
    signRefreshToken(user._id.toString()),
  ]);

  // Remove consumed, add new
  const updated = user.refreshTokens.filter((_, i) => i !== idx);
  updated.push({
    token:     hashToken(newRefresh),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    userAgent: req.headers.get("user-agent") ?? undefined,
    ip:        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown",
  });

  await User.updateOne({ _id: user._id }, { $set: { refreshTokens: updated } });

  const res = NextResponse.json({
    message: "Token yangilandi",
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

  return setAuthCookies(res, newAccess, newRefresh);
}
