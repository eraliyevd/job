"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import PhoneInput from "@/components/ui/PhoneInput";
import { cn } from "@/lib/utils";

const ADMIN_SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG ?? "cp";

export default function AdminLoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, user, isLoading } = useAuth();

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked,   setLocked]   = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  const from = searchParams.get("from") ?? `/${ADMIN_SLUG}`;

  /* If already logged in as admin, redirect */
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.replace(from);
      } else {
        // Logged in but not admin — kick back to home
        router.replace("/");
      }
    }
  }, [user, isLoading, router, from]);

  /* Countdown when locked */
  useEffect(() => {
    if (!locked) return;
    const interval = setInterval(() => {
      setLockTimer(t => {
        if (t <= 1) {
          setLocked(false);
          setAttempts(0);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locked]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;

    setError(null);

    if (!phone || !password) {
      setError("Telefon va parolni kiriting");
      return;
    }

    const result = await login(phone, password);

    if (!result.ok) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      /* Lock for 30 seconds after 5 failed attempts */
      if (newAttempts >= 5) {
        setLocked(true);
        setLockTimer(30);
        setError("Ko'p urinish. 30 soniya kuting.");
        return;
      }

      setError(result.error ?? "Telefon yoki parol noto'g'ri");
      return;
    }

    /* Login succeeded — check admin role */
    /* useAuth will update, useEffect will redirect. But handle race: */
    const meRes  = await fetch("/api/auth/me", { credentials: "include" });
    const meData = await meRes.json();

    if (meData.user?.role !== "admin") {
      /* Logged in, but not admin. Log out immediately. */
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      setError("Bu sahifaga kirish uchun admin huquqi talab qilinadi");
      return;
    }

    router.push(from);
  }

  return (
    /* Full-screen centered, completely isolated from public layout */
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      {/* Subtle grid background */}
      <div className="absolute inset-0 dot-grid text-white opacity-[0.03] pointer-events-none" />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-brand-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Admin kirish</h1>
            <p className="text-sm text-white/40 mt-1">Faqat vakolatli xodimlar uchun</p>
          </div>

          {/* Lock banner */}
          {locked && (
            <div className="mb-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>{lockTimer} soniyadan keyin urinib ko&apos;ring</span>
            </div>
          )}

          {/* Error */}
          {error && !locked && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Phone input — dark theme overrides */}
            <div>
              <label className="block text-sm font-semibold text-white/60 mb-1.5">Telefon raqami</label>
              <div className="[&_.input-base]:bg-white/5 [&_.input-base]:border-white/10 [&_.input-base]:text-white [&_.input-base]:placeholder:text-white/30 [&_.input-base:focus]:ring-brand-500 [&_.input-base:focus]:border-transparent">
                <PhoneInput
                  id="admin-phone"
                  value={phone}
                  onChange={setPhone}
                  disabled={isLoggingIn || locked}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-pwd" className="block text-sm font-semibold text-white/60 mb-1.5">
                Parol
              </label>
              <div className="relative">
                <input
                  id="admin-pwd"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoggingIn || locked}
                  placeholder="••••••••"
                  className={cn(
                    "w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl",
                    "text-white placeholder:text-white/30 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
                    "transition-all duration-200 disabled:opacity-50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Attempt counter */}
            {attempts > 0 && !locked && (
              <p className="text-xs text-amber-400/70 text-center">
                {5 - attempts} ta urinish qoldi
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || locked || !phone || !password}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all mt-2",
                isLoggingIn || locked || !phone || !password
                  ? "bg-brand-600/40 text-white/40 cursor-not-allowed"
                  : "bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/25 active:scale-[0.98]"
              )}
            >
              {isLoggingIn
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Tekshirilmoqda...</>
                : <><Shield className="w-4 h-4" /> Kirish</>}
            </button>
          </form>

          {/* Security note */}
          <p className="text-center text-[11px] text-white/20 mt-6 leading-relaxed">
            Har bir kirish urinishi qayd etiladi.
            <br />Ruxsatsiz kirish huquqiy javobgarlikka olib keladi.
          </p>
        </div>

        {/* Back to site */}
        <div className="text-center mt-5">
          <a href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← Asosiy saytga qaytish
          </a>
        </div>
      </div>
    </div>
  );
}
