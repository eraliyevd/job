import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { getUserFromRequest, unauthorized } from "@/lib/auth";
import { PLANS, type PlanKey } from "@/lib/plans";
import { z } from "zod";

const CreateSchema = z.object({
  plan: z.enum(["basic","standard","pro","business"]),
});

/* ── POST /api/payments — initiate a new payment ── */
export async function POST(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Reja nomi noto'g'ri" }, { status: 422 });
  }

  const { plan } = parsed.data;
  const planConfig = PLANS[plan as PlanKey];

  await connectDB();

  // Check: no pending payment for same user already waiting
  const pending = await Payment.findOne({ userId: tokenUser.sub, status: "pending" });
  if (pending) {
    return NextResponse.json(
      { error: "Sizning avvalgi to'lovingiz hali ko'rib chiqilmagan", paymentId: pending._id },
      { status: 409 }
    );
  }

  const payment = await Payment.create({
    userId: tokenUser.sub,
    plan,
    amount: planConfig.price,
    status: "pending",
  });

  return NextResponse.json(
    { message: "To'lov yaratildi", paymentId: payment._id },
    { status: 201 }
  );
}

/* ── GET /api/payments — list current user's payments ── */
export async function GET(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  await connectDB();

  const payments = await Payment.find({ userId: tokenUser.sub })
    .select("-screenshot")          // exclude heavy base64 from list
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return NextResponse.json({ payments });
}
