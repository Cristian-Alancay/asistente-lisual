import { prefixedKey } from "@/lib/storage-keys";

export const DASHBOARD_CONTEXT_KEY = prefixedKey("dashboard_context");
const LEGACY_DASHBOARD_CONTEXT_KEY = "dashboard_context";
const LEGACY_PREFIXED_KEY = "lisual_dashboard_context";

export type DashboardContext = "trabajo" | "personal";

export function getStoredDashboardContext(): DashboardContext | null {
  const v =
    localStorage.getItem(DASHBOARD_CONTEXT_KEY) ??
    localStorage.getItem(LEGACY_PREFIXED_KEY) ??
    localStorage.getItem(LEGACY_DASHBOARD_CONTEXT_KEY);
  if (v === "trabajo" || v === "personal") return v;
  if (v === "lisual") return "trabajo";
  return null;
}

export function setStoredDashboardContext(ctx: DashboardContext): void {
  localStorage.setItem(DASHBOARD_CONTEXT_KEY, ctx);
}
