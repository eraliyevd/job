import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin, audit } from "@/lib/admin-guard";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const sp     = new URL(req.url).searchParams;
  const page   = Math.max(1, Number(sp.get("page") ?? 1));
  const limit  = Math.min(50, Number(sp.get("limit") ?? 20));
  const search = sp.get("search")?.trim();
  const plan   = sp.get("plan");
  const role   = sp.get("role");

  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (plan) query.plan = plan;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshTokens -__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

const PatchSchema = z.object({
  userId: z.string().min(1),
  patch: z.object({
    isActive: z.boolean().optional(),
    role:     z.enum(["user", "admin"]).optional(),
    plan:     z.enum(["free","basic","standard","pro","business"]).optional(),
    topCredits: z.number().int().min(0).optional(),
  }).strict(),
});

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req, true);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "JSON xato" }, { status: 400 }); }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validatsiya xatosi" }, { status: 422 });
  }

  const { userId, patch } = parsed.data;

  // Prevent self-demotion
  if (userId === guard.admin.sub && patch.role && patch.role !== "admin") {
    return NextResponse.json({ error: "O'zingizning rolingizni o'zgartira olmaysiz" }, { status: 400 });
  }

  try {
    await connectDB();
    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: patch },
      { new: true, select: "-password -refreshTokens -__v" }
    );

    if (!updated) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    // Audit specific actions
    if (patch.isActive !== undefined) {
      audit({
        adminId: guard.admin.sub, adminName: guard.admin.name ?? "Admin",
        action:  patch.isActive ? "user.unblock" : "user.block",
        targetId: userId, targetType: "user",
        ip: guard.ip,
      });
    }
    if (patch.role) {
      audit({
        adminId: guard.admin.sub, adminName: guard.admin.name ?? "Admin",
        action: "user.role_change", targetId: userId, targetType: "user",
        detail: `role → ${patch.role}`, ip: guard.ip,
      });
    }

    return NextResponse.json({ message: "Yangilandi", user: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/users]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req, true);
  if (!guard.ok) return guard.response;

  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId kerak" }, { status: 400 });
  if (userId === guard.admin.sub) return NextResponse.json({ error: "O'z akkauntingizni o'chira olmaysiz" }, { status: 400 });

  try {
    await connectDB();
    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json({ message: "O'chirildi" });
  } catch (err) {
    console.error("[DELETE /api/admin/users]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
