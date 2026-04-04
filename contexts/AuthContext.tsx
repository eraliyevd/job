"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef, type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ── Types ── */
export type UserPlan = "free" | "basic" | "standard" | "pro" | "business";
export type UserRole = "user" | "admin";

export interface AuthUser {
  id:             string;
  name:           string;
  phone:          string;
  role:           UserRole;
  plan:           UserPlan;
  planExpireDate: string | null;
  topCredits:     number;
  jobLimit:       number;  // -1 = unlimited
}

export interface ApiResult {
  ok:      boolean;
  error?:  string;
  fields?: Record<string, string>;
}

interface AuthContextType {
  user:          AuthUser | null;
  isLoading:     boolean;
  isLoggingIn:   boolean;
  isRegistering: boolean;
  login:       (phone: string, password: string) => Promise<ApiResult>;
  register:    (name: string, phone: string, password: string) => Promise<ApiResult>;
  logout:      () => Promise<void>;
  refresh:     () => Promise<boolean>;
  updateUser:  (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, isLoading: true, isLoggingIn: false, isRegistering: false,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
  refresh: async () => false,
  updateUser: () => {},
});

/* ── Fetch helper ── */
async function apiFetch(url: string, body?: object): Promise<Response> {
  return fetch(url, {
    method:      body ? "POST" : "GET",
    headers:     body ? { "Content-Type": "application/json" } : undefined,
    body:        body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
}

/* ── Shape the user from API response ── */
function shapeUser(raw: Record<string, unknown>): AuthUser {
  return {
    id:             String(raw.id ?? raw._id ?? ""),
    name:           String(raw.name ?? ""),
    phone:          String(raw.phone ?? ""),
    role:           (raw.role as UserRole) ?? "user",
    plan:           (raw.plan as UserPlan) ?? "free",
    planExpireDate: (raw.planExpireDate as string) ?? null,
    topCredits:     Number(raw.topCredits ?? 0),
    jobLimit:       Number(raw.jobLimit ?? 1),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user,          setUser]          = useState<AuthUser | null>(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isLoggingIn,   setIsLoggingIn]   = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const refreshingRef = useRef(false);

  /* ── Fetch /api/auth/me ── */
  const fetchMe = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await apiFetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return shapeUser(data.user);
    } catch {
      return null;
    }
  }, []);

  /* ── Silent token refresh ── */
  const refresh = useCallback(async (): Promise<boolean> => {
    if (refreshingRef.current) return false;
    refreshingRef.current = true;
    try {
      const res = await apiFetch("/api/auth/refresh");
      if (!res.ok) return false;
      const data = await res.json();
      setUser(shapeUser(data.user));
      return true;
    } catch {
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  /* ── Hydrate on mount ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        let me = await fetchMe();
        if (!me) {
          const ok = await refresh();
          if (ok) me = await fetchMe();
        }
        if (!cancelled) setUser(me);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchMe, refresh]);

  /* ── Auto-refresh before access token expires ── */
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => {
      refresh().then(ok => { if (!ok) setUser(null); });
    }, 14 * 60 * 1000); // 14 min
    return () => clearInterval(id);
  }, [user, refresh]);

  /* ── Login ── */
  const login = useCallback(async (phone: string, password: string): Promise<ApiResult> => {
    setIsLoggingIn(true);
    try {
      const res  = await apiFetch("/api/auth/login", { phone, password });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error, fields: data.fields };
      setUser(shapeUser(data.user));
      return { ok: true };
    } catch {
      return { ok: false, error: "Tarmoq xatosi. Qayta urinib ko'ring." };
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  /* ── Register ── */
  const register = useCallback(async (name: string, phone: string, password: string): Promise<ApiResult> => {
    setIsRegistering(true);
    try {
      const res  = await apiFetch("/api/auth/register", { name, phone, password });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error, fields: data.fields };
      setUser(shapeUser(data.user));
      return { ok: true };
    } catch {
      return { ok: false, error: "Tarmoq xatosi. Qayta urinib ko'ring." };
    } finally {
      setIsRegistering(false);
    }
  }, []);

  /* ── Logout ── */
  const logout = useCallback(async () => {
    try { await apiFetch("/api/auth/logout"); } catch { /* ignore */ }
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  /* ── Optimistic patch ── */
  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...patch } : null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, isLoggingIn, isRegistering,
      login, register, logout, refresh, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

/** Use inside protected pages — redirects to /login if unauthenticated */
export function useRequireAuth(): AuthUser {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);
  return user!;
}
