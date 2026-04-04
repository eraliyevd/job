"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, Info } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FormField from "@/components/ui/FormField";
import PhoneInput from "@/components/ui/PhoneInput";
import { useRequireAuth } from "@/contexts/AuthContext";
import { cn, WORK_TIMES, EXPERIENCES, UZBEKISTAN_REGIONS } from "@/lib/utils";

type FormData = {
  title:            string;
  description:      string;
  location:         string;
  phone:            string;
  workTime:         string;
  experience:       string;
  salaryMin:        string;
  salaryMax:        string;
  salaryNegotiable: boolean;
  ageMin:           string;
  ageMax:           string;
  deadline:         string;
};

const EMPTY: FormData = {
  title: "", description: "", location: "", phone: "",
  workTime: "full-time", experience: "no-exp",
  salaryMin: "", salaryMax: "", salaryNegotiable: false,
  ageMin: "", ageMax: "",
  deadline: "",
};

function validate(f: FormData): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim() || f.title.length < 3) e.title = "Sarlavha kamida 3 belgi bo'lsin";
  if (!f.description.trim() || f.description.length < 20) e.description = "Tavsif kamida 20 belgi bo'lsin";
  if (!f.location) e.location = "Manzil tanlang";
  const ph = f.phone.replace(/\D/g, "");
  if (ph.length < 9) e.phone = "To'liq telefon raqamini kiriting";
  if (!f.workTime)  e.workTime = "Ish turini tanlang";
  if (!f.salaryNegotiable && f.salaryMin && f.salaryMax && Number(f.salaryMin) > Number(f.salaryMax))
    e.salaryMax = "Maksimal maosh minimal maoshdan katta bo'lsin";
  if (f.ageMin && f.ageMax && Number(f.ageMin) > Number(f.ageMax))
    e.ageMax = "Maksimal yosh minimal yoshdan katta bo'lsin";
  return e;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 sm:p-6 space-y-4 sm:space-y-5">
      <div className="pb-3 border-b border-slate-100 dark:border-dark-700">
        <h2 className="font-display font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      className={cn("relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 focus-visible:outline-2 focus-visible:outline-brand-500",
        checked ? "bg-brand-600" : "bg-slate-200 dark:bg-dark-600")}>
      <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
        checked ? "translate-x-5" : "translate-x-0.5")} />
    </button>
  );
}

export default function PostJobPage() {
  useRequireAuth();
  const router = useRouter();

  const [form,       setForm]       = useState<FormData>(EMPTY);
  const [errors,     setErrors]     = useState<Record<string, string>>({});
  const [touched,    setTouched]    = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [apiError,   setApiError]   = useState<string | null>(null);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setTouched(t => new Set(t).add(key));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
    setApiError(null);
  }

  function err(key: string) { return touched.has(key) ? errors[key] : undefined; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(new Set(Object.keys(EMPTY)));
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    setApiError(null);

    try {
      const body = {
        title:       form.title.trim(),
        description: form.description.trim(),
        location:    form.location,
        phone:       form.phone,
        workTime:    form.workTime,
        experience:  form.experience,
        salaryNegotiable: form.salaryNegotiable,
        salaryMin: form.salaryNegotiable ? undefined : form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryNegotiable ? undefined : form.salaryMax ? Number(form.salaryMax) : undefined,
        ageMin: form.ageMin ? Number(form.ageMin) : undefined,
        ageMax: form.ageMax ? Number(form.ageMax) : undefined,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      };

      const res  = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        else setApiError(data.error ?? "Xato yuz berdi");
        return;
      }
      setDone(true);
    } catch {
      setApiError("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return (
    <>
      <Navbar />
      <main className="min-h-[calc(100dvh-8rem)] flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Vakansiya yuborildi!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Vakansiyangiz admin tekshiruviga yuborildi. Tasdiqlangandan so'ng saytda ko'rinadi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => { setDone(false); setForm(EMPTY); setTouched(new Set()); }} className="btn-secondary">
              Yana vakansiya joylash
            </button>
            <button onClick={() => router.push("/dashboard")} className="btn-primary">
              Dashboardga o'tish
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <main className="container-app py-8 sm:py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-7 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Vakansiya joylash
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Minglab ish izlovchilarga murojaat qiling
          </p>
        </div>

        {/* Admin approval notice */}
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Vakansiyangiz joylashtirilishidan oldin admin tomonidan ko'rib chiqiladi (odatda 24 soat ichida).
          </p>
        </div>

        {apiError && (
          <div className="mb-6 flex items-start gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5 sm:space-y-6">

          {/* Basic info */}
          <Section title="Asosiy ma'lumotlar">
            <FormField id="title" label="Ish nomi / Lavozim *"
              placeholder="Masalan: Oshpaz, Haydovchi, Frontend Developer"
              value={form.title} onChange={e => set("title", e.target.value)}
              onBlur={() => setTouched(t => new Set(t).add("title"))}
              error={err("title")} disabled={submitting}
              data-error={err("title") ? "" : undefined} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Manzil / Shahar *
                </label>
                <select value={form.location} onChange={e => set("location", e.target.value)}
                  className={cn("input-base", err("location") && "border-red-400")}>
                  <option value="">Shahar tanlang</option>
                  {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {err("location") && <p className="mt-1.5 text-xs text-red-500">{err("location")}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ish turi *
                </label>
                <select value={form.workTime} onChange={e => set("workTime", e.target.value)} className="input-base">
                  {WORK_TIMES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tajriba
                </label>
                <select value={form.experience} onChange={e => set("experience", e.target.value)} className="input-base">
                  {EXPERIENCES.map(ex => <option key={ex.value} value={ex.value}>{ex.label}</option>)}
                </select>
              </div>
              <FormField id="deadline" label="Oxirgi muddat (ixtiyoriy)"
                type="date" value={form.deadline}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => set("deadline", e.target.value)} />
            </div>
          </Section>

          {/* Salary */}
          <Section title="Maosh" hint="Maosh ko'rsatilgan vakansiyalar ko'proq e'tibor tortadi">
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={form.salaryNegotiable} onChange={v => set("salaryNegotiable", v)} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Maosh kelishiladi</span>
            </label>

            {!form.salaryNegotiable && (
              <div className="grid grid-cols-2 gap-4">
                <FormField id="salaryMin" label="Minimal maosh (so'm)"
                  type="number" min={0} step={50000} placeholder="1 000 000"
                  value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)} />
                <FormField id="salaryMax" label="Maksimal maosh (so'm)"
                  type="number" min={0} step={50000} placeholder="5 000 000"
                  value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)}
                  error={err("salaryMax")} />
              </div>
            )}
          </Section>

          {/* Age range */}
          <Section title="Yosh talabi" hint="Bo'sh qoldiring — ixtiyoriy">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="ageMin" label="Minimal yosh"
                type="number" min={14} max={80} placeholder="18"
                value={form.ageMin} onChange={e => set("ageMin", e.target.value)} />
              <FormField id="ageMax" label="Maksimal yosh"
                type="number" min={14} max={80} placeholder="45"
                value={form.ageMax} onChange={e => set("ageMax", e.target.value)}
                error={err("ageMax")} />
            </div>
          </Section>

          {/* Description */}
          <Section title="Tavsif *" hint="Ish vazifalarini, talablarini va imtiyozlarini yozing">
            <div data-error={err("description") ? "" : undefined}>
              <textarea rows={8} value={form.description}
                onChange={e => set("description", e.target.value)}
                onBlur={() => setTouched(t => new Set(t).add("description"))}
                placeholder={"Biz quyidagi ish o'riniga xodim qidirmoqdamiz...\n\nVazifalar:\n• ...\n\nTalablar:\n• ...\n\nImtiyozlar:\n• ..."}
                disabled={submitting}
                className={cn("input-base resize-y min-h-[200px]", err("description") && "border-red-400")} />
              {err("description") && <p className="mt-1.5 text-xs text-red-500">{err("description")}</p>}
              <p className="text-xs text-slate-400 mt-1.5 text-right">{form.description.length} belgi</p>
            </div>
          </Section>

          {/* Contact */}
          <Section title="Bog'lanish uchun telefon *">
            <PhoneInput id="phone" label="" value={form.phone}
              onChange={v => set("phone", v)}
              error={err("phone")} disabled={submitting} />
            <p className="text-xs text-slate-400">
              Bu raqam vakansiya sahifasida ko'rsatiladi. Ish izlovchilar siz bilan bog'lanadi.
            </p>
          </Section>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className={cn("btn-primary flex-1 sm:flex-none justify-center py-3 text-base", submitting && "opacity-70 cursor-not-allowed")}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Yuborilmoqda...</> : "Vakansiyani yuborish"}
            </button>
            <p className="text-xs text-slate-400 self-center">
              Yuborilgandan so&apos;ng admin tekshiruvidan o&apos;tadi
            </p>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
