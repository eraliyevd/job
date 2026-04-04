"use client";

import Link from "next/link";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const year  = new Date().getFullYear();

  const cols = [
    {
      title: t("footer.forCandidates"),
      links: [
        { href: "/jobs",   label: t("footer.links.browseJobs") },
        { href: "#",       label: t("footer.links.savedJobs") },
        { href: "#",       label: t("footer.links.careerAdvice") },
      ],
    },
    {
      title: t("footer.forEmployers"),
      links: [
        { href: "/post-job", label: t("footer.links.postJob") },
        { href: "/pricing",  label: t("footer.links.pricingPlans") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "#", label: t("footer.links.about") },
        { href: "#", label: t("footer.links.contact") },
        { href: "#", label: t("footer.links.privacy") },
        { href: "#", label: t("footer.links.terms") },
      ],
    },
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-auto">
      <div className="container-app py-12 sm:py-16">

        {/* Main grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-[17px] text-slate-900 dark:text-white mb-4 w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand flex-shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              Ish<span className="text-brand-600">Bor</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[220px]">
              {t("footer.tagline")}
            </p>
            {/* Social */}
            <div className="flex items-center gap-2 mt-5">
              {["Telegram", "Instagram"].map(s => (
                <a key={s} href={`#${s.toLowerCase()}`}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors group">
                  {s}
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {year} IshBor. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-4">
            {[t("footer.links.privacy"), t("footer.links.terms")].map(l => (
              <Link key={l} href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
