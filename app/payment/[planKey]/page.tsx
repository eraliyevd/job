"use client";

import { use, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CreditCard, Copy, CheckCircle2, Upload, X, AlertCircle,
  Loader2, ArrowLeft, Clock, Shield, Check, ImageIcon,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRequireAuth } from "@/contexts/AuthContext";
import { PLANS, PAYMENT_CARD, formatPrice, type PlanKey } from "@/lib/plans";
import { cn } from "@/lib/utils";

/* ── Step indicator ── */
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Reja tanlash" },
    { n: 2, label: "To'lov qilish" },
    { n: 3, label: "Chek yuklash" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-8 sm:mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className={cn(
            "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            s.n < current  && "text-brand-600 dark:text-brand-400",
            s.n === current && "bg-brand-600 text-white shadow-brand",
            s.n > current  && "text-slate-400 dark:text-slate-500",
          )}>
            <span className={cn(
              "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold",
              s.n < current  && "bg-brand-600 text-white",
              s.n === current && "bg-white text-brand-600",
              s.n > current  && "bg-slate-200 dark:bg-dark-600 text-slate-500",
            )}>
              {s.n < current ? <Check className="w-3 h-3" /> : s.n}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn("w-8 sm:w-12 h-px mx-1", s.n < current ? "bg-brand-400" : "bg-slate-200 dark:bg-dark-600")} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Copy button ── */
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={copy} className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
      copied ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
             : "bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-dark-600"
    )}>
      {copied ? <><Check className="w-3.5 h-3.5" /> Nusxalandi</> : <><Copy className="w-3.5 h-3.5" /> {label}</>}
    </button>
  );
}

/* ── Screenshot drop zone ── */
function ScreenshotUpload({
  onSelect,
  file,
  onClear,
  error,
  disabled,
}: {
  onSelect: (dataUri: string, name: string) => void;
  file:     { name: string; preview: string } | null;
  onClear:  () => void;
  error?:   string;
  disabled: boolean;
}) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    if (f.size > 2 * 1024 * 1024) {
      alert("Fayl hajmi 2 MB dan oshmasligi kerak");
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      const dataUri = e.target?.result as string;
      onSelect(dataUri, f.name);
    };
    reader.readAsDataURL(f);
  }, [onSelect]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  if (file) {
    return (
      <div className="relative rounded-2xl overflow-hidden border-2 border-brand-400 dark:border-brand-600">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={file.preview} alt="Screenshot" className="w-full max-h-64 object-contain bg-slate-900" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 flex items-center justify-between">
          <span className="text-white text-xs font-medium truncate max-w-[60%]">{file.name}</span>
          <button onClick={onClear} disabled={disabled}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        <div className="absolute top-2 right-2">
          <span className="badge bg-brand-600 text-white text-[10px]">
            <Check className="w-3 h-3" /> Yuklandi
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all",
          dragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20"
            : error
              ? "border-red-400 bg-red-50 dark:bg-red-900/10"
              : "border-slate-300 dark:border-dark-600 hover:border-brand-400 dark:hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center",
          error ? "bg-red-100 dark:bg-red-900/30" : "bg-slate-100 dark:bg-dark-700"
        )}>
          <ImageIcon className={cn("w-7 h-7", error ? "text-red-400" : "text-slate-400")} />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
            {dragging ? "Qo'yib yuboring" : "To'lov chekini yuklang"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            JPEG, PNG yoki WebP · Maks. 2 MB
          </p>
          <p className="text-xs text-slate-400">
            Bosing yoki faylni bu yerga tashlang
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-xl text-white text-xs font-semibold transition-colors">
          <Upload className="w-3.5 h-3.5" /> Fayl tanlash
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
    </div>
  );
}

/* ================================================================== */
/*  Main page                                                           */
/* ================================================================== */
export default function PaymentPage({ params }: { params: Promise<{ planKey: string }> }) {
  const { planKey } = use(params);
  const router = useRouter();
  useRequireAuth();

  const plan = PLANS[planKey as PlanKey];

  // If invalid plan key, redirect
  if (!plan || plan.key === "free") {
    if (typeof window !== "undefined") router.replace("/pricing");
    return null;
  }

  const [step,         setStep]         = useState<1 | 2 | 3>(1);
  const [paymentId,    setPaymentId]    = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<{ name: string; preview: string; dataUri: string } | null>(null);
  const [screenshotErr,  setScreenshotErr]  = useState<string | null>(null);
  const [submitting,   setSubmitting]   = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);
  const [done,         setDone]         = useState(false);

  /* Step 1 → 2: create payment record */
  async function handleIPaid() {
    setSubmitting(true);
    setApiError(null);
    try {
      const res  = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: plan.key }),
      });
      const data = await res.json();

      if (!res.ok) {
        // 409 = already pending
        if (res.status === 409 && data.paymentId) {
          setPaymentId(data.paymentId);
          setStep(3);
          return;
        }
        setApiError(data.error ?? "Xato yuz berdi");
        return;
      }
      setPaymentId(data.paymentId);
      setStep(3);
    } catch {
      setApiError("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  }

  /* Step 3: upload screenshot */
  async function handleUploadScreenshot() {
    if (!screenshotFile) {
      setScreenshotErr("Iltimos, to'lov chekini yuklang");
      return;
    }
    if (!paymentId) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const res  = await fetch(`/api/payments/${paymentId}/screenshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          dataUri:  screenshotFile.dataUri,
          fileName: screenshotFile.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error ?? "Xato"); return; }
      setDone(true);
    } catch {
      setApiError("Tarmoq xatosi");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success screen ── */
  if (done) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-4 py-12">
          <div className="text-center max-w-md w-full">
            <div className="w-20 h-20 rounded-3xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/20">
              <CheckCircle2 className="w-10 h-10 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              To&apos;lov yuborildi!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
              Chekingiz qabul qilindi. Admin tekshiruvidan so&apos;ng{" "}
              <span className="font-semibold text-brand-600 dark:text-brand-400">{plan.name}</span> tarifi faollashtiriladi.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-8">
              <Clock className="w-4 h-4" />
              Odatda 1–24 soat ichida tasdiqlangani
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="btn-primary">Dashboardga o'tish</Link>
              <Link href="/jobs"      className="btn-secondary">Vakansiyalarni ko'rish</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container-app py-8 sm:py-10 max-w-2xl mx-auto">

        {/* Back */}
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Narxlarga qaytish
        </Link>

        {/* Step indicator */}
        <Steps current={step} />

        {/* ── Step 1 & 2: Plan summary + card info ── */}
        {(step === 1 || step === 2) && (
          <div className="space-y-5">

            {/* Plan summary card */}
            <div className={cn(
              "card p-5 sm:p-6 border-2",
              plan.color
            )}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h2>
                    {plan.badge && (
                      <span className="badge bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs">{plan.badge}</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {plan.durationDays} kun amal qiladi
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-2xl sm:text-3xl font-bold text-brand-600 dark:text-brand-400">
                    {formatPrice(plan.price)}
                  </p>
                </div>
              </div>

              {/* Features grid */}
              <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment card info */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200">
                  Karta ma&apos;lumotlari
                </h3>
              </div>

              {/* Card visual */}
              <div className="relative rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-dark-600 dark:to-dark-800 text-white overflow-hidden mb-5">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand-600/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-brand-400/10 blur-2xl" />

                <div className="relative">
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-1">{PAYMENT_CARD.bank}</p>
                  <p className="font-mono text-xl sm:text-2xl tracking-[0.15em] font-bold mb-4">
                    {PAYMENT_CARD.number}
                  </p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Karta egasi</p>
                      <p className="font-semibold text-sm">{PAYMENT_CARD.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Miqdor</p>
                      <p className="font-bold text-lg text-brand-300">{formatPrice(plan.price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <CopyButton text={PAYMENT_CARD.number.replace(/\s/g, "")} label="Karta raqami" />
                <CopyButton text={String(plan.price)} label="Summani" />
              </div>

              {/* Note */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {PAYMENT_CARD.note}
                </p>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2.5 text-xs text-slate-400 justify-center">
              <Shield className="w-4 h-4 text-brand-500 flex-shrink-0" />
              To&apos;lovingiz xavfsiz. Tasdiqlangach reja avtomatik faollashadi.
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {apiError}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleIPaid}
              disabled={submitting}
              className="btn-primary w-full py-4 text-base justify-center gap-2"
            >
              {submitting
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Tekshirilmoqda...</>
                : <><Check className="w-5 h-5" /> To&apos;lovni amalga oshirdim</>}
            </button>
          </div>
        )}

        {/* ── Step 3: Upload screenshot ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="card p-5 sm:p-6">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white mb-2">
                To&apos;lov chekini yuklang
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                To&apos;lov ekranini yoki bank ilovasidan chek skrinshotini yuklang.
                Admin ko&apos;rib chiqqach, tarifingiz faollashadi.
              </p>

              <ScreenshotUpload
                file={screenshotFile ? { name: screenshotFile.name, preview: screenshotFile.preview } : null}
                onSelect={(dataUri, name) => {
                  setScreenshotFile({ dataUri, name, preview: dataUri });
                  setScreenshotErr(null);
                }}
                onClear={() => setScreenshotFile(null)}
                error={screenshotErr ?? undefined}
                disabled={submitting}
              />
            </div>

            {apiError && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {apiError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleUploadScreenshot}
                disabled={submitting || !screenshotFile}
                className={cn(
                  "btn-primary flex-1 py-3 text-base justify-center gap-2",
                  (!screenshotFile || submitting) && "opacity-60 cursor-not-allowed"
                )}
              >
                {submitting
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</>
                  : <><Upload className="w-5 h-5" /> Chekni yuborish</>}
              </button>
              <Link href="/dashboard" className="btn-secondary flex-1 sm:flex-none justify-center py-3">
                Keyinroq yuboraman
              </Link>
            </div>

            <p className="text-xs text-center text-slate-400">
              Chekni keyinroq ham yuborishingiz mumkin. To&apos;lov ID:{" "}
              <span className="font-mono">{paymentId?.slice(-8)}</span>
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
