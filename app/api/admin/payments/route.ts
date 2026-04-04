import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { requireAdmin, audit } from "@/lib/admin-guard";
import { PLANS, type PlanKey } from "@/lib/plans";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const sp     = new URL(req.url).searchParams;
  const status = sp.get("status") ?? "pending";
  const page   = Math.max(1, Number(sp.get("page") ?? 1));
  const limit  = 20;

  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (status !== "all") query.status = status;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .select("-screenshot")
        .populate("userId", "name phone plan planExpireDate topCredits jobLimit")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Payment.countDocuments(query),
    ]);

    return NextResponse.json({ payments, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/admin/payments]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req, true);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "JSON xato" }, { status: 400 }); }

  const { paymentId, action, adminNote } = body as {
    paymentId: string;
    action:    "approve" | "reject" | "screenshot";
    adminNote?: string;
  };

  if (!mongoose.Types.ObjectId.isValid(paymentId))
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    await connectDB();
    const payment = await Payment.findById(paymentId);
    if (!payment) return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });

    // Screenshot preview — returns base64 for display
    if (action === "screenshot") {
      const full = await Payment.findById(paymentId).select("screenshot screenshotName");
      return NextResponse.json({ screenshot: full?.screenshot, name: full?.screenshotName });
    }

    if (payment.status !== "pending")
      return NextResponse.json({ error: "Bu to'lov allaqachon ko'rib chiqilgan" }, { status: 409 });

    if (action === "reject") {
      payment.status     = "rejected";
      payment.adminNote  = adminNote ?? "Rad etildi";
      payment.reviewedBy = new mongoose.Types.ObjectId(guard.admin.sub);
      payment.reviewedAt = new Date();
      await payment.save();

      audit({
        adminId: guard.admin.sub, adminName: guard.admin.name ?? "Admin",
        action: "payment.reject", targetId: paymentId, targetType: "payment",
        detail: adminNote, ip: guard.ip,
      });

      return NextResponse.json({ message: "Rad etildi" });
    }

    if (action === "approve") {
      const plan = PLANS[payment.plan as PlanKey];
      if (!plan) return NextResponse.json({ error: "Noma'lum reja" }, { status: 400 });

      const now    = new Date();
      const expiry = plan.durationDays > 0
        ? new Date(now.getTime() + plan.durationDays * 86_400_000)
        : null;

      const user = await User.findById(payment.userId);
      if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

      user.plan            = plan.key;
      user.planExpireDate  = expiry ?? undefined;
      user.jobLimit        = plan.jobLimit;
      user.topCredits      = (user.topCredits ?? 0) + plan.topCredits;
      await user.save();

      payment.status            = "approved";
      payment.adminNote         = adminNote ?? "";
      payment.reviewedBy        = new mongoose.Types.ObjectId(guard.admin.sub);
      payment.reviewedAt        = now;
      payment.grantedPlan       = plan.key;
      payment.grantedUntil      = expiry ?? undefined;
      payment.grantedTopCredits = plan.topCredits;
      payment.grantedJobLimit   = plan.jobLimit;
      await payment.save();

      audit({
        adminId: guard.admin.sub, adminName: guard.admin.name ?? "Admin",
        action: "payment.approve", targetId: paymentId, targetType: "payment",
        detail: `Plan: ${plan.name}`, ip: guard.ip,
      });

      return NextResponse.json({ message: `${plan.name} tarifi faollashtirildi` });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/admin/payments]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
