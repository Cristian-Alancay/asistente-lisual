"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/contexts/locale-context";
import { translateAuthError } from "@/lib/i18n/translations";

function LoginForm() {
  const searchParams = useSearchParams();
  const denied = searchParams.get("error") === "denied";
  const authError = searchParams.get("error") === "auth";
  const logoutSuccess = searchParams.get("logout") === "success";
  const { locale, t } = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (logoutSuccess && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("logout");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [logoutSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(translateAuthError(signInError.message, locale));
        return;
      }
      toast.success(t.toastSuccess, { description: t.toastRedirect });
      router.push("/dashboard/elegir");
      router.refresh();
    } catch {
      setError(t.errorGeneric);
      toast.error(t.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="auth-card animate-auth-card-in w-full max-w-[calc(100vw-2rem)] border-border/60 bg-card/95 shadow-xl backdrop-blur-sm rounded-xl md:max-w-md md:rounded-2xl">
      <CardHeader className="space-y-1.5 pb-4 pt-6 text-center md:pt-8">
        <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">
          {t.title}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t.subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-6 pt-0 safe-area-inset-bottom md:pb-8">
        {logoutSuccess && (
          <div className="rounded-lg border border-green-200/80 bg-green-50/90 p-3 text-sm text-green-800 transition-colors dark:border-green-800/50 dark:bg-green-950/40 dark:text-green-200">
            {t.sessionClosed}
          </div>
        )}
        {authError && (
          <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 p-3 text-sm text-amber-800 transition-colors dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
            {t.providerError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {denied && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm transition-colors dark:border-amber-400/30 dark:bg-amber-500/15" role="alert">
              <p className="font-semibold text-amber-700 dark:text-amber-300">{t.deniedTitle}</p>
              <p className="mt-1 text-amber-600 dark:text-amber-400/90">
                {t.deniedText}
              </p>
            </div>
          )}
          {!denied && error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive transition-colors">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              {t.email}
            </Label>
            <div className="auth-input rounded-lg border border-input bg-background px-3 ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              {t.password}
            </Label>
            <div className="auth-input relative rounded-lg border border-input bg-background px-3 ring-offset-background transition-colors focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-0 bg-transparent pr-11 shadow-none focus-visible:ring-0"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground transition-colors" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground transition-colors" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
                aria-describedby="remember"
                className="transition-opacity"
              />
              <span id="remember">{t.rememberMe}</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary transition-colors hover:underline hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded"
            >
              {t.forgotPassword}
            </Link>
          </div>

          <Button
            type="submit"
            className="auth-primary-btn h-11 w-full font-semibold"
            disabled={loading}
            aria-busy={loading}
            aria-live="polite"
          >
            {loading ? t.submitting : t.submit}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/80 transition-colors" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-3 text-muted-foreground">{t.orWith}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-border/80 bg-muted/30 dark:bg-muted/20 transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-accent focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/dashboard/elegir`,
                },
              });
            }}
            aria-label={t.google}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-border/80 bg-muted/30 dark:bg-muted/20 transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-accent focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "azure",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/dashboard/elegir`,
                },
              });
            }}
            aria-label={t.microsoft}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#F25022" d="M1 1h10v10H1z" />
              <path fill="#00A4EF" d="M1 13h10v10H1z" />
              <path fill="#7FBA00" d="M13 1h10v10H13z" />
              <path fill="#FFB900" d="M13 13h10v10H13z" />
            </svg>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-border/80 bg-muted/30 dark:bg-muted/20 transition-all duration-200 hover:scale-105 hover:border-primary/30 hover:bg-accent focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "apple",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=/dashboard/elegir`,
                },
              });
            }}
            aria-label={t.apple}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground/80 pt-4">
          {t.privateNote}
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Card><CardContent className="pt-6">Cargando...</CardContent></Card>}>
      <LoginForm />
    </Suspense>
  );
}
