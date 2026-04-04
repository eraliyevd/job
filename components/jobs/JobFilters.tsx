"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn, WORK_TIMES, EXPERIENCES, UZBEKISTAN_REGIONS } from "@/lib/utils";

export interface FiltersState {
  search:     string;
  location:   string;
  workTime:   string;
  experience: string;
  salaryMin:  string;
  salaryMax:  string;
  ageMin:     string;
  ageMax:     string;
  sort:       string;
}

export const DEFAULT_FILTERS: FiltersState = {
  search: "", location: "", workTime: "", experience: "",
  salaryMin: "", salaryMax: "", ageMin: "", ageMax: "", sort: "newest",
};

interface Props {
  filters:    FiltersState;
  onChange:   (f: FiltersState) => void;
  className?: string;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 py-0.5 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
        {title}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button onClick={onChange} className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
      checked ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700"
    )}>
      <span className={cn("w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
        checked ? "border-brand-600 bg-brand-600" : "border-slate-300 dark:border-dark-500"
      )}>
        {checked && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

export default function JobFilters({ filters, onChange, className }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const set = useCallback((key: keyof FiltersState, val: string) =>
    onChange({ ...filters, [key]: val }), [filters, onChange]);

  const activeCount = [
    filters.location, filters.workTime, filters.experience,
    filters.salaryMin, filters.salaryMax, filters.ageMin, filters.ageMax,
  ].filter(Boolean).length;

  const reset = () => onChange({ ...DEFAULT_FILTERS, search: filters.search, sort: filters.sort });

  const body = (
    <div className="space-y-5">
      {/* Work type */}
      <Section title="Ish turi">
        <Radio checked={!filters.workTime} onChange={() => set("workTime", "")} label="Barchasi" />
        {WORK_TIMES.map(w => (
          <Radio key={w.value} checked={filters.workTime === w.value}
            onChange={() => set("workTime", w.value)} label={w.label} />
        ))}
      </Section>
      <div className="divider" />

      {/* Location */}
      <Section title="Shahar / Viloyat">
        <select value={filters.location} onChange={e => set("location", e.target.value)} className="input-base text-sm">
          <option value="">Barcha hududlar</option>
          {UZBEKISTAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </Section>
      <div className="divider" />

      {/* Experience */}
      <Section title="Tajriba" defaultOpen={false}>
        <Radio checked={!filters.experience} onChange={() => set("experience", "")} label="Barchasi" />
        {EXPERIENCES.map(e => (
          <Radio key={e.value} checked={filters.experience === e.value}
            onChange={() => set("experience", e.value)} label={e.label} />
        ))}
      </Section>
      <div className="divider" />

      {/* Salary */}
      <Section title="Maosh (so'm)" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Dan</label>
            <input type="number" min={0} step={100000} placeholder="500 000" value={filters.salaryMin}
              onChange={e => set("salaryMin", e.target.value)} className="input-base text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Gacha</label>
            <input type="number" min={0} step={100000} placeholder="5 000 000" value={filters.salaryMax}
              onChange={e => set("salaryMax", e.target.value)} className="input-base text-sm py-2" />
          </div>
        </div>
      </Section>
      <div className="divider" />

      {/* Age */}
      <Section title="Yosh" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Dan</label>
            <input type="number" min={14} max={80} placeholder="18" value={filters.ageMin}
              onChange={e => set("ageMin", e.target.value)} className="input-base text-sm py-2" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Gacha</label>
            <input type="number" min={14} max={80} placeholder="45" value={filters.ageMax}
              onChange={e => set("ageMax", e.target.value)} className="input-base text-sm py-2" />
          </div>
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:block flex-shrink-0", className)} style={{ width: "var(--sidebar-w, 272px)" }}>
        <div className="card-static border border-slate-100 dark:border-dark-700 rounded-2xl overflow-hidden sticky top-[calc(var(--nav-h,4rem)+1rem)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-700">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-sm">Filtrlar</h3>
              {activeCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">{activeCount}</span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Tozalash
              </button>
            )}
          </div>
          <div className="p-5">{body}</div>
        </div>
      </aside>

      {/* Tablet chip bar */}
      <div className="hidden md:flex lg:hidden items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {["", ...WORK_TIMES.map(w => w.value)].map(wt => (
            <button key={wt || "all"} onClick={() => set("workTime", wt)}
              className={cn("badge whitespace-nowrap transition-all cursor-pointer border",
                filters.workTime === wt ? "bg-brand-600 text-white border-brand-600"
                : "bg-white dark:bg-dark-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-dark-600 hover:border-brand-400"
              )}>
              {wt ? WORK_TIMES.find(w => w.value === wt)?.label : "Barchasi"}
            </button>
          ))}
        </div>
        <button onClick={() => setSheetOpen(true)}
          className={cn("btn-secondary text-xs gap-1.5 px-3 min-h-[32px] flex-shrink-0", activeCount > 1 && "border-brand-400 text-brand-600 dark:text-brand-400")}>
          <SlidersHorizontal className="w-3.5 h-3.5" /> Ko'proq
          {activeCount > 1 && <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] flex items-center justify-center">{activeCount}</span>}
        </button>
      </div>

      {/* Mobile trigger */}
      <div className="flex md:hidden items-center gap-2">
        <button onClick={() => setSheetOpen(true)}
          className={cn("btn-secondary gap-2", activeCount > 0 && "border-brand-400 text-brand-600 dark:text-brand-400")}>
          <SlidersHorizontal className="w-4 h-4" /> Filtrlar
          {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">{activeCount}</span>}
        </button>
        {filters.workTime && (
          <button onClick={() => set("workTime", "")} className="badge bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 gap-1 cursor-pointer">
            {WORK_TIMES.find(w => w.value === filters.workTime)?.label}
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setSheetOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dark-800 rounded-t-3xl shadow-2xl max-h-[90dvh] flex flex-col">
            <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-slate-100 dark:border-dark-700">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-dark-600 mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200">
                  Filtrlar {activeCount > 0 && <span className="ml-2 badge bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs">{activeCount} ta faol</span>}
                </h3>
                <button onClick={() => setSheetOpen(false)} className="touch-target btn-ghost rounded-lg p-0"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{body}</div>
            <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-dark-700 flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1">Tozalash</button>
              <button onClick={() => setSheetOpen(false)} className="btn-primary flex-1">Qo'llash</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
