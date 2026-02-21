"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n/translations";
import { defaultLocale, getLoginStrings } from "@/lib/i18n/translations";
import { prefixedKey } from "@/lib/storage-keys";

const STORAGE_KEY = prefixedKey("locale");
const LEGACY_STORAGE_KEY = "locale";
const LEGACY_PREFIXED_KEY = "lisual_locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getLoginStrings>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = (
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem(LEGACY_PREFIXED_KEY) ??
        localStorage.getItem(LEGACY_STORAGE_KEY)
      ) as Locale | null;
      if (stored === "es" || stored === "en") setLocaleState(stored);
    } catch {
      // ignore
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      if (typeof document !== "undefined") document.documentElement.lang = next === "es" ? "es-AR" : "en";
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale === "es" ? "es-AR" : "en";
  }, [locale, mounted]);

  const t = getLoginStrings(locale);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
