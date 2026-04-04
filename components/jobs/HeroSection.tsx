"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, ArrowRight, Briefcase, Building2, Users, TrendingUp, Star, Zap, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import JobCard, { type JobCardData } from "./JobCard";
import { useI18n } from "@/lib/i18n";
import { UZBEKISTAN_REGIONS, WORK_TIMES } from "@/lib/utils";

function useJobs(sort: string, limit = 6) {
  const [jobs,    setJobs]    = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`/api/jobs?sort=${sort}&limit=${limit}`)
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort, limit]);
  return { jobs, loading };
}

function SkeletonCard() {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 skeleton rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 rounded-lg w-3/4" />
          <div className="skeleton h-3 rounded-lg w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-5 rounded-full w-20" />
        <div className="skeleton h-5 rounded-full w-24" />
      </div>
      <div className="skeleton h-px w-full rounded" />
      <div className="flex justify-between">
        <div className="skeleton h-4 rounded-lg w-24" />
        <div className="skeleton h-4 rounded-lg w-16" />
      </div>
    </div>
  );
}

const CATEGORIES = [
  { key:"it",         icon:"💻", label:"IT",         count:245 },
  { key:"design",     icon:"🎨", label:"Dizayn",     count:87 },
  { key:"marketing",  icon:"📢", label:"Marketing",  count:134 },
  { key:"finance",    icon:"💰", label:"Moliya",     count:96 },
  { key:"sales",      icon:"📊", label:"Savdo",      count:178 },
  { key:"hr",         icon:"👥", label:"HR",         count:54 },
  { key:"education",  icon:"📚", label:"Ta'lim",     count:72 },
  { key:"healthcare", icon:"🏥", label:"Sogʻliq",    count:41 },
];

export default function HeroSection() {
  const { t }   = useI18n();
  const router  = useRouter();
  const [search,   setSearch]   = useState("");
  const [location, setLocation] = useState("");

  const { jobs: featured, loading: fl } = useJobs("featured", 6);
  const { jobs: trending, loading: tl } = useJobs("trending", 4);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (search)   qs.set("search",   search);
    if (location) qs.set("location", location);
    router.push(`/jobs?${qs}`);
  }

  return (
    <>
      {/* ──────── HERO ──────── */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-slate-50/20 to-transparent dark:from-brand-950/30 dark:via-slate-900/10 dark:to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,164,114,0.12)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,164,114,0.18)_0%,transparent_70%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />

        <div className="container-app relative pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-28 lg:pb-20">
          <div className="max-w-3xl mx-auto text-center">

            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full
              bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800
              text-brand-700 dark:text-brand-300 text-xs font-semibold mb-7
              shadow-sm animate-fade-in">
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
              </span>
              O&apos;zbekistondagi #1 ish portali
              <TrendingUp className="w-3.5 h-3.5" />
            </div>

            {/* Headline */}
            <h1 className="text-fluid-hero font-display font-bold text-slate-900 dark:text-white leading-[1.1] tracking-tight animate-fade-up delay-75 animate-fill-both">
              O&apos;zbekistondagi{" "}
              <span className="relative inline-block">
                <span className="text-gradient">ish o&apos;rinlari</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8c49-7 98-7 148-3 50 4 99 4 148-3" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" />
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="100%" y2="0">
                      <stop offset="0%" stopColor="#0ea472" stopOpacity="0" />
                      <stop offset="30%" stopColor="#0ea472" />
                      <stop offset="70%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-up delay-100 animate-fill-both">
              {t("hero.subtitle")}
            </p>

            {/* Search box */}
            <form onSubmit={handleSearch}
              className="mt-8 max-w-2xl mx-auto animate-fade-up delay-150 animate-fill-both">
              <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-black/30">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="search" placeholder="Ish nomi, kasb..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
                <div className="h-px sm:h-auto sm:w-px bg-slate-200 dark:bg-slate-700 self-stretch mx-1" />
                <div className="relative sm:w-44 lg:w-52">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select value={location} onChange={e => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm outline-none text-slate-900 dark:text-slate-100 appearance-none cursor-pointer">
                    <option value="">Barcha shaharlar</option>
                    {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary rounded-xl px-6 py-2.5 whitespace-nowrap">
                  {t("hero.searchBtn")}
                </button>
              </div>
            </form>

            {/* Quick filter pills */}
            <div className="mt-5 flex flex-wrap justify-center gap-2 animate-fade-up delay-200 animate-fill-both">
              {WORK_TIMES.slice(0, 4).map(w => (
                <Link key={w.value} href={`/jobs?workTime=${w.value}`}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
                  {w.label}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-14 animate-fade-up delay-300 animate-fill-both">
              {[
                { icon: <Briefcase className="w-4 h-4" />, value: "1,200+", label: t("hero.stats.jobs") },
                { icon: <Building2 className="w-4 h-4" />, value: "350+",   label: t("hero.stats.companies") },
                { icon: <Users     className="w-4 h-4" />, value: "25K+",   label: t("hero.stats.candidates") },
              ].map(({ icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-brand-500">{icon}</span>
                  <span className="font-display font-bold text-slate-900 dark:text-white text-[15px]">{value}</span>
                  <span className="text-sm text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────── CATEGORIES ──────── */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Kategoriyalar</h2>
              <p className="text-sm text-slate-400 mt-0.5 hidden sm:block">Soha bo'yicha vakansiyalar</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group">
              Barchasi <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.key} href={`/jobs?category=${cat.key}`}
                className="flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-transparent hover:border-brand-200 dark:hover:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all group animate-fade-up animate-fill-both text-center"
                style={{ animationDelay: `${i * 40}ms` }}>
                <span className="text-xl sm:text-2xl transition-transform group-hover:scale-110">{cat.icon}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors leading-tight">{cat.label}</span>
                <span className="hidden sm:block text-[10px] text-slate-400">{cat.count} ta</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──────── TOP (Featured) JOBS ──────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Top vakansiyalar</h2>
                <p className="text-xs text-slate-400 hidden sm:block">Admin tomonidan tanlangan</p>
              </div>
            </div>
            <Link href="/jobs?sort=featured" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group">
              {t("common.seeAll")} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {fl ? [...Array(6)].map((_,i) => <SkeletonCard key={i} />)
               : featured.length > 0
                 ? featured.map(j => <JobCard key={j._id} job={j} variant="grid" />)
                 : <p className="col-span-full text-center py-10 text-slate-400 text-sm">Hozircha top vakansiyalar yo&apos;q</p>}
          </div>
        </div>
      </section>

      {/* ──────── TRENDING ──────── */}
      <section className="py-12 sm:py-16 bg-slate-50/80 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Trend vakansiyalar</h2>
                <p className="text-xs text-slate-400 hidden sm:block">Eng ko&apos;p ko&apos;rilgan</p>
              </div>
              <span className="badge bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-[10px]">Ko&apos;p ko&apos;rilgan</span>
            </div>
            <Link href="/jobs?sort=trending" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group">
              Barchasi <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {tl ? (
            <div className="space-y-3">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="card p-4 flex items-center gap-4">
                  <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2"><div className="skeleton h-4 rounded w-2/3" /><div className="skeleton h-3 rounded w-1/3" /></div>
                  <div className="skeleton h-5 rounded-full w-20" />
                </div>
              ))}
            </div>
          ) : trending.length > 0 ? (
            <div className="space-y-3">
              {trending.map(j => <JobCard key={j._id} job={j} variant="list" />)}
            </div>
          ) : (
            <p className="text-center py-10 text-slate-400 text-sm">Hozircha trend vakansiyalar yo&apos;q</p>
          )}
        </div>
      </section>

      {/* ──────── LATEST ──────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-500" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Yangi vakansiyalar</h2>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group">
              Hammasini ko&apos;rish <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {fl ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_,i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {featured.slice(0, 6).map(j => <JobCard key={j._id} job={j} variant="grid" />)}
            </div>
          )}
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(14,164,114,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 dot-grid text-white opacity-[0.03]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />

        <div className="container-app relative text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" /> Ish beruvchilar uchun
          </div>
          <h2 className="font-display text-fluid-3xl font-bold text-white leading-tight mb-4">
            Vakansiya joylashtiring
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
            25,000+ ish izlovchilarga murojaat qiling. Admin tasdiqlashidan keyin e&apos;lon qilinadi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/post-job"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-brand-50 transition-colors shadow-xl">
              Vakansiya joylash <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/jobs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/8 hover:bg-white/12 text-white font-semibold text-sm transition-colors border border-white/10">
              Vakansiyalarni ko&apos;rish
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
