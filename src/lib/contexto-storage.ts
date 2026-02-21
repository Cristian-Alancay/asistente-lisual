import { prefixedKey } from "@/lib/storage-keys";

/** Clave en localStorage para el último contexto del dashboard (Trabajo | Cristian Alancay) */
export const DASHBOARD_CONTEXT_KEY = prefixedKey("dashboard_context");
const LEGACY_DASHBOARD_CONTEXT_KEY = "dashboard_context";
const LEGACY_PREFIXED_KEY = "lisual_dashboard_context";

export type DashboardContext = "trabajo" | "personal";

export function getStoredDashboardContext(): DashboardContext | null {
  if (typeof window === "undefined") return null;
  const v =
    window.localStorage.getItem(DASHBOARD_CONTEXT_KEY) ??
    window.localStorage.getItem(LEGACY_PREFIXED_KEY) ??
    window.localStorage.getItem(LEGACY_DASHBOARD_CONTEXT_KEY);
  if (v === "trabajo" || v === "personal") return v;
  if (v === "lisual") return "trabajo";
  return null;
}

export function setStoredDashboardContext(ctx: DashboardContext): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DASHBOARD_CONTEXT_KEY, ctx);
}
