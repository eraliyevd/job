import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import { getUserFromRequest, unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

/* POST /api/jobs/[id]/save  → toggle saved */
export async function POST(req: NextRequest, { params }: Params) {
  const { id }    = await params;
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  if (!mongoose.Types.ObjectId.isValid(id))
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    await connectDB();
    const job = await Job.findById(id).select("savedBy status");
    if (!job || job.status !== "approved")
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    const userId   = new mongoose.Types.ObjectId(tokenUser.sub);
    const alreadySaved = job.savedBy.some(uid => uid.equals(userId));

    if (alreadySaved) {
      job.savedBy = job.savedBy.filter(uid => !uid.equals(userId));
    } else {
      job.savedBy.push(userId);
    }
    await job.save();

    return NextResponse.json({ saved: !alreadySaved, count: job.savedBy.length });
  } catch (err) {
    console.error("[POST /api/jobs/:id/save]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
