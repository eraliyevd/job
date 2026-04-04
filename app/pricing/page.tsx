"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, HelpCircle, ArrowRight, Briefcase, Star, Crown, Building2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PAID_PLANS, type PlanConfig, formatPrice } from "@/lib/plans";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const FAQ = [
  { q: "To'lov qanday tekshiriladi?", a: "Admin to'lov chekingizni ko'rib chiqqach, tarifingiz avtomatik faollashadi. Odatda 1–24 soat ichida." },
  { q: "To'lovni qanday amalga oshirishim kerak?", a: "Ko'rsatilgan karta raqamiga pul o'tkazing va to'lov cheki skrinshotini yuklang." },
  { q: "Tarif tugasa nima bo'ladi?", a: "Tarif muddati tugagach, siz bepul rejaga qaytasiz. Joylashtirilgan vakansiyalar saqlanib qoladi." },
  { q: "TOP kreditlar nima?", a: "TOP kreditlar yordamida vakansiyangizni ro'yxatning yuqorisiga chiqarishingiz mumkin." },
  { q: "Pulni qaytarish mumkinmi?", a: "Tarif faollashtirilgandan so'ng pul qaytarilmaydi. Muammo bo'lsa, bizga murojaat qiling." },
  { q: "Bir vaqtda bir nechta tarif sotib olish mumkinmi?", a: "Yo'q, bir vaqtda bitta faol tarif bo'lishi mumkin." },
];

const PLAN_ICONS: Record<string, React.ReactNode> = {
  basic:    <Briefcase className="w-5 h-5" />,
  standard: <Star      className="w-5 h-5" />,
  pro:      <Zap       className="w-5 h-5" />,
  business: <Crown     className="w-5 h-5" />,
};

const ICON_COLORS: Record<string, string> = {
  basic:    "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  standard: "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400",
  pro:      "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  business: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
};

const CHECK_COLORS: Record<string, string> = {
  basic:    "text-blue-500",
  standard: "text-brand-500",
  pro:      "text-purple-500",
  business: "text-amber-500",
};

function PlanCard({ plan, isCurrentPlan }: { plan: PlanConfig; isCurrentPlan: boolean }) {
  const { user } = useAuth();

  return (
    <div className={cn(
      "card border-2 flex flex-col relative overflow-hidden",
      plan.color,
      plan.highlight && "shadow-2xl shadow-brand-500/15 dark:shadow-brand-500/10 sm:-translate-y-2",
    )}>
      {plan.badge && (
        <div className={cn(
          "absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl",
          plan.key === "standard" && "bg-brand-600 text-white",
          plan.key === "pro"      && "bg-purple-600 text-white",
          plan.key === "business" && "bg-amber-500 text-white",
          plan.key === "basic"    && "bg-blue-500 text-white",
        )}>
          {plan.badge}
        </div>
      )}

      <div className="p-5 sm:p-6 lg:p-7 flex flex-col h-full gap-5">
        <div>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", ICON_COLORS[plan.key])}>
            {PLAN_ICONS[plan.key]}
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap">
            <span className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {formatPrice(plan.price)}
            </span>
            <span className="text-sm text-slate-400">/ {plan.durationDays} kun</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Vakansiya", value: plan.jobLimit === -1 ? "∞" : String(plan.jobLimit) },
            { label: "Kunlik",    value: String(plan.durationDays) },
            { label: "TOP",       value: String(plan.topCredits) },
          ].map(s => (
            <div key={s.label} className="text-center p-2.5 rounded-xl bg-slate-50 dark:bg-dark-700">
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        <ul className="space-y-2 flex-1">
          {plan.features.map(f => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
              <Check className={cn("w-4 h-4 mt-0.5 flex-shrink-0", CHECK_COLORS[plan.key])} />
              {f}
            </li>
          ))}
        </ul>

        {isCurrentPlan ? (
          <div className="w-full py-2.5 text-center rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 text-sm font-semibold border border-brand-200 dark:border-brand-800">
            ✓ Joriy tarifingiz
          </div>
        ) : user ? (
          <Link href={`/payment/${plan.key}`}
            className={cn("w-full justify-center block text-center py-3 rounded-xl font-semibold text-sm transition-all",
              plan.highlight ? "btn-primary" : "btn-secondary")}>
            Xarid qilish <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        ) : (
          <Link href={`/login?from=/payment/${plan.key}`}
            className="w-full justify-center block text-center py-3 rounded-xl font-semibold text-sm btn-secondary">
            Kirish va xarid qilish
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const { user }   = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main>
        <section className="section-py text-center relative overflow-hidden">
          <div className="absolute inset-0 dot-grid text-slate-200 dark:text-dark-700 opacity-50 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-brand-500/8 dark:bg-brand-500/5 blur-3xl pointer-events-none" />
          <div className="container-app relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-5 border border-brand-200 dark:border-brand-800">
              <Zap className="w-3.5 h-3.5" /> Ish beruvchilar uchun
            </span>
            <h1 className="text-fluid-4xl font-display font-bold text-slate-900 dark:text-white">
              Tariflar va narxlar
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto px-4 sm:px-0">
              Biznesingiz uchun qulay tarif tanlang. To&apos;lovdan keyin 1–24 soat ichida faollashadi.
            </p>
            {user && user.plan !== "free" && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 shadow-sm">
                <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Joriy tarifingiz:{" "}
                  <span className="text-brand-600 dark:text-brand-400 capitalize">{user.plan}</span>
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="container-app pb-14 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {PAID_PLANS.map(plan => (
              <PlanCard key={plan.key} plan={plan} isCurrentPlan={user?.plan === plan.key} />
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 max-w-2xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Qanday to&apos;lanadi?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Karta raqamiga pul o&apos;tkazing → to&apos;lov cheki skrinshotini yuklang → Admin 1–24 soat ichida tasdiqlaydi → Tarifingiz avtomatik faollashadi.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-dark-800 border-y border-slate-100 dark:border-dark-700 py-12 sm:py-16">
          <div className="container-app max-w-4xl mx-auto">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Batafsil taqqoslash</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-dark-700">
                    <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">Xususiyat</th>
                    {PAID_PLANS.map(p => (
                      <th key={p.key} className={cn("text-center py-3 px-4 font-display font-bold",
                        p.highlight ? "text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-300")}>
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-dark-700/50">
                  {[
                    { label: "Narx",              values: PAID_PLANS.map(p => formatPrice(p.price)) },
                    { label: "Muddat",             values: PAID_PLANS.map(p => `${p.durationDays} kun`) },
                    { label: "Faol vakansiyalar",  values: PAID_PLANS.map(p => p.jobLimit === -1 ? "Cheksiz" : String(p.jobLimit)) },
                    { label: "TOP kreditlar",      values: PAID_PLANS.map(p => p.topCredits === 0 ? "—" : String(p.topCredits)) },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-slate-50/50 dark:hover:bg-dark-700/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{row.label}</td>
                      {row.values.map((v, i) => (
                        <td key={i} className={cn("text-center py-3 px-4",
                          PAID_PLANS[i].highlight ? "font-semibold text-brand-600 dark:text-brand-400" : "text-slate-600 dark:text-slate-400")}>
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container-app max-w-2xl mx-auto">
            <div className="flex items-center gap-2 justify-center mb-8">
              <HelpCircle className="w-5 h-5 text-brand-500" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Ko&apos;p so&apos;raladigan savollar</h2>
            </div>
            <div className="space-y-2">
              {FAQ.map((item, i) => (
                <div key={i} className="card overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 min-h-[52px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{item.q}</span>
                    <span className={cn("text-brand-600 dark:text-brand-400 text-xl font-light transition-transform duration-200 flex-shrink-0", openFaq === i && "rotate-45")}>+</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-dark-700 pt-3 leading-relaxed">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
