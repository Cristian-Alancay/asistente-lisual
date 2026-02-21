"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredDashboardContext } from "@/lib/contexto-storage";

/**
 * Si el usuario entra exactamente a /dashboard y tenía guardado el contexto
 * "personal", redirige a /dashboard/personal para mantener la última elección.
 */
export function DashboardContextRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    const stored = getStoredDashboardContext();
    if (stored === "personal") {
      router.replace("/dashboard/personal");
    }
  }, [pathname, router]);

  return null;
}
