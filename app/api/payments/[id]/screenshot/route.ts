import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { getUserFromRequest, unauthorized } from "@/lib/auth";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

/* Max screenshot size: 2 MB raw → ~2.7 MB base64 */
const MAX_B64_BYTES = 3 * 1024 * 1024; // ~2.25 MB raw

const UploadSchema = z.object({
  /** base64 data URI: "data:image/jpeg;base64,..." */
  dataUri:  z.string()
    .min(100, "Fayl bo'sh")
    .max(MAX_B64_BYTES, "Fayl hajmi 2 MB dan oshmasligi kerak")
    .refine(v => /^data:image\/(jpeg|jpg|png|webp);base64,/.test(v), "Faqat JPEG, PNG yoki WebP formatida"),
  fileName: z.string().max(200).optional(),
});

/* POST /api/payments/[id]/screenshot */
export async function POST(req: NextRequest, { params }: Params) {
  const { id }    = await params;
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = UploadSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? "Noto'g'ri fayl";
    return NextResponse.json({ error: firstError }, { status: 422 });
  }

  await connectDB();

  const payment = await Payment.findById(id);
  if (!payment)
    return NextResponse.json({ error: "To'lov topilmadi" }, { status: 404 });

  // Owner check
  if (payment.userId.toString() !== tokenUser.sub)
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  // Already reviewed — cannot re-upload
  if (payment.status !== "pending")
    return NextResponse.json({ error: "Bu to'lov allaqachon ko'rib chiqilgan" }, { status: 409 });

  payment.screenshot     = parsed.data.dataUri;
  payment.screenshotName = parsed.data.fileName ?? "screenshot";
  await payment.save();

  return NextResponse.json({ message: "Chek yuklandi. Admin ko'rib chiqadi." });
}
