"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Briefcase, Eye, Clock, ChevronRight, AlertCircle,
  Loader2, CheckCircle2, XCircle, Hourglass, Star, CreditCard,
  Calendar, Zap, ArrowRight, Crown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRequireAuth, useAuth } from "@/contexts/AuthContext";
import { cn, getWorkTimeLabel, getWorkTimeColor, formatSalary, timeAgo } from "@/lib/utils";
import { PLANS, formatPrice } from "@/lib/plans";

interface DashJob {
  _id: string; title: string; location: string; workTime: string;
  salaryMin?: number; salaryMax?: number; salaryNegotiable: boolean;
  views: number; status: string; featured: boolean; createdAt: string;
  rejectedReason?: string;
}

interface DashPayment {
  _id: string; plan: string; amount: number; status: string;
  createdAt: string; screenshotName?: string; adminNote?: string;
  grantedUntil?: string;
}

const JOB_STATUS: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  approved: { label: "Tasdiqlangan", cls: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20",   icon: <CheckCircle2 className="w-4 h-4" /> },
  pending:  { label: "Kutilmoqda",   cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",   icon: <Hourglass    className="w-4 h-4" /> },
  rejected: { label: "Rad etilgan",  cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",           icon: <XCircle      className="w-4 h-4" /> },
  closed:   { label: "Yopiq",        cls: "text-slate-500 bg-slate-100 dark:bg-slate-800",                          icon: <XCircle      className="w-4 h-4" /> },
};

const PMT_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Kutilmoqda",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  approved: { label: "Tasdiqlangan", cls: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300" },
  rejected: { label: "Rad etilgan",  cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:     <Briefcase className="w-5 h-5" />,
  basic:    <Briefcase className="w-5 h-5" />,
  standard: <Star      className="w-5 h-5" />,
  pro:      <Zap       className="w-5 h-5" />,
  business: <Crown     className="w-5 h-5" />,
};

const PLAN_ICON_COLORS: Record<string, string> = {
  free:     "bg-slate-100 dark:bg-slate-700 text-slate-500",
  basic:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  standard: "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400",
  pro:      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  business: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
};

export default function DashboardPage() {
  const user = useRequireAuth();
  const { updateUser } = useAuth();
  const [jobs,     setJobs]    = useState<DashJob[]>([]);
  const [payments, setPayments]= useState<DashPayment[]>([]);
  const [loadingJobs, setLoadingJobs]   = useState(true);
  const [loadingPmts, setLoadingPmts]   = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    // Fetch user's own jobs — all statuses (not just approved)
    fetch(`/api/jobs?postedBy=me&limit=50`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .catch(() => {})
      .finally(() => setLoadingJobs(false));

    fetch("/api/payments", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setPayments(d.payments ?? []);
        const approved = (d.payments ?? []).find((p: DashPayment) => p.status === "approved");
        if (approved) {
          fetch("/api/auth/me", { credentials: "include" })
            .then(r => r.json())
            .then(d => { if (d.user) updateUser(d.user); });
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPmts(false));
  }, [user, updateUser]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!user) return null;

  const planCfg    = PLANS[user.plan as keyof typeof PLANS] ?? PLANS.free;
  const activeJobs = jobs.filter(j => j.status === "approved").length;
  const pendingJobs= jobs.filter(j => j.status === "pending").length;
  const totalViews = jobs.reduce((s, j) => s + (j.views || 0), 0);
  const jobLimit   = user.jobLimit === -1 ? Infinity : user.jobLimit;
  const canPost    = jobLimit === Infinity || activeJobs < jobLimit;
  const pendingPmt = payments.find(p => p.status === "pending");
  const expireSoon = user.planExpireDate &&
    new Date(user.planExpireDate).getTime() - Date.now() < 7 * 86400000;

  return (
    <>
      <Navbar />
      <main className="container-app py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Salom, {user.name.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Vakansiyalaringizni boshqaring</p>
          </div>
          {canPost ? (
            <Link href="/post-job" className="btn-primary gap-2 self-start sm:self-auto">
              <Plus className="w-4 h-4" /> Vakansiya joylash
            </Link>
          ) : (
            <Link href="/pricing" className="btn-secondary gap-2 self-start sm:self-auto border-amber-400 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4" /> Limitni oshirish
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Alerts */}
            {pendingPmt && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Hourglass className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">To&apos;lov tekshirilmoqda</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 line-clamp-2">
                    {PLANS[pendingPmt.plan as keyof typeof PLANS]?.name ?? pendingPmt.plan} tarifi uchun to&apos;lovingiz ko&apos;rib chiqilmoqda.
                  </p>
                </div>
              </div>
            )}

            {expireSoon && user.planExpireDate && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Tarif tugashiga oz qoldi</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {new Date(user.planExpireDate).toLocaleDateString("uz-UZ")} da tarif tugaydi.
                  </p>
                </div>
                <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">Uzaytirish</Link>
              </div>
            )}

            {!canPost && !pendingPmt && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    Limit: {activeJobs}/{jobLimit === Infinity ? "∞" : jobLimit} ta faol vakansiya
                  </p>
                </div>
                <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">Yuksaltirish</Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Jami",         value: jobs.length, icon: <Briefcase    className="w-5 h-5" />, color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400" },
                { label: "Tasdiqlangan", value: activeJobs,  icon: <CheckCircle2 className="w-5 h-5" />, color: "text-brand-600 bg-brand-100 dark:bg-brand-900/40 dark:text-brand-400" },
                { label: "Kutilmoqda",   value: pendingJobs, icon: <Hourglass    className="w-5 h-5" />, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400" },
                { label: "Ko'rishlar",   value: totalViews,  icon: <Eye          className="w-5 h-5" />, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400" },
              ].map(s => (
                <div key={s.label} className="card p-4">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-2.5", s.color)}>{s.icon}</div>
                  <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Jobs list */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-display font-semibold text-slate-800 dark:text-slate-200">Mening vakansiyalarim</h2>
                <Link href="/jobs" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  Barchasi <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {loadingJobs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Hali vakansiya joylashtirilmagan</p>
                  <Link href="/post-job" className="btn-primary gap-2 inline-flex text-sm">
                    <Plus className="w-4 h-4" /> Birinchi vakansiya
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobs.slice(0, 10).map(job => {
                    const sc = JOB_STATUS[job.status] ?? JOB_STATUS.closed;
                    return (
                      <div key={job._id} className="px-4 sm:px-5 py-3.5 flex items-start sm:items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Link href={`/jobs/${job._id}`} className="font-semibold text-sm text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                              {job.title}
                            </Link>
                            {job.featured && <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px]">⭐</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className={cn("badge", getWorkTimeColor(job.workTime))}>{getWorkTimeLabel(job.workTime)}</span>
                            <span className="text-slate-500">{job.location}</span>
                            <span className="font-semibold text-brand-600 dark:text-brand-400">{formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}</span>
                          </div>
                          {job.rejectedReason && (
                            <p className="text-xs text-red-500 mt-1 line-clamp-1">Sabab: {job.rejectedReason}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-shrink-0">
                          <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
                            <Eye className="w-3.5 h-3.5" />{job.views}
                            <Clock className="w-3.5 h-3.5 ml-1.5" />{timeAgo(job.createdAt)}
                          </span>
                          <div className={cn("flex items-center gap-1.5 badge text-xs", sc.cls)}>
                            {sc.icon}
                            <span className="hidden sm:inline">{sc.label}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payments */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h2 className="font-display font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" /> To&apos;lovlar tarixi
                </h2>
                <Link href="/pricing" className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  Yangi tarif <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {loadingPmts ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-brand-500" /></div>
              ) : payments.length === 0 ? (
                <div className="text-center py-10">
                  <CreditCard className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Hali to&apos;lov yo&apos;q</p>
                  <Link href="/pricing" className="btn-primary text-sm inline-flex gap-2"><Zap className="w-4 h-4" /> Tarif xarid qilish</Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map(pmt => {
                    const pc   = PMT_STATUS[pmt.status as keyof typeof PMT_STATUS];
                    const pcfg = PLANS[pmt.plan as keyof typeof PLANS];
                    return (
                      <div key={pmt._id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{pcfg?.name ?? pmt.plan}</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">{formatPrice(pmt.amount)}</span>
                            {pmt.grantedUntil && (
                              <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />{new Date(pmt.grantedUntil).toLocaleDateString("uz-UZ")} gacha
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{timeAgo(pmt.createdAt)}</p>
                        </div>
                        <span className={cn("badge text-xs flex-shrink-0", pc?.cls)}>
                          {pc?.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Plan card */}
            <div className={cn(
              "card p-5 border-2",
              planCfg.color ?? "border-slate-200 dark:border-slate-700"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  PLAN_ICON_COLORS[user.plan] ?? PLAN_ICON_COLORS.free)}>
                  {PLAN_ICONS[user.plan] ?? <Briefcase className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Joriy tarif</p>
                  <p className="font-display font-bold text-slate-900 dark:text-white capitalize">{user.plan}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Vakansiya limiti</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeJobs} / {jobLimit === Infinity ? "∞" : jobLimit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">TOP kreditlar</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">⭐ {user.topCredits}</span>
                </div>
                {user.planExpireDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Tugash sanasi</span>
                    <span className={cn("font-semibold text-xs", expireSoon ? "text-red-500" : "text-slate-800 dark:text-slate-200")}>
                      {new Date(user.planExpireDate).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {jobLimit !== Infinity && (
                <div className="mb-4">
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", activeJobs >= jobLimit ? "bg-red-500" : "bg-brand-500")}
                      style={{ width: `${Math.min(100, (activeJobs / jobLimit) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <Link href="/pricing" className="btn-secondary w-full justify-center gap-2 text-sm">
                <Zap className="w-3.5 h-3.5" />
                {user.plan === "free" ? "Tarif xarid qilish" : "Tarifni yangilash"}
              </Link>
            </div>

            {/* Quick links */}
            <div className="card p-5">
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm mb-3">Tezkor harakatlar</h3>
              <div className="space-y-1">
                {[
                  { href: "/post-job", label: "Vakansiya joylash",    icon: <Plus className="w-4 h-4" /> },
                  { href: "/jobs",     label: "Barcha vakansiyalar",  icon: <Briefcase className="w-4 h-4" /> },
                  { href: "/pricing",  label: "Tariflar",             icon: <CreditCard className="w-4 h-4" /> },
                  { href: "/profile",  label: "Profil",               icon: <Eye className="w-4 h-4" /> },
                ].map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <span className="text-slate-400">{l.icon}</span>
                    {l.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
