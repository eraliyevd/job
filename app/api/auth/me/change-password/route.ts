import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getUserFromRequest, unauthorized, clearAuthCookies } from "@/lib/auth";
import { ChangePasswordSchema, formatZodError } from "@/lib/validation";

const BCRYPT_ROUNDS = 12;

export async function PATCH(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", fields: formatZodError(parsed.error) },
      { status: 422 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  await connectDB();

  const user = await User.findById(tokenUser.sub).select("+password +refreshTokens");
  if (!user) return unauthorized("Akkaunt topilmadi");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 401 });
  }

  user.password      = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  user.refreshTokens = [];   // revoke all sessions → force re-login
  await user.save();

  const res = NextResponse.json({ message: "Parol muvaffaqiyatli o'zgartirildi. Qayta kiring." });
  return clearAuthCookies(res);
}
