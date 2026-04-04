import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import {
  verifyRefreshToken,
  hashToken,
  clearAuthCookies,
  getUserFromRequest,
  COOKIE_REFRESH,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;
  const user         = await getUserFromRequest(req);

  /* ── Revoke refresh token from DB (best-effort) ── */
  if (refreshToken && user) {
    try {
      const payload = await verifyRefreshToken(refreshToken);
      if (payload?.sub) {
        await connectDB();
        const hashed = hashToken(refreshToken);
        await User.updateOne(
          { _id: payload.sub },
          { $pull: { refreshTokens: { token: hashed } } }
        );
      }
    } catch {
      // Non-critical: always clear cookies regardless
    }
  }

  /* ── Clear cookies ── */
  const res = NextResponse.json({ message: "Muvaffaqiyatli chiqdingiz" });
  return clearAuthCookies(res);
}
