"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Briefcase, CreditCard, TrendingUp,
  Clock, CheckCircle2, XCircle, Loader2,
  ArrowRight, DollarSign, AlertTriangle,
} from "lucide-react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn, timeAgo } from "@/lib/utils";
import { formatPrice, PLANS } from "@/lib/plans";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG ?? "cp";

interface Stats {
  users:    { total: number; active: number; admins: number; recent: { name: string; phone: string; plan: string; createdAt: string }[] };
  jobs:     { total: number; pending: number; approved: number; rejected: number; recent: { title: string; status: string; createdAt: string; postedBy?: { name: string } }[] };
  payments: { total: number; pending: number; approved: number; revenue: number; recent: { plan: string; amount: number; status: string; createdAt: string; userId?: { name: string } }[] };
}

function StatCard({
  title, value, sub, icon, color, href, alert,
}: {
  title:  string;
  value:  number | string;
  sub?:   string;
  icon:   React.ReactNode;
  color:  string;
  href?:  string;
  alert?: boolean;
}) {
  const inner = (
    <div className={cn(
      "bg-white dark:bg-slate-800 border rounded-2xl p-5 flex items-start gap-4 transition-all",
      alert ? "border-amber-300 dark:border-amber-700 shadow-amber-100 dark:shadow-amber-900/20 shadow-md" : "border-slate-100 dark:border-slate-700 hover:shadow-md",
      href && "cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
    )}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
        <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {alert && <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />}
      {href && !alert && <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0 mt-1.5" />}
    </div>
  );

  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

const STATUS_BADGE: Record<string, string> = {
  approved: "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300",
  pending:  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  rejected: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  closed:   "bg-slate-100 dark:bg-slate-700 text-slate-500",
};

export default function AdminDashboard() {
  const user   = useRequireAuth();
  const router = useRouter();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/");
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetch("/api/cp/stats", { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setStats(d); })
      .catch(() => setError("Ma'lumot yuklanmadi"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Xush kelibsiz, {user.name.split(" ")[0]}! Tizim holati:
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 btn-primary text-sm">
            Qayta yuklash
          </button>
        </div>
      ) : stats ? (
        <div className="space-y-8">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Foydalanuvchilar"
              value={stats.users.total}
              sub={`${stats.users.active} ta faol`}
              icon={<Users className="w-5 h-5" />}
              color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
              href={`/${ADMIN_SLUG}/users`}
            />
            <StatCard
              title="Vakansiyalar"
              value={stats.jobs.total}
              sub={`${stats.jobs.approved} ta tasdiqlangan`}
              icon={<Briefcase className="w-5 h-5" />}
              color="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
              href={`/${ADMIN_SLUG}/jobs`}
              alert={stats.jobs.pending > 0}
            />
            <StatCard
              title="To'lovlar"
              value={stats.payments.total}
              sub={`${stats.payments.approved} ta tasdiqlangan`}
              icon={<CreditCard className="w-5 h-5" />}
              color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              href={`/${ADMIN_SLUG}/payments`}
              alert={stats.payments.pending > 0}
            />
            <StatCard
              title="Jami daromad"
              value={formatPrice(stats.payments.revenue)}
              sub={`${stats.payments.approved} ta to'lov`}
              icon={<DollarSign className="w-5 h-5" />}
              color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* ── Alert section ── */}
          {(stats.jobs.pending > 0 || stats.payments.pending > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stats.jobs.pending > 0 && (
                <Link href={`/${ADMIN_SLUG}/jobs`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                      {stats.jobs.pending} ta vakansiya kutilmoqda
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Ko'rib chiqish kerak</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              )}
              {stats.payments.pending > 0 && (
                <Link href={`/${ADMIN_SLUG}/payments`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                      {stats.payments.pending} ta to'lov kutilmoqda
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Tasdiqlash kerak</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                </Link>
              )}
            </div>
          )}

          {/* ── Progress bars ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "Tasdiqlangan vakansiyalar",
                value: stats.jobs.approved,
                total: stats.jobs.total,
                color: "bg-brand-500",
              },
              {
                label: "Tasdiqlangan to'lovlar",
                value: stats.payments.approved,
                total: stats.payments.total,
                color: "bg-purple-500",
              },
              {
                label: "Faol foydalanuvchilar",
                value: stats.users.active,
                total: stats.users.total,
                color: "bg-blue-500",
              },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{total ? Math.round((value / total) * 100) : 0}%</p>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", color)}
                    style={{ width: `${total ? Math.min(100, (value / total) * 100) : 0}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">{value} / {total}</p>
              </div>
            ))}
          </div>

          {/* ── Recent activity (3 columns) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Recent users */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">Yangi foydalanuvchilar</h3>
                </div>
                <Link href={`/${ADMIN_SLUG}/users`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Barchasi
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {stats.users.recent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Yo'q</p>
                ) : stats.users.recent.map((u, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">{u.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px] capitalize">{u.plan}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent jobs */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">Yangi vakansiyalar</h3>
                </div>
                <Link href={`/${ADMIN_SLUG}/jobs`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Barchasi
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {stats.jobs.recent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Yo'q</p>
                ) : stats.jobs.recent.map((j, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{j.title}</p>
                      <p className="text-xs text-slate-400">{j.postedBy?.name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={cn("badge text-[10px]", STATUS_BADGE[j.status] ?? STATUS_BADGE.closed)}>
                        {j.status === "pending" ? "Kutilmoqda" : j.status === "approved" ? "Tasdiqlangan" : j.status === "rejected" ? "Rad" : "Yopiq"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(j.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent payments */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">Yangi to'lovlar</h3>
                </div>
                <Link href={`/${ADMIN_SLUG}/payments`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Barchasi
                </Link>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {stats.payments.recent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">Yo'q</p>
                ) : stats.payments.recent.map((p, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{p.userId?.name}</p>
                      <p className="text-xs font-bold text-brand-600 dark:text-brand-400">{formatPrice(p.amount)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={cn("badge text-[10px]", STATUS_BADGE[p.status] ?? STATUS_BADGE.closed)}>
                        {p.status === "pending" ? "Kutilmoqda" : p.status === "approved" ? "OK" : "Rad"}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(p.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick stats row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Kutilmoqda (ish)", value: stats.jobs.pending, color: "text-amber-600", icon: <Clock className="w-4 h-4" /> },
              { label: "Kutilmoqda (to'lov)", value: stats.payments.pending, color: "text-amber-600", icon: <Clock className="w-4 h-4" /> },
              { label: "Rad etilgan (ish)", value: stats.jobs.rejected, color: "text-red-500", icon: <XCircle className="w-4 h-4" /> },
              { label: "Adminlar", value: stats.users.admins, color: "text-brand-600", icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 flex items-center gap-3">
                <span className={cn("flex-shrink-0", color)}>{icon}</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg leading-none">{value}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      ) : null}
    </div>
  );
}
