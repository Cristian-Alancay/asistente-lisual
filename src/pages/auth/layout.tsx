import { Link, Outlet } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";
import { APP_VERSION } from "@/lib/constants";

export default function AuthLayout() {
  return (
    <div className="auth-page relative flex min-h-screen-mobile min-h-svh flex-col overflow-hidden transition-colors duration-500">
      <div
        className="pointer-events-none absolute inset-0 bg-auth-gradient"
        aria-hidden
      />
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />

      <header className="auth-header safe-area-inset-top relative z-10 flex items-center justify-between px-4 py-3 backdrop-blur-md transition-all duration-300 safe-area-padding-x">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md touch-target"
        >
          <img src="/pwa-192x192.png" alt="" className="h-6 w-6 shrink-0" draggable={false} />
          <span className="auth-header-brand truncate text-sm font-black tracking-tight sm:max-w-none">
            NOMOS
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 pb-6 pt-4 md:p-6 safe-area-padding-x">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="safe-area-inset-bottom relative z-10 flex items-center justify-center gap-3 py-4 safe-area-padding-x">
        <span className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} NOMOS — Cristian Alancay
        </span>
        <span className="text-[0.6rem] font-mono text-muted-foreground/25">
          v{APP_VERSION}
        </span>
      </footer>
    </div>
  );
}
