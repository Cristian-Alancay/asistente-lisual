"use client";

import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { setStoredDashboardContext } from "@/lib/contexto-storage";
import { cn } from "@/lib/utils";

const transitions = "transition-all duration-300 ease-out hover:duration-200";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0b]";

export function ElegirContextoCards() {
  const router = useRouter();

  function goTo(context: "trabajo" | "personal", path: string) {
    setStoredDashboardContext(context);
    router.push(path);
  }

  return (
    <div className="grid gap-5 sm:gap-6 w-full max-w-2xl mx-auto sm:grid-cols-2 animate-in fade-in duration-500 slide-in-from-bottom-4 fill-mode-both delay-150">
      {/* Trabajo — Espacio laboral */}
      <button
        type="button"
        onClick={() => goTo("trabajo", "/dashboard")}
        className={cn(
          "group rounded-2xl p-5 sm:p-6 text-left",
          "bg-zinc-800/90 border border-zinc-700/60",
          "hover:border-blue-500/40 hover:bg-zinc-800",
          "hover:scale-[1.02] active:scale-[0.99]",
          transitions,
          focusRing
        )}
      >
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl mb-4 text-blue-400",
            "bg-blue-500/15 group-hover:bg-blue-500/20",
            transitions
          )}
        >
          <Building2 className="h-7 w-7" />
        </span>
        <span className="block text-lg font-semibold text-white mb-1.5">Trabajo</span>
        <span className="block text-sm text-zinc-400 leading-snug">
          Espacio laboral: ventas, operaciones, clientes y planificación
        </span>
      </button>

      {/* Cristian Alancay — Espacio personal */}
      <button
        type="button"
        onClick={() => goTo("personal", "/dashboard/personal")}
        className={cn(
          "group rounded-2xl p-5 sm:p-6 text-left",
          "bg-zinc-800/90 border border-zinc-700/60",
          "hover:border-blue-500/40 hover:bg-zinc-800",
          "hover:scale-[1.02] active:scale-[0.99]",
          transitions,
          focusRing
        )}
      >
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl mb-4 text-blue-400",
            "bg-blue-500/15 group-hover:bg-blue-500/20",
            transitions
          )}
        >
          <User className="h-7 w-7" />
        </span>
        <span className="block text-lg font-semibold text-white mb-1.5">Cristian Alancay</span>
        <span className="block text-sm text-zinc-400 leading-snug">
          Espacio personal: tareas, calendario y notas
        </span>
      </button>
    </div>
  );
}
