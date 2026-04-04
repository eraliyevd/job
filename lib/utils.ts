import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── Salary formatting ── */
export function formatSalary(min?: number, max?: number, negotiable?: boolean): string {
  if (negotiable || (!min && !max)) return "Kelishiladi";
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} mln` : `${Math.round(n / 1_000)} ming`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} so'm`;
  if (min)        return `${fmt(min)}+ so'm`;
  if (max)        return `${fmt(max)} so'mgacha`;
  return "Kelishiladi";
}

/* ── Time ago ── */
export function timeAgo(date: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)     return "Hozirgina";
  if (diff < 3600)   return `${Math.floor(diff / 60)} daqiqa oldin`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)} soat oldin`;
  if (diff < 172800) return "Kecha";
  return `${Math.floor(diff / 86400)} kun oldin`;
}

/* ── Constants ── */
export const WORK_TIMES = [
  { value: "full-time",   label: "To'liq stavka",  color: "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300" },
  { value: "part-time",   label: "Yarim stavka",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "remote",      label: "Masofaviy",      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { value: "shift",       label: "Smenali",        color: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  { value: "contract",    label: "Shartnomaviy",   color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "internship",  label: "Amaliyot",       color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
] as const;

export const EXPERIENCES = [
  { value: "no-exp", label: "Tajribasiz" },
  { value: "1-3",    label: "1–3 yil" },
  { value: "3-5",    label: "3–5 yil" },
  { value: "5-plus", label: "5+ yil" },
] as const;

export const UZBEKISTAN_REGIONS = [
  "Toshkent",
  "Andijon",
  "Farg'ona",
  "Namangan",
  "Samarqand",
  "Buxoro",
  "Qashqadaryo",
  "Surxondaryo",
  "Xorazm",
  "Navoiy",
  "Jizzax",
  "Sirdaryo",
  "Qoraqalpog'iston",
  "Masofaviy",
] as const;

export function getWorkTimeLabel(value: string): string {
  return WORK_TIMES.find(w => w.value === value)?.label ?? value;
}

export function getWorkTimeColor(value: string): string {
  return WORK_TIMES.find(w => w.value === value)?.color ?? "bg-slate-100 text-slate-700";
}

export function getExperienceLabel(value: string): string {
  return EXPERIENCES.find(e => e.value === value)?.label ?? value;
}

// Legacy compat
export const JOB_TYPES = WORK_TIMES.map(w => w.value);
export type JobType = typeof WORK_TIMES[number]["value"];
export type JobCategory = string;
export const JOB_TYPE_COLORS = Object.fromEntries(WORK_TIMES.map(w => [w.value, w.color]));
