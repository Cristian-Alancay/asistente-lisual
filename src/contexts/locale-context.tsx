import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/i18n/translations";
import { defaultLocale, getLoginStrings, getSidebarStrings, getCommonStrings, getPageStrings } from "@/lib/i18n/translations";
import { prefixedKey } from "@/lib/storage-keys";

const STORAGE_KEY = prefixedKey("locale");
const LEGACY_STORAGE_KEY = "locale";
const LEGACY_PREFIXED_KEY = "lisual_locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: ReturnType<typeof getLoginStrings>;
  ts: ReturnType<typeof getSidebarStrings>;
  tc: ReturnType<typeof getCommonStrings>;
  tp: ReturnType<typeof getPageStrings>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  try {
    const stored = (
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem(LEGACY_PREFIXED_KEY) ??
      localStorage.getItem(LEGACY_STORAGE_KEY)
    ) as Locale | null;
    if (stored === "es" || stored === "en") return stored;
  } catch {
    // ignore
  }
  return defaultLocale;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);
  const initialRender = useRef(true);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.lang = next === "es" ? "es-AR" : "en";
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      document.documentElement.lang = locale === "es" ? "es-AR" : "en";
      return;
    }
    document.documentElement.lang = locale === "es" ? "es-AR" : "en";
  }, [locale]);

  const t = getLoginStrings(locale);
  const ts = getSidebarStrings(locale);
  const tc = getCommonStrings(locale);
  const tp = getPageStrings(locale);

  return (
    <LocaleContext value={{ locale, setLocale, t, ts, tc, tp }}>
      {children}
    </LocaleContext>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
