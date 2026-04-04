"use client";

import { useState } from "react";
import { User, Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FormField from "@/components/ui/FormField";
import { useRequireAuth, useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Tab = "profile" | "security";

export default function ProfilePage() {
  const user = useRequireAuth();
  const { updateUser } = useAuth();

  const [tab,       setTab]      = useState<Tab>("profile");
  const [saving,    setSaving]   = useState(false);
  const [saveDone,  setSaveDone] = useState(false);
  const [saveError, setSaveError]= useState<string|null>(null);

  // Profile form
  const [name, setName] = useState(user?.name ?? "");

  // Password form
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd,     setNewPwd]     = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [pwdError,   setPwdError]   = useState<string|null>(null);
  const [pwdDone,    setPwdDone]    = useState(false);
  const [pwdSaving,  setPwdSaving]  = useState(false);

  if (!user) return null;

  const planLabels = { free:"Bepul", pro:"Pro", enterprise:"Enterprise" };
  const planColors = {
    free:       "bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400",
    pro:        "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300",
    enterprise: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  };

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === user.name) return;
    setSaving(true); setSaveError(null); setSaveDone(false);
    try {
      // TODO: PATCH /api/auth/me with { name }
      await new Promise(r=>setTimeout(r,600));
      updateUser({ name: name.trim() });
      setSaveDone(true);
      setTimeout(()=>setSaveDone(false), 3000);
    } catch {
      setSaveError("Xato yuz berdi");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError(null); setPwdDone(false);
    if (newPwd !== confirmPwd)      { setPwdError("Yangi parollar mos emas"); return; }
    if (newPwd.length < 8)          { setPwdError("Parol kamida 8 belgidan iborat bo'lishi kerak"); return; }
    if (!/[A-Za-z]/.test(newPwd))   { setPwdError("Parolda kamida bitta harf bo'lishi kerak"); return; }
    if (!/[0-9]/.test(newPwd))      { setPwdError("Parolda kamida bitta raqam bo'lishi kerak"); return; }

    setPwdSaving(true);
    try {
      const res = await fetch("/api/auth/me/change-password", {
        method: "PATCH",
        headers: { "Content-Type":"application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd, confirmPassword: confirmPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setPwdError(data.error ?? "Xato yuz berdi"); return; }
      setPwdDone(true);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch {
      setPwdError("Tarmoq xatosi");
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container-app py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">{user.phone}</span>
              <span className={cn("badge text-xs", planColors[user.plan])}>{planLabels[user.plan]}</span>
              {user.role === "admin" && (
                <span className="badge text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-dark-800 rounded-xl p-1 mb-6 w-fit">
          {(["profile","security"] as Tab[]).map((t) => (
            <button key={t} onClick={()=>setTab(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                tab === t
                  ? "bg-white dark:bg-dark-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}>
              {t === "profile" ? <>👤 Profil</> : <>🔒 Xavfsizlik</>}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-semibold text-slate-800 dark:text-slate-200">Profil ma&apos;lumotlari</h2>
            </div>

            <form onSubmit={saveName} className="space-y-4">
              <FormField id="profileName" label="To'liq ism"
                value={name} onChange={(e)=>setName(e.target.value)}
                placeholder="Ism Familiya"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Telefon raqami</label>
                <input type="text" value={user.phone} disabled
                  className="input-base opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">Telefon raqamini o&apos;zgartirish mumkin emas</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tarif</label>
                  <span className={cn("badge", planColors[user.plan])}>{planLabels[user.plan]}</span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Top kreditlar</label>
                  <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                    ⭐ {user.topCredits} ta kredit
                  </span>
                </div>
              </div>

              {saveError && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" /> {saveError}
                </div>
              )}
              {saveDone && (
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Saqlandi!
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || name.trim() === user.name}
                  className="btn-primary gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...</> : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security tab */}
        {tab === "security" && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-brand-600" />
              <h2 className="font-display font-semibold text-slate-800 dark:text-slate-200">Parolni o&apos;zgartirish</h2>
            </div>

            {pwdDone && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Parol muvaffaqiyatli o&apos;zgartirildi. Qayta kiring.
              </div>
            )}

            {pwdError && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {pwdError}
              </div>
            )}

            <form onSubmit={changePassword} className="space-y-4" noValidate>
              <FormField id="currentPwd" label="Joriy parol" type={showCur?"text":"password"}
                value={currentPwd} onChange={(e)=>setCurrentPwd(e.target.value)}
                disabled={pwdSaving}
                right={<button type="button" onClick={()=>setShowCur(v=>!v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{showCur?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}
              />
              <FormField id="newPwd" label="Yangi parol" type={showNew?"text":"password"}
                placeholder="Kamida 8 belgi"
                value={newPwd} onChange={(e)=>setNewPwd(e.target.value)}
                disabled={pwdSaving}
                right={<button type="button" onClick={()=>setShowNew(v=>!v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">{showNew?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>}
              />
              <FormField id="confirmPwd" label="Yangi parolni tasdiqlash" type="password"
                placeholder="Parolni takrorlang"
                value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)}
                disabled={pwdSaving}
              />
              <button type="submit" disabled={pwdSaving || !currentPwd || !newPwd || !confirmPwd}
                className="btn-primary gap-2">
                {pwdSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> O&apos;zgartirilmoqda...</> : "Parolni o'zgartirish"}
              </button>
            </form>

            {/* Sessions info */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-dark-700">
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">Faol sessiyalar</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Parolni o&apos;zgartirganda barcha sessiyalar avtomatik yakunlanadi.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
