"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Shield,
  Menu, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const SLUG = process.env.NEXT_PUBLIC_ADMIN_SLUG ?? "cp";

const NAV = [
  { href: `/${SLUG}`,          label: "Dashboard",          icon: LayoutDashboard, exact: true },
  { href: `/${SLUG}/payments`, label: "To'lovlar",          icon: CreditCard },
  { href: `/${SLUG}/jobs`,     label: "Vakansiyalar",       icon: Briefcase },
  { href: `/${SLUG}/users`,    label: "Foydalanuvchilar",   icon: Users },
];

export default function AdminSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [loggingOut,   setLoggingOut]   = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = `/${SLUG}/login`;
    }
  }

  function NavItem({ item }: { item: typeof NAV[0] }) {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link href={item.href} onClick={() => setMobileOpen(false)}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
          active
            ? "bg-brand-600 text-white shadow-lg shadow-brand-500/25"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        )}>
        <item.icon className={cn("w-5 h-5 flex-shrink-0", collapsed && "mx-auto")} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/10 flex-shrink-0",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-bold text-white text-sm">Admin Panel</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">IshBor</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(v => !v)}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV.map(item => <NavItem key={item.href} item={item} />)}
      </nav>

      {/* Footer */}
      <div className={cn(
        "flex-shrink-0 border-t border-white/10 p-3",
        collapsed ? "flex flex-col items-center gap-2" : "space-y-2"
      )}>
        {!collapsed && user && (
          <div className="px-2 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/40 truncate">{user.phone}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Chiqish" : undefined}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold",
            "text-red-400 hover:text-red-300 hover:bg-red-500/10",
            "transition-all w-full disabled:opacity-50",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>{loggingOut ? "Chiqilmoqda..." : "Chiqish"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        "hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0",
        "bg-slate-900 border-r border-white/5 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-60"
      )}>
        {content}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 bg-slate-900 border-b border-white/10">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-400" />
            <span className="font-display font-bold text-white text-sm">Admin Panel</span>
          </div>
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile drawer */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/5",
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="font-display font-bold text-white text-sm">Admin Panel</span>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[calc(100%-3.5rem)]">{content}</div>
        </div>
      </div>
    </>
  );
}
