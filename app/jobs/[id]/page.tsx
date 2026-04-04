"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin, Phone, Clock, Calendar, Briefcase,
  Share2, Bookmark, BookmarkCheck, ArrowLeft,
  Eye, CheckCircle2, AlertCircle, Loader2, Users,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard, { type JobCardData } from "@/components/jobs/JobCard";
import { cn, formatSalary, getWorkTimeColor, getWorkTimeLabel, getExperienceLabel, timeAgo } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface FullJob extends JobCardData {
  description: string;
  phone:       string;
  ageMin?:     number;
  ageMax?:     number;
  deadline?:   string;
  status:      string;
  postedBy:    { name: string; phone: string };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params);
  const { user } = useAuth();
  const [job,      setJob]      = useState<FullJob | null>(null);
  const [related,  setRelated]  = useState<JobCardData[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [saved,    setSaved]    = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [copied,    setCopied]   = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return; }
        setJob(d.job);
        setSaved(d.job.isSaved ?? false);
        // fetch related
        return fetch(`/api/jobs?workTime=${d.job.workTime}&limit=3`)
          .then(r => r.json())
          .then(rd => setRelated((rd.jobs ?? []).filter((j: JobCardData) => j._id !== id).slice(0, 2)));
      })
      .catch(() => setError("Vakansiya yuklanmadi"))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleSave() {
    if (!user) { window.location.href = "/login"; return; }
    setSaveLoading(true);
    try {
      const res  = await fetch(`/api/jobs/${id}/save`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) setSaved(data.saved);
    } finally {
      setSaveLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
      <Footer />
    </>
  );

  if (error || !job) return (
    <>
      <Navbar />
      <div className="container-app py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{error ?? "Topilmadi"}</h2>
        <Link href="/jobs" className="btn-primary mt-6 inline-flex">Orqaga qaytish</Link>
      </div>
      <Footer />
    </>
  );

  const typeColor  = getWorkTimeColor(job.workTime);
  const daysLeft   = job.deadline ? Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000) : null;
  const isExpired  = daysLeft !== null && daysLeft < 0;

  return (
    <>
      <Navbar />
      <main className="container-app py-6 sm:py-8 lg:py-10">

        {/* Back */}
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Barcha vakansiyalar
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header */}
            <div className="card p-5 sm:p-6">
              {/* Title row */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/20 flex items-center justify-center text-2xl flex-shrink-0 border border-brand-100 dark:border-brand-900/30">
                  💼
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <h1 className="font-display text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                      {job.title}
                    </h1>
                    {job.featured && (
                      <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs flex-shrink-0">⭐ Top</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{job.postedBy?.name}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={cn("badge", typeColor)}>{getWorkTimeLabel(job.workTime)}</span>
                <span className="badge bg-slate-100 dark:bg-dark-700 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3 h-3" />{job.location}
                </span>
                <span className="badge bg-slate-100 dark:bg-dark-700 text-slate-500">
                  <Briefcase className="w-3 h-3" />{getExperienceLabel(job.experience)}
                </span>
                {(job.ageMin || job.ageMax) && (
                  <span className="badge bg-slate-100 dark:bg-dark-700 text-slate-500">
                    <Users className="w-3 h-3" />
                    {job.ageMin && job.ageMax ? `${job.ageMin}–${job.ageMax} yosh` : job.ageMin ? `${job.ageMin}+ yosh` : `${job.ageMax} yoshgacha`}
                  </span>
                )}
                <span className="badge bg-slate-100 dark:bg-dark-700 text-slate-400">
                  <Eye className="w-3 h-3" />{job.views} ko'rishlar
                </span>
                <span className="badge bg-slate-100 dark:bg-dark-700 text-slate-400">
                  <Clock className="w-3 h-3" />{timeAgo(job.createdAt)}
                </span>
              </div>

              {/* Salary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/30 mb-5">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Maosh</p>
                  <p className="font-display text-lg sm:text-xl font-bold text-brand-600 dark:text-brand-400">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                    {!job.salaryNegotiable && <span className="text-sm font-normal text-slate-400 ml-1">/oy</span>}
                  </p>
                </div>
                {daysLeft !== null && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Muddat</p>
                    <p className={cn("text-sm font-semibold", isExpired ? "text-red-500" : "text-slate-700 dark:text-slate-300")}>
                      {isExpired ? "Muddati o'tgan" : `${daysLeft} kun qoldi`}
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile CTA */}
              <div className="flex gap-2 lg:hidden">
                <button
                  onClick={() => setShowPhone(v => !v)}
                  className="btn-primary flex-1 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  {showPhone ? job.phone : "Telefon ko'rish"}
                </button>
                <button onClick={toggleSave} disabled={saveLoading}
                  className={cn("btn-secondary px-3", saved && "border-brand-400 text-brand-600 dark:text-brand-400")}>
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                    : saved ? <BookmarkCheck className="w-4 h-4" />
                    : <Bookmark className="w-4 h-4" />}
                </button>
                <button onClick={copyLink} className="btn-secondary px-3">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-brand-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="card p-5 sm:p-6">
              <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Vakansiya haqida
              </h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Contact */}
            <div className="card p-5 sm:p-6">
              <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Bog'lanish
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Ish beruvchi</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{job.postedBy?.name}</p>
                </div>
                <div className="ml-auto">
                  <button onClick={() => setShowPhone(v => !v)} className={cn("btn-primary gap-2", showPhone && "btn-secondary")}>
                    <Phone className="w-4 h-4" />
                    {showPhone ? job.phone : "Raqamni ko'rish"}
                  </button>
                </div>
              </div>
            </div>

            {/* Related jobs */}
            {related.length > 0 && (
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  O'xshash vakansiyalar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {related.map(j => <JobCard key={j._id} job={j} variant="grid" />)}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="hidden lg:block">
            <div className="card p-5 sticky top-[calc(var(--nav-h,4rem)+1rem)] space-y-5">
              {/* Salary */}
              <div className="text-center py-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-900/30">
                <p className="text-xs text-slate-500 mb-1">Maosh</p>
                <p className="font-display text-xl font-bold text-brand-600 dark:text-brand-400">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                </p>
                {!job.salaryNegotiable && <p className="text-xs text-slate-400">/oy</p>}
              </div>

              {/* Quick info */}
              <div className="space-y-3 text-sm">
                {[
                  { icon: <Briefcase className="w-4 h-4" />, label: "Ish turi",  value: getWorkTimeLabel(job.workTime) },
                  { icon: <MapPin    className="w-4 h-4" />, label: "Manzil",    value: job.location },
                  { icon: <Users     className="w-4 h-4" />, label: "Tajriba",   value: getExperienceLabel(job.experience) },
                  ...(job.ageMin || job.ageMax ? [{ icon: <Users className="w-4 h-4" />, label: "Yosh",
                    value: job.ageMin && job.ageMax ? `${job.ageMin}–${job.ageMax} yosh` : job.ageMin ? `${job.ageMin}+ yosh` : `${job.ageMax} yoshgacha` }] : []),
                  ...(daysLeft !== null ? [{ icon: <Calendar className="w-4 h-4" />, label: "Muddat",
                    value: isExpired ? "Muddati o'tgan" : `${daysLeft} kun qoldi` }] : []),
                  { icon: <Eye  className="w-4 h-4" />,   label: "Ko'rishlar", value: String(job.views) },
                  { icon: <Clock className="w-4 h-4" />,  label: "Joylashtirildi", value: timeAgo(job.createdAt) },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="text-brand-500 flex-shrink-0">{icon}</span>
                    <span className="text-slate-400 flex-shrink-0 text-xs">{label}:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-xs truncate">{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-1">
                {/* Phone reveal */}
                <button onClick={() => setShowPhone(v => !v)} className="btn-primary w-full gap-2">
                  <Phone className="w-4 h-4" />
                  {showPhone ? job.phone : "Telefon raqamini ko'rish"}
                </button>

                {/* Save */}
                <button onClick={toggleSave} disabled={saveLoading}
                  className={cn("btn-secondary w-full gap-2", saved && "border-brand-400 text-brand-600 dark:text-brand-400")}>
                  {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" />
                    : saved ? <><BookmarkCheck className="w-4 h-4" /> Saqlangan</>
                    : <><Bookmark className="w-4 h-4" /> Saqlash</>}
                </button>

                {/* Share */}
                <button onClick={copyLink} className="btn-secondary w-full gap-2">
                  {copied ? <><CheckCircle2 className="w-4 h-4 text-brand-600" /> Nusxalandi!</>
                          : <><Share2 className="w-4 h-4" /> Ulashish</>}
                </button>
              </div>

              {/* Report */}
              <div className="text-center pt-1">
                <button className="text-xs text-slate-400 hover:text-red-500 transition-colors">
                  Shikoyat qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
