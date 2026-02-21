"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Muestra un toast "Bienvenido" cuando el usuario entra al dashboard tras login OAuth (?welcome=1)
 * y limpia el parámetro de la URL.
 */
export function WelcomeToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("welcome") !== "1") return;

    toast.success("Bienvenido", { description: "Sesión iniciada correctamente." });

    const url = new URL(pathname, typeof window !== "undefined" ? window.location.origin : "");
    searchParams.forEach((value, key) => {
      if (key !== "welcome") url.searchParams.set(key, value);
    });
    const newPath = url.pathname + (url.searchParams.toString() ? "?" + url.searchParams.toString() : "");
    router.replace(newPath);
  }, [searchParams, pathname, router]);

  return null;
}
