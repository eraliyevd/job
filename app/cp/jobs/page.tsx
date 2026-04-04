"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Loader2, CheckCircle2, XCircle, Star, StarOff,
  ChevronLeft, ChevronRight, MapPin, Clock, Eye, X, RefreshCw,
} from "lucide-react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn, getWorkTimeLabel, getWorkTimeColor, formatSalary, timeAgo } from "@/lib/utils";

interface AdminJob {
  _id:        string;
  title:      string;
  location:   string;
  workTime:   string;
  salaryMin?: number;
  salaryMax?: number;
  salaryNegotiable: boolean;
  views:      number;
  status:     string;
  featured:   boolean;
  createdAt:  string;
  postedBy:   { name: string; phone: string };
}

const STATUS_TABS = [
  { key: "pending",  label: "Kutilmoqda",    dot: "bg-amber-400" },
  { key: "approved", label: "Tasdiqlangan",  dot: "bg-brand-500" },
  { key: "rejected", label: "Rad etilgan",   dot: "bg-red-400" },
  { key: "all",      label: "Barchasi",      dot: "bg-slate-400" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  approved: "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300",
  rejected: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  closed:   "bg-slate-100 dark:bg-slate-700 text-slate-500",
};

export default function AdminJobsPage() {
  const user   = useRequireAuth();
  const router = useRouter();

  const [tab,        setTab]       = useState("pending");
  const [search,     setSearch]    = useState("");
  const [jobs,       setJobs]      = useState<AdminJob[]>([]);
  const [total,      setTotal]     = useState(0);
  const [page,       setPage]      = useState(1);
  const [pages,      setPages]     = useState(1);
  const [loading,    setLoading]   = useState(false);
  const [actioning,  setActioning] = useState<string | null>(null);
  const [rejectId,   setRejectId]  = useState<string | null>(null);
  const [reason,     setReason]    = useState("");

  useEffect(() => { if (user && user.role !== "admin") router.replace("/"); }, [user, router]);

  const fetchJobs = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ status: tab, page: String(pg), limit: "20" });
      if (search) sp.set("search", search);
      const res  = await fetch(`/api/admin/jobs?${sp}`, { credentials: "include" });
      const data = await res.json();
      setJobs(data.jobs ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(pg);
    } finally { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  async function act(jobId: string, action: string, extra?: object) {
    setActioning(jobId);
    try {
      await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ jobId, action, ...extra }),
      });
      await fetchJobs(page);
    } finally { setActioning(null); }
  }

  async function handleReject() {
    if (!rejectId) return;
    await act(rejectId, "reject", { reason });
    setRejectId(null);
    setReason("");
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Vakansiyalar moderatsiyasi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Jami: {total} ta</p>
        </div>
        <button onClick={() => fetchJobs(page)} className="btn-secondary gap-2 text-sm self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Yangilash
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto scrollbar-hide flex-shrink-0">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                tab === t.key ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
              <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} />
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="search" placeholder="Sarlavha bo'yicha qidirish..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 text-sm" />
        </div>
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1">Rad etish</h3>
            <p className="text-sm text-slate-500 mb-4">Ish beruvchiga ko'rinadigan sabab</p>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Masalan: Tavsif etarli emas..." className="input-base resize-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setReason(""); }} className="btn-secondary flex-1">Bekor</button>
              <button onClick={handleReject} disabled={!reason.trim()}
                className="flex-1 btn-primary !bg-red-600 hover:!bg-red-700 disabled:opacity-50">Rad etish</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-brand-500" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            Hozircha vakansiya yo&apos;q
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {jobs.map(job => (
              <div key={job._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <a href={`/jobs/${job._id}`} target="_blank" rel="noreferrer"
                      className="font-semibold text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                      {job.title}
                    </a>
                    {job.featured && <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px]">⭐ TOP</span>}
                    <span className={cn("badge text-[10px]", STATUS_BADGE[job.status] ?? STATUS_BADGE.closed)}>
                      {STATUS_TABS.find(t => t.key === job.status)?.label ?? job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={cn("badge", getWorkTimeColor(job.workTime))}>{getWorkTimeLabel(job.workTime)}</span>
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">{formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}</span>
                    <span className="flex items-center gap-1 text-slate-400"><Eye className="w-3 h-3" />{job.views}</span>
                    <span className="text-slate-400">{job.postedBy?.name} · {job.postedBy?.phone}</span>
                    <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" />{timeAgo(job.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                  {job.status === "pending" && (<>
                    <button onClick={() => act(job._id, "approve")} disabled={actioning === job._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors disabled:opacity-60">
                      {actioning === job._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Tasdiqlash
                    </button>
                    <button onClick={() => setRejectId(job._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Rad
                    </button>
                  </>)}
                  {job.status === "approved" && (
                    <button onClick={() => act(job._id, job.featured ? "unfeature" : "feature", { featuredDays: 7 })} disabled={actioning === job._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors">
                      {job.featured ? <><StarOff className="w-3.5 h-3.5" /> Top off</> : <><Star className="w-3.5 h-3.5" /> Top qilish</>}
                    </button>
                  )}
                  {job.status === "rejected" && (
                    <button onClick={() => act(job._id, "approve")} disabled={actioning === job._id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Tasdiqlash
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">{total} ta · {page}/{pages} sahifa</p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchJobs(page - 1)} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => fetchJobs(p)}
                    className={cn("w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                      p === page ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700")}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => fetchJobs(page + 1)} disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
