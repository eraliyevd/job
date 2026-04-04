"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, CheckCircle2, XCircle, ZoomIn, X,
  ChevronLeft, ChevronRight, Clock, AlertCircle, RefreshCw,
} from "lucide-react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn, timeAgo } from "@/lib/utils";
import { PLANS, formatPrice } from "@/lib/plans";

interface AdminPayment {
  _id:           string;
  plan:          string;
  amount:        number;
  status:        string;
  screenshotName?: string;
  adminNote?:    string;
  createdAt:     string;
  userId:        { name: string; phone: string; plan: string };
  grantedUntil?: string;
}

const STATUS_TABS = [
  { key: "pending",  label: "Kutilmoqda",   dot: "bg-amber-400" },
  { key: "approved", label: "Tasdiqlangan", dot: "bg-brand-500" },
  { key: "rejected", label: "Rad etilgan",  dot: "bg-red-400" },
  { key: "all",      label: "Barchasi",     dot: "bg-slate-400" },
];

const STATUS_BADGE: Record<string, string> = {
  pending:  "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  approved: "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300",
  rejected: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
};

export default function AdminPaymentsPage() {
  const user   = useRequireAuth();
  const router = useRouter();

  const [tab,       setTab]      = useState("pending");
  const [payments,  setPayments] = useState<AdminPayment[]>([]);
  const [total,     setTotal]    = useState(0);
  const [page,      setPage]     = useState(1);
  const [pages,     setPages]    = useState(1);
  const [loading,   setLoading]  = useState(false);
  const [actioning, setActioning]= useState<string | null>(null);
  const [rejectId,  setRejectId] = useState<string | null>(null);
  const [adminNote, setAdminNote]= useState("");
  const [preview,   setPreview]  = useState<{ src: string; name: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  useEffect(() => { if (user && user.role !== "admin") router.replace("/"); }, [user, router]);

  const fetchPayments = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const sp  = new URLSearchParams({ status: tab, page: String(pg) });
      const res = await fetch(`/api/admin/payments?${sp}`, { credentials: "include" });
      const d   = await res.json();
      setPayments(d.payments ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
      setPage(pg);
    } finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchPayments(1); }, [fetchPayments]);

  async function act(paymentId: string, action: "approve" | "reject", note?: string) {
    setActioning(paymentId);
    try {
      await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId, action, adminNote: note }),
      });
      await fetchPayments(page);
    } finally { setActioning(null); }
  }

  async function loadScreenshot(paymentId: string) {
    setPreviewLoading(paymentId);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId, action: "screenshot" }),
      });
      const d = await res.json();
      if (d.screenshot) setPreview({ src: d.screenshot, name: d.name ?? "screenshot" });
    } finally { setPreviewLoading(null); }
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">To&apos;lovlar moderatsiyasi</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Jami: {total} ta</p>
        </div>
        <button onClick={() => fetchPayments(page)} className="btn-secondary gap-2 text-sm self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Yangilash
        </button>
      </div>

      {/* Screenshot preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="relative max-w-xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.src} alt={preview.name} className="w-full rounded-2xl shadow-2xl border border-white/10" />
            <p className="text-white/40 text-xs text-center mt-3">{preview.name}</p>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1">Rad etish</h3>
            <p className="text-sm text-slate-500 mb-4">Foydalanuvchiga ko&apos;rinadigan sabab</p>
            <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
              placeholder="Masalan: Chek noto'g'ri formatda..." className="input-base resize-none mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => { setRejectId(null); setAdminNote(""); }} className="btn-secondary flex-1">Bekor</button>
              <button
                onClick={async () => { await act(rejectId, "reject", adminNote); setRejectId(null); setAdminNote(""); }}
                disabled={!adminNote.trim()}
                className="flex-1 btn-primary !bg-red-600 hover:!bg-red-700 disabled:opacity-50">
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-5 w-fit overflow-x-auto scrollbar-hide">
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

      {/* List */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-brand-500" /></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            Hozircha to&apos;lov yo&apos;q
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {payments.map(pmt => {
              const planCfg = PLANS[pmt.plan as keyof typeof PLANS];
              return (
                <div key={pmt._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">{pmt.userId?.name}</span>
                      <span className="text-xs text-slate-400">{pmt.userId?.phone}</span>
                      <span className={cn("badge text-[10px]", STATUS_BADGE[pmt.status] ?? "bg-slate-100 text-slate-500")}>
                        {STATUS_TABS.find(t => t.key === pmt.status)?.label ?? pmt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs mb-2">
                      <span className="badge bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300">{planCfg?.name ?? pmt.plan}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatPrice(pmt.amount)}</span>
                      <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" />{timeAgo(pmt.createdAt)}</span>
                      {pmt.grantedUntil && (
                        <span className="text-slate-400">→ {new Date(pmt.grantedUntil).toLocaleDateString("uz-UZ")} gacha</span>
                      )}
                    </div>

                    {/* Screenshot / no-screenshot indicator */}
                    {pmt.screenshotName ? (
                      <button onClick={() => loadScreenshot(pmt._id)} disabled={previewLoading === pmt._id}
                        className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
                        {previewLoading === pmt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ZoomIn className="w-3.5 h-3.5" />}
                        Chekni ko&apos;rish
                      </button>
                    ) : pmt.status === "pending" ? (
                      <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Chek hali yuklanmagan
                      </span>
                    ) : null}

                    {pmt.adminNote && (
                      <p className="text-xs text-slate-400 italic mt-1">&ldquo;{pmt.adminNote}&rdquo;</p>
                    )}
                  </div>

                  {/* Actions */}
                  {pmt.status === "pending" && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <button onClick={() => act(pmt._id, "approve")} disabled={actioning === pmt._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors disabled:opacity-60">
                        {actioning === pmt._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Tasdiqlash
                      </button>
                      <button onClick={() => setRejectId(pmt._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Rad
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">{total} ta · {page}/{pages} sahifa</p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchPayments(page - 1)} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => fetchPayments(page + 1)} disabled={page === pages}
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
