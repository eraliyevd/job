import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import User from "@/models/User";
import { getUserFromRequest, unauthorized } from "@/lib/auth";
import { CreateJobSchema, formatZodError } from "@/lib/validation";

/* ── GET /api/jobs ── */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const sp    = new URL(req.url).searchParams;
    const page  = Math.max(1, Number(sp.get("page") ?? 1));
    const limit = Math.min(50, Number(sp.get("limit") ?? 12));
    const search = sp.get("search")?.trim();
    const sort   = sp.get("sort") ?? "newest";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { status: "approved" };

    if (search) query.$text = { $search: search };
    if (sp.get("location"))   query.location  = { $regex: sp.get("location"),  $options: "i" };
    if (sp.get("workTime"))   query.workTime   = sp.get("workTime");
    if (sp.get("experience")) query.experience = sp.get("experience");

    // Salary filter — handle both bounds without $or overwrite
    const salaryMin = Number(sp.get("salaryMin") || 0);
    const salaryMax = Number(sp.get("salaryMax") || 0);
    if (salaryMin > 0 && salaryMax > 0) {
      query.$and = [
        { $or: [{ salaryNegotiable: true }, { salaryMax: { $gte: salaryMin } }] },
        { $or: [{ salaryNegotiable: true }, { salaryMin: { $lte: salaryMax } }] },
      ];
    } else if (salaryMin > 0) {
      query.$or = [{ salaryNegotiable: true }, { salaryMax: { $gte: salaryMin } }];
    } else if (salaryMax > 0) {
      query.$or = [{ salaryNegotiable: true }, { salaryMin: { $lte: salaryMax } }];
    }

    // Age filter
    const ageMin = Number(sp.get("ageMin") || 0);
    const ageMax = Number(sp.get("ageMax") || 0);
    if (ageMin > 0) query.ageMax = { $gte: ageMin };
    if (ageMax > 0) query.ageMin = { $lte: ageMax };

    const sortObj =
      sort === "trending" ? { views: "asc", createdAt: "desc" }
      : /* newest & featured */ { featured: "desc", createdAt: "desc" };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select("-savedBy -rejectedReason -approvedBy -__v")
        .populate("postedBy", "name phone")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return NextResponse.json({
      jobs, total, page, limit,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[GET /api/jobs]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}

/* ── POST /api/jobs ── */
export async function POST(req: NextRequest) {
  const tokenUser = await getUserFromRequest(req);
  if (!tokenUser) return unauthorized();

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Noto'g'ri JSON" }, { status: 400 }); }

  const parsed = CreateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validatsiya xatosi", fields: formatZodError(parsed.error) },
      { status: 422 }
    );
  }

  try {
    await connectDB();

    // Check user job limit
    const user = await User.findById(tokenUser.sub).select("plan jobLimit").lean();
    if (!user) return unauthorized();

    const activeCount = await Job.countDocuments({
      postedBy: tokenUser.sub,
      status:   "approved",
    });

    if (user.jobLimit !== -1 && activeCount >= user.jobLimit) {
      return NextResponse.json(
        { error: `Faol vakansiyalar limiti (${user.jobLimit} ta) to'ldi. Tarifni yangilang.` },
        { status: 403 }
      );
    }

    const data = parsed.data;
    const job  = await Job.create({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      postedBy: tokenUser.sub,
      status:   "pending",
    });

    return NextResponse.json(
      {
        message: "Vakansiya yuborildi. Admin tekshiruvidan so'ng e'lon qilinadi.",
        jobId:   job._id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/jobs]", err);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
