"use client";

import {
  createContext, useContext, useState,
  useEffect, useCallback, type ReactNode,
} from "react";

/* ── Types ── */
export type Locale = "uz-latn" | "uz-cyrl" | "ru";

export const LOCALES: { code: Locale; label: string; flag: string; dir: "ltr" | "rtl" }[] = [
  { code: "uz-latn", label: "O'zbekcha", flag: "🇺🇿", dir: "ltr" },
  { code: "uz-cyrl", label: "Ўзбекча",   flag: "🇺🇿", dir: "ltr" },
  { code: "ru",      label: "Русский",   flag: "🇷🇺", dir: "ltr" },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dict = Record<string, any>;

interface I18nContextType {
  locale:    Locale;
  setLocale: (locale: Locale) => void;
  t:         (key: string, vars?: Record<string, string | number>) => string;
  isReady:   boolean;
}

/* ── Module-level cache survives re-renders ── */
const cache: Partial<Record<Locale, Dict>> = {};

async function loadDict(locale: Locale): Promise<Dict> {
  if (cache[locale]) return cache[locale]!;
  try {
    const res  = await fetch(`/locales/${locale}.json`);
    const data: Dict = await res.json();
    cache[locale] = data;
    return data;
  } catch {
    return {};
  }
}

function resolve(dict: Dict, key: string, vars?: Record<string, string | number>): string {
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Dict)) cur = (cur as Dict)[p];
    else return key;
  }
  if (typeof cur !== "string") return key;
  if (!vars) return cur;
  return cur.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? `{{${k}}}`));
}

const STORAGE_KEY = "ishbor_locale";

/* ── Context ── */
const I18nContext = createContext<I18nContextType>({
  locale: "uz-latn", setLocale: () => {}, t: k => k, isReady: false,
});

/* ── Provider ── */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale,  setLocaleState] = useState<Locale>("uz-latn");
  const [dict,    setDict]        = useState<Dict>({});
  const [isReady, setIsReady]     = useState(false);

  /* Restore from localStorage on mount */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && LOCALES.some(l => l.code === saved)) {
        setLocaleState(saved);
        return;
      }
    } catch { /* SSR safe */ }
    setLocaleState("uz-latn");
  }, []);

  /* Load translations when locale changes */
  useEffect(() => {
    setIsReady(false);
    loadDict(locale).then(d => {
      setDict(d);
      setIsReady(true);
    });
    /* Update html lang attr */
    document.documentElement.lang = locale === "uz-latn" ? "uz" : locale === "uz-cyrl" ? "uz" : "ru";
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* SSR safe */ }
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => resolve(dict, key, vars),
    [dict]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isReady }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }
