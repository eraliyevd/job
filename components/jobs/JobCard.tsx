"use client";

import Link from "next/link";
import { MapPin, Clock, Bookmark, BookmarkCheck, Eye, ArrowUpRight } from "lucide-react";
import { cn, formatSalary, getWorkTimeColor, getWorkTimeLabel, getExperienceLabel, timeAgo } from "@/lib/utils";
import { useState } from "react";

export interface JobCardData {
  _id:              string;
  title:            string;
  location:         string;
  workTime:         string;
  experience:       string;
  salaryMin?:       number;
  salaryMax?:       number;
  salaryNegotiable: boolean;
  ageMin?:          number;
  ageMax?:          number;
  featured:         boolean;
  views:            number;
  status?:          string;
  createdAt:        string;
  postedBy?:        { name: string; phone: string };
  isSaved?:         boolean;
}

interface JobCardProps {
  job:            JobCardData;
  variant?:       "grid" | "list";
  onSaveToggle?:  (id: string, saved: boolean) => void;
  className?:     string;
}

const CATEGORY_ICONS: Record<string, string> = {
  it: "💻", finance: "💰", marketing: "📢", design: "🎨",
  sales: "📊", hr: "👥", education: "📚", healthcare: "🏥",
};

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function JobCard({ job, variant = "grid", onSaveToggle, className }: JobCardProps) {
  const [saved,    setSaved]    = useState(job.isSaved ?? false);
  const [savingLocal, setSavingLocal] = useState(false);
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable);

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSavingLocal(true);
    try {
      const res  = await fetch(`/api/jobs/${job._id}/save`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setSaved(data.saved);
        onSaveToggle?.(job._id, data.saved);
      }
    } finally { setSavingLocal(false); }
  }

  if (variant === "list") {
    return (
      <article className={cn("card group overflow-hidden", job.featured && "ring-1 ring-amber-300/50 dark:ring-amber-600/30", className)}>
        <Link href={`/jobs/${job._id}`}
          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-sm sm:text-base leading-tight">
                {job.title}
              </h3>
              {job.featured && (
                <span className="badge bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] shadow-sm">⭐ Top</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={cn("badge", getWorkTimeColor(job.workTime))}>{getWorkTimeLabel(job.workTime)}</span>
              <span className="badge bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400">
                <MapPin className="w-3 h-3" />{job.location}
              </span>
              <span className="badge bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-500 text-[10px]">
                {getExperienceLabel(job.experience)}
              </span>
            </div>
          </div>
          {/* Right */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-1.5 flex-shrink-0">
            <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">{salary}</span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(job.createdAt)}</span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  /* Grid variant */
  return (
    <article className={cn(
      "card group relative flex flex-col overflow-hidden",
      job.featured && "ring-1 ring-amber-300/50 dark:ring-amber-600/30",
      className
    )}>
      {/* Featured ribbon */}
      {job.featured && (
        <div className="absolute top-0 right-0 overflow-hidden w-16 h-16 pointer-events-none z-10">
          <div className="absolute top-3.5 -right-4 w-16 bg-gradient-to-r from-amber-400 to-orange-400 text-[9px] font-bold uppercase text-white rotate-45 py-0.5 text-center shadow-sm">
            TOP
          </div>
        </div>
      )}

      <Link href={`/jobs/${job._id}`} className="flex flex-col gap-4 p-5 flex-1 group/link">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/40 dark:to-brand-800/20 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-100 dark:border-brand-900/30 flex-shrink-0">
            {getInitials(job.postedBy?.name)}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-sm sm:text-[15px] text-slate-900 dark:text-white group-hover/link:text-brand-600 dark:group-hover/link:text-brand-400 transition-colors line-clamp-2 leading-snug">
              {job.title}
            </h3>
            {job.postedBy && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{job.postedBy.name}</p>
            )}
          </div>

          {/* Save button */}
          <button onClick={handleSave} disabled={savingLocal} aria-label={saved ? "Saqlangan" : "Saqlash"}
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
              saved
                ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30"
                : "text-slate-300 dark:text-slate-600 hover:text-brand-500 dark:hover:text-brand-400 sm:opacity-0 sm:group-hover:opacity-100",
              savingLocal && "opacity-50"
            )}>
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className={cn("badge", getWorkTimeColor(job.workTime))}>{getWorkTimeLabel(job.workTime)}</span>
          <span className="badge bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[80px]">{job.location}</span>
          </span>
          {(job.ageMin || job.ageMax) && (
            <span className="badge bg-slate-100 dark:bg-slate-700/80 text-slate-500 dark:text-slate-500">
              {job.ageMin && job.ageMax ? `${job.ageMin}–${job.ageMax} yosh`
               : job.ageMin ? `${job.ageMin}+`
               : `${job.ageMax} yoshgacha`}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{salary}</span>
            {!job.salaryNegotiable && <span className="text-xs text-slate-400 ml-1">/oy</span>}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{job.views}</span>
            <span className="flex items-center gap-1 group-hover/link:text-brand-500 transition-colors">
              {timeAgo(job.createdAt)}
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
