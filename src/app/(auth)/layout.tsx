import Link from "next/link";
import { Globe } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleToggle } from "@/components/locale-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative flex min-h-screen-mobile min-h-svh flex-col overflow-hidden transition-colors duration-500">
      {/* Gradiente de fondo + orbes decorativos */}
      <div
        className="pointer-events-none absolute inset-0 bg-auth-gradient"
        aria-hidden
      />
      <div className="auth-orb auth-orb-1" aria-hidden />
      <div className="auth-orb auth-orb-2" aria-hidden />
      <div className="auth-orb auth-orb-3" aria-hidden />

      <header className="safe-area-inset-top relative z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md transition-all duration-300 dark:border-white/5 dark:bg-black/20 safe-area-padding-x">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md touch-target"
        >
          <Globe className="h-6 w-6 shrink-0 text-primary transition-transform duration-200 hover:scale-110" />
          <span className="truncate tracking-tight sm:max-w-none">Assistant Cristian Alancay</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center p-4 pb-6 pt-4 md:p-6 safe-area-padding-x">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="safe-area-inset-bottom relative z-10 py-4 text-center text-sm text-muted-foreground/80 transition-colors duration-300 safe-area-padding-x">
        © {new Date().getFullYear()} Assistant Cristian Alancay
      </footer>
    </div>
  );
}
