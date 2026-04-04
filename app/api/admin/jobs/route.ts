import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import { requireAdmin, audit } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  const sp     = new URL(req.url).searchParams;
  const status = sp.get("status") ?? "pending";
  const page   = Math.max(1, Number(sp.get("page") ?? 1));
  const limit  = Math.min(50, Number(sp.get("limit") ?? 20));
  const search = sp.get("search")?.trim();

  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status !== "all") query.status = status;
    if (search) query.$text = { $search: search };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("postedBy", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[GET /api/admin/jobs]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req, true);
  if (!guard.ok) return guard.response;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "JSON xato" }, { status: 400 }); }

  const { jobId, action, reason, featuredDays } = body as {
    jobId:         string;
    action:        "approve" | "reject" | "feature" | "unfeature" | "close";
    reason?:       string;
    featuredDays?: number;
  };

  if (!mongoose.Types.ObjectId.isValid(jobId))
    return NextResponse.json({ error: "Noto'g'ri ID" }, { status: 400 });

  try {
    await connectDB();
    const job = await Job.findById(jobId);
    if (!job) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

    switch (action) {
      case "approve":
        job.status     = "approved";
        job.approvedAt = new Date();
        job.approvedBy = new mongoose.Types.ObjectId(guard.admin.sub);
        break;
      case "reject":
        job.status         = "rejected";
        job.rejectedReason = reason ?? "Sababsiz rad etildi";
        break;
      case "feature":
        job.featured      = true;
        job.featuredUntil = new Date(Date.now() + (featuredDays ?? 7) * 86_400_000);
        break;
      case "unfeature":
        job.featured      = false;
        job.featuredUntil = undefined;
        break;
      case "close":
        job.status = "closed";
        break;
      default:
        return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
    }

    await job.save();

    // Audit
    audit({
      adminId:    guard.admin.sub,
      adminName:  guard.admin.name ?? "Admin",
      action:     `job.${action}` as Parameters<typeof audit>[0]["action"],
      targetId:   jobId,
      targetType: "job",
      detail:     reason ?? (action === "feature" ? `${featuredDays ?? 7} kun` : undefined),
      ip:         guard.ip,
      userAgent:  req.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ message: "Yangilandi", job });
  } catch (err) {
    console.error("[PATCH /api/admin/jobs]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
