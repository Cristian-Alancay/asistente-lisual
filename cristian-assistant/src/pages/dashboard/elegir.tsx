import { ElegirContextoCards } from "@/components/dashboard/elegir-contexto-cards";

export default function ElegirContextoPage() {
  return (
    <div className="relative flex w-full max-w-2xl mx-auto flex-col items-center justify-center text-center">
      {/* Brand */}
      <div className="landing-fade-in flex flex-col items-center gap-3" style={{ animationDelay: "0s" }}>
        <img
          src="/pwa-512x512.png"
          alt=""
          className="landing-logo h-16 w-16 sm:h-20 sm:w-20"
          draggable={false}
        />
        <span className="auth-header-brand text-2xl font-black tracking-tight sm:text-3xl">
          NOMOS
        </span>
      </div>

      {/* Title */}
      <div className="mt-8 space-y-2 landing-fade-in" style={{ animationDelay: "0.15s" }}>
        <h1 className="text-lg font-medium tracking-tight text-foreground/80 sm:text-xl">
          Seleccioná tu espacio
        </h1>
        <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground/60">
          Cada entorno muestra solo su información.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-8 w-full landing-fade-in" style={{ animationDelay: "0.3s" }}>
        <ElegirContextoCards />
      </div>
    </div>
  );
}
