import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Job from "@/models/Job";
import Payment from "@/models/Payment";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    await connectDB();

    const [
      totalUsers,
      activeUsers,
      adminCount,
      totalJobs,
      pendingJobs,
      approvedJobs,
      rejectedJobs,
      totalPayments,
      pendingPayments,
      approvedPayments,
      totalRevenue,
      recentUsers,
      recentJobs,
      recentPayments,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: "admin" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "pending" }),
      Job.countDocuments({ status: "approved" }),
      Job.countDocuments({ status: "rejected" }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: "pending" }),
      Payment.countDocuments({ status: "approved" }),
      // Sum of approved payment amounts
      Payment.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      // Last 5 users
      User.find().sort({ createdAt: -1 }).limit(5)
        .select("name phone plan createdAt").lean(),
      // Last 5 jobs
      Job.find().sort({ createdAt: -1 }).limit(5)
        .select("title status createdAt").populate("postedBy", "name").lean(),
      // Last 5 payments
      Payment.find().sort({ createdAt: -1 }).limit(5)
        .select("plan amount status createdAt")
        .populate("userId", "name phone").lean(),
    ]);

    return NextResponse.json({
      users: {
        total:  totalUsers,
        active: activeUsers,
        admins: adminCount,
        recent: recentUsers,
      },
      jobs: {
        total:    totalJobs,
        pending:  pendingJobs,
        approved: approvedJobs,
        rejected: rejectedJobs,
        recent:   recentJobs,
      },
      payments: {
        total:    totalPayments,
        pending:  pendingPayments,
        approved: approvedPayments,
        revenue:  totalRevenue[0]?.total ?? 0,
        recent:   recentPayments,
      },
    });
  } catch (err) {
    console.error("[GET /api/cp/stats]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
