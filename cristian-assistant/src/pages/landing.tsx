import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Linkedin, Instagram, Globe, Github } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { APP_VERSION } from "@/lib/constants";

const LINKS = {
  linkedin: "https://www.linkedin.com/in/cristian-alancay",
  github: "https://github.com/cristianalancay",
  instagram: "https://www.instagram.com/cristianalancay",
  web: "https://cristianalancay.com",
};

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="landing-page relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 safe-area-padding-x">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 bg-landing-gradient" aria-hidden />
      <div className="landing-orb landing-orb-1" aria-hidden />
      <div className="landing-orb landing-orb-2" aria-hidden />
      <div className="landing-orb landing-orb-3" aria-hidden />
      <div className="landing-grid" aria-hidden />

      <div className="relative z-10 flex flex-col items-center gap-7 text-center sm:gap-8">
        {/* Logo */}
        <div className="landing-fade-in" style={{ animationDelay: "0s" }}>
          <img
            src="/pwa-512x512.png"
            alt=""
            className="landing-logo mx-auto h-20 w-20 sm:h-24 sm:w-24"
            draggable={false}
          />
        </div>

        {/* Brand */}
        <div className="space-y-4 landing-fade-in" style={{ animationDelay: "0.15s" }}>
          <h1 className="landing-title text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl">
            NOMOS
          </h1>
          <div className="landing-line" />
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-muted-foreground/60 sm:text-xs sm:tracking-[0.4em]">
            Network Operating Management &amp; Optimized Services
          </p>
        </div>

        {/* CTA */}
        <div className="landing-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button size="lg" className="landing-cta px-10 text-sm font-medium tracking-wider" asChild>
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>

        {/* Social links */}
        <div className="landing-fade-in flex items-center gap-3" style={{ animationDelay: "0.5s" }}>
          <a
            href={LINKS.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-social landing-social-linkedin"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <Linkedin className="h-[18px] w-[18px]" />
          </a>
          <span className="landing-social-dot" aria-hidden />
          <a
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-social landing-social-github"
            aria-label="GitHub"
            title="GitHub"
          >
            <Github className="h-[18px] w-[18px]" />
          </a>
          <span className="landing-social-dot" aria-hidden />
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-social landing-social-instagram"
            aria-label="Instagram"
            title="Instagram"
          >
            <Instagram className="h-[18px] w-[18px]" />
          </a>
          <span className="landing-social-dot" aria-hidden />
          <a
            href={LINKS.web}
            target="_blank"
            rel="noopener noreferrer"
            className="landing-social landing-social-web"
            aria-label="Página web"
            title="cristianalancay.com"
          >
            <Globe className="h-[18px] w-[18px]" />
          </a>
        </div>

        {/* Restricted */}
        <div className="landing-fade-in flex items-center gap-2 text-[0.7rem] text-muted-foreground/40" style={{ animationDelay: "0.7s" }}>
          <Lock className="h-3 w-3" />
          <span>Acceso restringido a usuarios autorizados</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="landing-fade-in absolute bottom-0 left-0 right-0 safe-area-padding-x px-4 py-5" style={{ animationDelay: "0.9s" }}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-1.5 sm:flex-row sm:justify-between">
          <span className="text-[0.65rem] text-muted-foreground/40">
            © {new Date().getFullYear()} NOMOS — Cristian Alancay
          </span>
          <span className="text-[0.6rem] font-mono text-muted-foreground/30">
            v{APP_VERSION}
          </span>
        </div>
      </footer>
    </div>
  );
}
