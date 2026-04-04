import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import { getUserFromRequest, unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/* ── GET /api/jobs/[id] ── */
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const tokenUser = await getUserFromRequest(req);

    // Single query — include savedBy for isSaved check
    const job = await Job.findById(id)
      .populate("postedBy", "name phone")
      .lean();

    if (!job) return NextResponse.json({ error: "Vakansiya topilmadi" }, { status: 404 });

    // Visibility check
    const postedById = (job.postedBy as { _id: mongoose.Types.ObjectId } | mongoose.Types.ObjectId | string);
    const ownerId = typeof postedById === "object" && "_id" in postedById
      ? String(postedById._id)
      : String(postedById);

    const isOwner = tokenUser?.sub === ownerId;
    const isAdmin = tokenUser?.role === "admin";

    if (job.status !== "approved" && !isOwner && !isAdmin) {
      return NextResponse.json({ error: "Vakansiya topilmadi" }, { status: 404 });
    }

    // Increment views async (fire-and-forget)
    Job.updateOne({ _id: id }, { $inc: { views: 1 } }).exec().catch(() => {});

    // isSaved — use the savedBy array from the same query
    const isSaved = tokenUser
      ? (job.savedBy ?? []).some(uid => String(uid) === tokenUser.sub)
      : false;

    // Don't expose savedBy array to client
    const { savedBy: _savedBy, rejectedReason: _rr, approvedBy: _ab, ...safeJob } = job as typeof job & { savedBy?: unknown[]; rejectedReason?: unknown; approvedBy?: unknown };

    return NextResponse.json({ job: { ...safeJob, isSaved } });
  } catch (err) {
    console.error("[GET /api/jobs/:id]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/* ── DELETE /api/jobs/[id] ── */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });
  }

  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  try {
    await connectDB();
    const job = await Job.findById(id).select("postedBy status");
    if (!job) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const isOwner = tokenUser.sub === String(job.postedBy);
    const isAdmin = tokenUser.role === "admin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
    }

    await job.deleteOne();
    return NextResponse.json({ message: "O'chirildi" });
  } catch (err) {
    console.error("[DELETE /api/jobs/:id]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
