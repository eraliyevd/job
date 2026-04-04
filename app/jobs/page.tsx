"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, LayoutGrid, List, TrendingUp, Star } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JobCard, { type JobCardData } from "@/components/jobs/JobCard";
import JobFilters, { type FiltersState, DEFAULT_FILTERS } from "@/components/jobs/JobFilters";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";
type SortTab  = "newest" | "trending" | "featured";

export default function JobsPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [filters,   setFilters]   = useState<FiltersState>({
    ...DEFAULT_FILTERS,
    search:   searchParams.get("search")   ?? "",
    location: searchParams.get("location") ?? "",
    workTime: searchParams.get("workTime") ?? "",
  });
  const [sort,      setSort]      = useState<SortTab>("newest");
  const [viewMode,  setViewMode]  = useState<ViewMode>("grid");
  const [jobs,      setJobs]      = useState<JobCardData[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);
  const [loading,   setLoading]   = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchJobs = useCallback(async (pg = 1, reset = true) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (reset) setLoading(true);

    const sp = new URLSearchParams();
    sp.set("page",  String(pg));
    sp.set("limit", "12");
    sp.set("sort",  sort);
    if (filters.search)     sp.set("search",     filters.search);
    if (filters.location)   sp.set("location",   filters.location);
    if (filters.workTime)   sp.set("workTime",   filters.workTime);
    if (filters.experience) sp.set("experience", filters.experience);
    if (filters.salaryMin)  sp.set("salaryMin",  filters.salaryMin);
    if (filters.salaryMax)  sp.set("salaryMax",  filters.salaryMax);
    if (filters.ageMin)     sp.set("ageMin",     filters.ageMin);
    if (filters.ageMax)     sp.set("ageMax",     filters.ageMax);

    try {
      const res  = await fetch(`/api/jobs?${sp}`, { signal: ctrl.signal });
      const data = await res.json();
      if (reset) setJobs(data.jobs ?? []);
      else       setJobs(prev => [...prev, ...(data.jobs ?? [])]);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      setPage(pg);
    } catch (e: unknown) {
      if ((e as Error)?.name !== "AbortError") console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => { fetchJobs(1); }, [fetchJobs]);

  function handleSaveToggle(id: string, saved: boolean) {
    setJobs(prev => prev.map(j => j._id === id ? { ...j, isSaved: saved } : j));
  }

  const sortTabs: { key: SortTab; label: string; icon: React.ReactNode }[] = [
    { key: "newest",   label: "Yangi",    icon: <List      className="w-3.5 h-3.5" /> },
    { key: "trending", label: "Trend",    icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { key: "featured", label: "Top",      icon: <Star      className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Search header */}
        <div className="bg-white dark:bg-dark-800 border-b border-slate-100 dark:border-dark-700">
          <div className="container-app py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 mb-4">
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Vakansiyalar
              </h1>
              {!loading && (
                <span className="text-sm text-slate-400 sm:ml-2">({total} ta natija)</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="search" placeholder="Ish nomi yoki kalit so'z..."
                  value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="input-base pl-10" />
              </div>
              <div className="relative sm:w-52 lg:w-60">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input type="text" placeholder="Shahar / Viloyat"
                  value={filters.location} onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
                  className="input-base pl-10" />
              </div>
            </div>

            {/* Sort tabs + filter trigger + view toggle */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {/* Sort */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-dark-700 rounded-lg p-1">
                {sortTabs.map(tab => (
                  <button key={tab.key} onClick={() => setSort(tab.key)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                      sort === tab.key ? "bg-white dark:bg-dark-600 text-slate-800 dark:text-slate-200 shadow-sm"
                                       : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <JobFilters filters={filters} onChange={setFilters} />

              {/* View toggle */}
              <div className="hidden md:flex items-center gap-1 ml-auto bg-slate-100 dark:bg-dark-700 rounded-lg p-1">
                {(["grid","list"] as ViewMode[]).map(v => (
                  <button key={v} onClick={() => setViewMode(v)}
                    className={cn("p-1.5 rounded-md transition-colors",
                      viewMode === v ? "bg-white dark:bg-dark-600 shadow-sm text-slate-700 dark:text-slate-200"
                                     : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}
                    aria-label={v === "grid" ? "Grid" : "Ro'yxat"}>
                    {v === "grid" ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="container-app py-6 sm:py-8">
          <div className="flex gap-6 lg:gap-8 items-start">
            <JobFilters filters={filters} onChange={setFilters} className="hidden lg:block" />

            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
                  <span className="text-sm">Yuklanmoqda...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-5xl mb-4">🔍</div>
                  <h3 className="font-display text-lg font-semibold text-slate-700 dark:text-slate-300">Natija topilmadi</h3>
                  <p className="text-sm text-slate-400 mt-2 mb-6">Filtrlarni o&apos;zgartirib ko&apos;ring</p>
                  <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-secondary">Filtrlarni tozalash</button>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-3 sm:gap-4">
                      {jobs.map(j => <JobCard key={j._id} job={j} variant="grid" onSaveToggle={handleSaveToggle} />)}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jobs.map(j => <JobCard key={j._id} job={j} variant="list" onSaveToggle={handleSaveToggle} />)}
                    </div>
                  )}

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => fetchJobs(p)}
                          className={cn("w-9 h-9 rounded-xl text-sm font-semibold transition-all",
                            p === page ? "bg-brand-600 text-white shadow-brand"
                                       : "bg-white dark:bg-dark-700 border border-slate-200 dark:border-dark-600 text-slate-700 dark:text-slate-300 hover:border-brand-400")}>
                          {p}
                        </button>
                      ))}
                      {pages > 7 && page < pages && (
                        <button onClick={() => fetchJobs(page + 1)} className="btn-secondary text-sm px-4">
                          Keyingi
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
