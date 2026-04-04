"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import PhoneInput from "@/components/ui/PhoneInput";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

function validate(phone: string, password: string) {
  const errors: Record<string, string> = {};
  if (phone.replace(/\D/g, "").length < 9) errors.phone    = "To'liq telefon raqamini kiriting";
  if (!password)                            errors.password = "Parol kiritilishi shart";
  return errors;
}

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn, user, isLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [touched,     setTouched]     = useState({ phone: false, password: false });
  const [apiError,    setApiError]    = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const from = searchParams.get("from") ?? "/";

  useEffect(() => {
    if (!isLoading && user) router.replace(from);
  }, [user, isLoading, router, from]);

  const clientErr = (touched.phone || touched.password) ? validate(phone, password) : {};
  const allErr    = { ...clientErr, ...fieldErrors };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});
    setTouched({ phone: true, password: true });
    if (Object.keys(validate(phone, password)).length > 0) return;

    const result = await login(phone, password);
    if (!result.ok) {
      if (result.fields) setFieldErrors(result.fields);
      else {
        setApiError(result.error ?? "Xato yuz berdi");
        toastError(result.error ?? "Kirish muvaffaqiyatsiz");
      }
      return;
    }
    toastSuccess("Tizimga kirdingiz!");
    router.push(from);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-60px)] flex items-center justify-center px-4 py-12 bg-mesh">
        <div className="w-full max-w-[400px] animate-fade-up">
          {/* Back */}
          {from !== "/" && (
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors group">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              Bosh sahifaga qaytish
            </Link>
          )}

          <div className="card-elevated p-7 sm:p-8">
            {/* Header */}
            <div className="mb-7">
              <div className="w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand mb-4">
                <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Kirish</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Vakansiya joylash uchun tizimga kiring
              </p>
            </div>

            {/* Error */}
            {apiError && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-5 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Phone */}
              <PhoneInput
                id="phone" name="phone" label="Telefon raqami"
                value={phone}
                onChange={v => { setPhone(v); setTouched(t => ({ ...t, phone: true })); setFieldErrors(f => { const n={...f}; delete n.phone; return n; }); setApiError(null); }}
                error={touched.phone ? allErr.phone : undefined}
                disabled={isLoggingIn}
                autoFocus
              />

              {/* Password */}
              <PasswordField
                id="password" label="Parol"
                value={password} show={showPwd}
                onToggle={() => setShowPwd(v => !v)}
                onChange={v => { setPassword(v); setTouched(t => ({ ...t, password: true })); setFieldErrors(f => { const n={...f}; delete n.password; return n; }); setApiError(null); }}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                error={touched.password ? allErr.password : undefined}
                disabled={isLoggingIn}
                autoComplete="current-password"
              />

              {/* Forgot */}
              <div className="flex justify-end">
                <Link href="#" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  Parolni unutdingizmi?
                </Link>
              </div>

              <button type="submit" disabled={isLoggingIn} className="btn-primary w-full py-3 text-[15px]">
                {isLoggingIn
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Tekshirilmoqda...</>
                  : "Kirish"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Akkauntingiz yo&apos;qmi?{" "}
              <Link href="/register" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                Ro&apos;yxatdan o&apos;tish
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function PasswordField({
  id, label, value, show, onToggle, onChange, onBlur, error, disabled, autoComplete,
}: {
  id: string; label: string; value: string; show: boolean;
  onToggle: () => void; onChange: (v: string) => void;
  onBlur?: () => void; error?: string; disabled?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <div className={cn(
        "relative flex items-center rounded-[var(--radius-md)] border transition-all duration-200",
        "bg-white dark:bg-slate-800/60",
        error ? "border-red-400 dark:border-red-600 shadow-[0_0_0_3px_rgb(239_68_68/.12)]"
              : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus-within:border-brand-500 dark:focus-within:border-brand-400 focus-within:shadow-[0_0_0_3px_rgb(14_164_114/.12)]"
      )}>
        <input id={id} type={show ? "text" : "password"} value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none min-h-[42px]"
        />
        <button type="button" onClick={onToggle}
          className="px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
