"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Sun, Moon, Globe, ChevronDown, Menu, X,
  Briefcase, LogOut, User, Plus, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n, LOCALES, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/* ── Hooks ── */
function useClickOutside(cb: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [cb]);
  return ref;
}

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const y = window.scrollY;
    document.body.style.cssText = `position:fixed;top:-${y}px;width:100%;overflow-y:scroll`;
    return () => {
      document.body.style.cssText = "";
      window.scrollTo(0, y);
    };
  }, [locked]);
}

/* ── Sub-components ── */
function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Yorug' rejim" : "Qorong'u rejim"}
      className={cn(
        "relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200",
        "text-slate-500 dark:text-slate-400",
        "hover:text-slate-800 dark:hover:text-slate-200",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        "active:scale-95"
      )}
    >
      <Sun  className={cn("absolute w-4 h-4 transition-all duration-300", dark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
      <Moon className={cn("absolute w-4 h-4 transition-all duration-300", dark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50")} />
    </button>
  );
}

function LangMenu({ mobile }: { mobile?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const current = LOCALES.find(l => l.code === locale);

  if (mobile) {
    return (
      <div className="px-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-3">Til</p>
        <div className="space-y-0.5">
          {LOCALES.map(loc => (
            <button key={loc.code} onClick={() => setLocale(loc.code as Locale)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                locale === loc.code
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}>
              <span className="text-base">{loc.flag}</span>
              <span>{loc.label}</span>
              {locale === loc.code && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-medium transition-all",
          "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          open && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        )}>
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{current?.flag}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 animate-fade-down">
          <div className="card-elevated p-1.5 space-y-0.5">
            {LOCALES.map(loc => (
              <button key={loc.code} onClick={() => { setLocale(loc.code as Locale); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  locale === loc.code
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}>
                <span className="text-base">{loc.flag}</span>
                <span className="flex-1 text-left">{loc.label}</span>
                {locale === loc.code && (
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  if (!user) return null;

  const planBadge: Record<string, string> = {
    free:     "bg-slate-100 dark:bg-slate-700 text-slate-500",
    basic:    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    standard: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300",
    pro:      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    business: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border transition-all duration-200",
          open
            ? "border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-900/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden lg:block text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 animate-fade-down">
          <div className="card-elevated p-1.5">
            {/* User info */}
            <div className="px-3 pt-2.5 pb-3 mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className={cn("badge capitalize text-[10px]", planBadge[user.plan] ?? planBadge.free)}>
                  {user.plan}
                </span>
                {user.topCredits > 0 && (
                  <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px]">
                    ⭐ {user.topCredits}
                  </span>
                )}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-700 mx-1 mb-1" />

            {[
              { href: "/profile",   label: "Profil",     icon: <User className="w-4 h-4" /> },
              { href: "/dashboard", label: "Dashboard",  icon: <LayoutDashboard className="w-4 h-4" /> },
              { href: "/post-job",  label: t("nav.postJob"), icon: <Plus className="w-4 h-4" /> },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => { setOpen(false); onClose?.(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                <span className="text-slate-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            {user.role === "admin" && (
              <Link href={`/${process.env.NEXT_PUBLIC_ADMIN_SLUG ?? "cp"}`} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors font-medium">
                <LayoutDashboard className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            <div className="h-px bg-slate-100 dark:bg-slate-700 mx-1 my-1" />

            <button onClick={() => { setOpen(false); onClose?.(); logout(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium">
              <LogOut className="w-4 h-4" />
              {t("nav.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Navbar ── */
export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { t } = useI18n();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrolled = useScrolled();
  useLockBody(drawerOpen);

  useEffect(() => setDrawerOpen(false), [pathname]);

  const navLinks = [
    { href: "/",        label: t("nav.home") },
    { href: "/jobs",    label: t("nav.jobs") },
    { href: "/pricing", label: t("nav.pricing") },
  ];

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className={cn(
        "sticky top-0 z-40 w-full glass transition-all duration-300",
        scrolled && "shadow-sm"
      )}>
        <div className="container-app">
          <nav className="flex items-center h-[60px] gap-2" aria-label="Main navigation">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-[17px] text-slate-900 dark:text-white mr-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand flex-shrink-0">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="hidden xs:block">
                Ish<span className="text-brand-600">Bor</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5 flex-1">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href}
                  className={cn(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive(href)
                      ? "text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">
              <ThemeToggle />

              <div className="hidden sm:block">
                <LangMenu />
              </div>

              {/* Auth */}
              {isLoading ? (
                <div className="w-24 h-8 skeleton rounded-xl" />
              ) : user ? (
                <>
                  <Link href="/post-job"
                    className="hidden sm:inline-flex btn-primary text-xs px-3 py-2 min-h-[34px] gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{t("nav.postJob")}</span>
                    <span className="md:hidden">Post</span>
                  </Link>
                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link href="/login" className="hidden sm:inline-flex btn-ghost text-sm px-3 min-h-[36px]">
                    {t("nav.login")}
                  </Link>
                  <Link href="/register" className="btn-primary text-sm px-4 min-h-[36px]">
                    <span className="hidden sm:inline">Ro&apos;yxatdan o&apos;tish</span>
                    <span className="sm:hidden">Kirish</span>
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button onClick={() => setDrawerOpen(v => !v)}
                className="md:hidden ml-1 w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={drawerOpen ? "Yopish" : "Menyu"}>
                <span className={cn("transition-all duration-200", drawerOpen && "opacity-0 scale-50 absolute")}>
                  <Menu className="w-5 h-5" />
                </span>
                <span className={cn("transition-all duration-200", !drawerOpen && "opacity-0 scale-50 absolute")}>
                  <X className="w-5 h-5" />
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-all duration-300",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Panel */}
        <div className={cn(
          "absolute inset-y-0 right-0 w-[300px] bg-white dark:bg-slate-900",
          "flex flex-col shadow-2xl transition-transform duration-300 ease-out",
          "border-l border-slate-100 dark:border-slate-800",
          drawerOpen ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-[60px] border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
            <Link href="/" onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-2 font-display font-bold text-[17px] text-slate-900 dark:text-white">
              <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5 text-white" />
              </div>
              Ish<span className="text-brand-600">Bor</span>
            </Link>
            <button onClick={() => setDrawerOpen(false)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Nav links */}
            <div className="p-3 space-y-0.5">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                    isActive(href)
                      ? "text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}>
                  {label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />

            {/* Language */}
            <div className="py-3">
              <LangMenu mobile />
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 mx-4 my-1" />

            {/* Theme */}
            <div className="p-3">
              <ThemeToggleRow />
            </div>
          </div>

          {/* Footer auth */}
          <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-1 py-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.phone}</p>
                  </div>
                </div>
                <Link href="/post-job" onClick={() => setDrawerOpen(false)} className="btn-primary w-full gap-2">
                  <Plus className="w-4 h-4" /> {t("nav.postJob")}
                </Link>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login"    onClick={() => setDrawerOpen(false)} className="btn-secondary justify-center">Kirish</Link>
                <Link href="/register" onClick={() => setDrawerOpen(false)} className="btn-primary  justify-center">Ro&apos;yxat</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* Theme toggle row for mobile drawer */
function ThemeToggleRow() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const dark = resolvedTheme === "dark";
  return (
    <div className="px-1">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-3">Interfeys</p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { key: "light", label: "Kunduzgi", icon: <Sun className="w-4 h-4" /> },
          { key: "dark",  label: "Tungi",    icon: <Moon className="w-4 h-4" /> },
        ].map(opt => (
          <button key={opt.key} onClick={() => setTheme(opt.key)}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
              (!dark && opt.key === "light") || (dark && opt.key === "dark")
                ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}>
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
