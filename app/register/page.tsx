"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import PhoneInput from "@/components/ui/PhoneInput";
import FormField from "@/components/ui/FormField";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

function pwdStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: "", color: "" };
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const m = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Juda zaif",  color: "bg-red-400" },
    { score: 2, label: "Zaif",       color: "bg-orange-400" },
    { score: 3, label: "O'rtacha",   color: "bg-amber-400" },
    { score: 4, label: "Kuchli",     color: "bg-brand-500" },
    { score: 5, label: "Juda kuchli",color: "bg-brand-600" },
  ];
  return m[Math.min(s, 5)];
}

function validate(name: string, phone: string, password: string, confirm: string) {
  const e: Record<string, string> = {};
  if (name.trim().length < 2)   e.name    = "Ism kamida 2 ta harf";
  if (phone.replace(/\D/g,"").length < 9) e.phone = "To'liq telefon kiriting";
  if (password.length < 8)      e.password = "Kamida 8 belgi";
  else if (!/[A-Za-z]/.test(password)) e.password = "Kamida bitta harf bo'lsin";
  else if (!/[0-9]/.test(password))    e.password = "Kamida bitta raqam bo'lsin";
  if (password && confirm && password !== confirm) e.confirm = "Parollar mos emas";
  return e;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegistering, user, isLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [pwd,     setPwd]     = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agreed,  setAgreed]  = useState(false);
  const [touched, setTouched] = useState({ name: false, phone: false, pwd: false, confirm: false });
  const [apiError, setApiError]    = useState<string | null>(null);
  const [fieldErr, setFieldErr]    = useState<Record<string, string>>({});

  useEffect(() => { if (!isLoading && user) router.replace("/"); }, [user, isLoading, router]);

  const strength  = pwdStrength(pwd);
  const clientErr = Object.values(touched).some(Boolean) ? validate(name, phone, pwd, confirm) : {};
  const allErr    = { ...clientErr, ...fieldErr };

  function touch(field: keyof typeof touched) {
    setTouched(t => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setFieldErr({});
    setTouched({ name: true, phone: true, pwd: true, confirm: true });
    const errs = validate(name, phone, pwd, confirm);
    if (Object.keys(errs).length > 0) return;
    if (!agreed) { setApiError("Foydalanish shartlariga rozilik bildiring"); return; }

    const result = await register(name.trim(), phone, pwd);
    if (!result.ok) {
      if (result.fields) setFieldErr(result.fields);
      else { setApiError(result.error ?? "Xato"); toastError(result.error ?? "Ro'yxatdan o'tish muvaffaqiyatsiz"); }
      return;
    }
    toastSuccess("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
    router.push("/");
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-4 py-12 bg-mesh">
        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="card-elevated p-7 sm:p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand mb-4">
                <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Ro&apos;yxatdan o&apos;tish</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Akkaunt yarating va ishga bering</p>
            </div>

            {apiError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-5 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <FormField id="name" label="To'liq ism" type="text" autoFocus
                placeholder="Ism Familiya" value={name}
                onChange={e => { setName(e.target.value); touch("name"); setFieldErr(f=>{ const n={...f}; delete n.name; return n; }); }}
                onBlur={() => touch("name")}
                error={touched.name ? allErr.name : undefined}
                disabled={isRegistering}
              />

              <PhoneInput id="phone" label="Telefon raqami" value={phone}
                onChange={v => { setPhone(v); touch("phone"); setFieldErr(f=>{ const n={...f}; delete n.phone; return n; }); }}
                error={touched.phone ? allErr.phone : undefined}
                disabled={isRegistering}
              />

              {/* Password with strength */}
              <div>
                <label htmlFor="pwd" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Parol</label>
                <div className={cn(
                  "relative flex items-center rounded-[var(--radius-md)] border transition-all",
                  "bg-white dark:bg-slate-800/60",
                  allErr.password && touched.pwd
                    ? "border-red-400 dark:border-red-600 shadow-[0_0_0_3px_rgb(239_68_68/.12)]"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgb(14_164_114/.12)]"
                )}>
                  <input id="pwd" type={showPwd ? "text" : "password"} placeholder="Kamida 8 belgi"
                    value={pwd}
                    onChange={e => { setPwd(e.target.value); touch("pwd"); }}
                    onBlur={() => touch("pwd")}
                    disabled={isRegistering}
                    className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none min-h-[42px]"
                  />
                  <button type="button" onClick={() => setShowPwd(v=>!v)} className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {pwd && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength.score ? strength.color : "bg-slate-100 dark:bg-slate-700")} />
                      ))}
                    </div>
                    {strength.label && (
                      <p className="text-xs text-slate-400">Kuch: <span className="font-medium text-slate-600 dark:text-slate-300">{strength.label}</span></p>
                    )}
                  </div>
                )}
                {touched.pwd && allErr.password && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {allErr.password}
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div>
                <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Parolni tasdiqlash</label>
                <div className={cn(
                  "relative flex items-center rounded-[var(--radius-md)] border transition-all",
                  "bg-white dark:bg-slate-800/60",
                  allErr.confirm && touched.confirm
                    ? "border-red-400 dark:border-red-600"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 focus-within:border-brand-500 focus-within:shadow-[0_0_0_3px_rgb(14_164_114/.12)]"
                )}>
                  <input id="confirm" type="password" placeholder="Takrorlang"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); touch("confirm"); }}
                    disabled={isRegistering}
                    className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none min-h-[42px]"
                  />
                  {confirm && (
                    <div className="px-3">
                      {pwd === confirm
                        ? <CheckCircle2 className="w-4 h-4 text-brand-500" />
                        : <AlertCircle  className="w-4 h-4 text-red-400" />}
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <button type="button" role="checkbox" aria-checked={agreed} onClick={() => setAgreed(v=>!v)}
                  className={cn(
                    "mt-0.5 w-4 h-4 rounded-[5px] border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    agreed ? "bg-brand-600 border-brand-600" : "border-slate-300 dark:border-slate-600 group-hover:border-brand-400"
                  )}>
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  <Link href="#" className="text-brand-600 dark:text-brand-400 hover:underline">Foydalanish shartlari</Link>
                  {" "}va{" "}
                  <Link href="#" className="text-brand-600 dark:text-brand-400 hover:underline">Maxfiylik siyosati</Link>
                  ga roziman
                </span>
              </label>

              <button type="submit" disabled={isRegistering || !agreed}
                className="btn-primary w-full py-3 text-[15px]">
                {isRegistering
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Ro&apos;yxatdan o&apos;tilmoqda...</>
                  : "Ro'yxatdan o'tish"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Akkauntingiz bormi?{" "}
              <Link href="/login" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Kirish
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
