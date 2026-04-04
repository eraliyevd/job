"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, Loader2, Ban, CheckCircle2,
  ChevronLeft, ChevronRight, RefreshCw, Shield,
} from "lucide-react";
import { useRequireAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { cn, timeAgo } from "@/lib/utils";

interface AdminUser {
  _id:           string;
  name:          string;
  phone:         string;
  role:          string;
  plan:          string;
  planExpireDate?: string;
  topCredits:    number;
  jobLimit:      number;
  isActive:      boolean;
  createdAt:     string;
}

const PLAN_COLORS: Record<string, string> = {
  free:     "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
  basic:    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
  standard: "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300",
  pro:      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
  business: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
};

export default function AdminUsersPage() {
  const user   = useRequireAuth();
  const router = useRouter();

  const [users,      setUsers]     = useState<AdminUser[]>([]);
  const [total,      setTotal]     = useState(0);
  const [page,       setPage]      = useState(1);
  const [pages,      setPages]     = useState(1);
  const [loading,    setLoading]   = useState(false);
  const [actioning,  setActioning] = useState<string | null>(null);
  const [search,     setSearch]    = useState("");
  const [planFilter, setPlanFilter]= useState("");

  useEffect(() => { if (user && user.role !== "admin") router.replace("/"); }, [user, router]);

  const fetchUsers = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page: String(pg), limit: "20" });
      if (search)     sp.set("search", search);
      if (planFilter) sp.set("plan",   planFilter);
      const res = await fetch(`/api/admin/users?${sp}`, { credentials: "include" });
      const d   = await res.json();
      setUsers(d.users ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
      setPage(pg);
    } finally { setLoading(false); }
  }, [search, planFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  async function patchUser(userId: string, patch: object) {
    setActioning(userId);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, patch }),
      });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...patch } : u));
    } finally { setActioning(null); }
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Jami: {total} ta</p>
        </div>
        <button onClick={() => fetchUsers(page)} className="btn-secondary gap-2 text-sm self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Yangilash
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input type="search" placeholder="Ism yoki telefon..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-base pl-10 text-sm" />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="input-base text-sm sm:w-44">
          <option value="">Barcha tariflar</option>
          {["free","basic","standard","pro","business"].map(p => (
            <option key={p} value={p} className="capitalize">{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/20">
                {["Foydalanuvchi","Telefon","Tarif","TOP/Limit","Holat","Ro'l","Amallar"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-20"><Loader2 className="w-7 h-7 animate-spin text-brand-500 mx-auto" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-slate-400 text-sm">Foydalanuvchi topilmadi</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  {/* Name + date */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{timeAgo(u.createdAt)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{u.phone}</td>

                  {/* Plan */}
                  <td className="px-4 py-3">
                    <span className={cn("badge text-xs capitalize", PLAN_COLORS[u.plan] ?? PLAN_COLORS.free)}>
                      {u.plan}
                    </span>
                    {u.planExpireDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(u.planExpireDate).toLocaleDateString("uz-UZ")} gacha
                      </p>
                    )}
                  </td>

                  {/* Credits / limit */}
                  <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>⭐ {u.topCredits}</span>
                    <span className="mx-1 text-slate-300">·</span>
                    <span>{u.jobLimit === -1 ? "∞" : u.jobLimit} ish</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn("badge text-xs",
                      u.isActive ? "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                                 : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400")}>
                      {u.isActive ? "Faol" : "Bloklangan"}
                    </span>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={cn("badge text-xs",
                      u.role === "admin" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 flex items-center gap-1"
                                        : "bg-slate-100 dark:bg-slate-700 text-slate-500")}>
                      {u.role === "admin" && <Shield className="w-2.5 h-2.5" />}
                      {u.role}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {/* Block / unblock */}
                      <button
                        onClick={() => patchUser(u._id, { isActive: !u.isActive })}
                        disabled={actioning === u._id || u._id === user.id}
                        title={u.isActive ? "Bloklash" : "Faollashtirish"}
                        className={cn(
                          "p-1.5 rounded-lg text-xs transition-colors disabled:opacity-30",
                          u.isActive ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                     : "text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        )}
                      >
                        {actioning === u._id ? <Loader2 className="w-4 h-4 animate-spin" />
                          : u.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Toggle admin role */}
                      {u._id !== user.id && (
                        <button
                          onClick={() => patchUser(u._id, { role: u.role === "admin" ? "user" : "admin" })}
                          disabled={actioning === u._id}
                          title={u.role === "admin" ? "Admin rolini olib tashlash" : "Admin qilish"}
                          className={cn(
                            "p-1.5 rounded-lg text-xs transition-colors disabled:opacity-30",
                            u.role === "admin"
                              ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          )}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400">{total} ta · {page}/{pages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => fetchUsers(page - 1)} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = Math.max(1, Math.min(pages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => fetchUsers(p)}
                    className={cn("w-8 h-8 rounded-lg text-xs font-semibold transition-colors",
                      p === page ? "bg-brand-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700")}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => fetchUsers(page + 1)} disabled={page === pages}
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
