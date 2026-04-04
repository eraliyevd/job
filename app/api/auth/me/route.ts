import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getUserFromRequest, signAccessToken, setAuthCookies, unauthorized, COOKIE_ACCESS } from "@/lib/auth";
import { z } from "zod";

/* ── GET /api/auth/me ── */
export async function GET(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  await connectDB();
  const user = await User.findById(tokenUser.sub).lean();
  if (!user || !user.isActive) return unauthorized("Akkaunt topilmadi");

  return NextResponse.json({
    user: {
      id:             user._id,
      name:           user.name,
      phone:          user.phone,
      role:           user.role,
      plan:           user.plan,
      planExpireDate: user.planExpireDate ?? null,
      topCredits:     user.topCredits,
      jobLimit:       user.jobLimit,
      createdAt:      user.createdAt,
    },
  });
}

/* ── PATCH /api/auth/me — update profile ── */
const PatchSchema = z.object({
  name: z.string().trim().min(2, "Kamida 2 ta harf").max(80).optional(),
});

export async function PATCH(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", fields: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  if (!parsed.data.name) {
    return NextResponse.json({ error: "O'zgartiradigan maydon ko'rsatilmagan" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(
    tokenUser.sub,
    { $set: { name: parsed.data.name } },
    { new: true }
  );
  if (!user) return unauthorized("Akkaunt topilmadi");

  // Reissue access token so name in JWT stays fresh
  const newToken = await signAccessToken(
    user._id.toString(), user.role, user.plan, user.jobLimit, user.name
  );

  const res = NextResponse.json({
    message: "Profil yangilandi",
    user: { id: user._id, name: user.name },
  });

  res.cookies.set(COOKIE_ACCESS, newToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   15 * 60,
  });

  return res;
}
