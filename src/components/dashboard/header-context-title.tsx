"use client";

import { usePathname } from "next/navigation";

export function HeaderContextTitle() {
  const pathname = usePathname();
  const isElegir = pathname === "/dashboard/elegir";

  return (
    <span className="hidden truncate text-sm font-medium text-muted-foreground sm:inline">
      {isElegir ? "Elegí un espacio" : "Assistant Cristian Alancay"}
    </span>
  );
}
