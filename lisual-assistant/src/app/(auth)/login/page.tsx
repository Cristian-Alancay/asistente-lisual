"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const searchParams = useSearchParams();
  const denied = searchParams.get("error") === "denied";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresá con tu cuenta de email y contraseña para acceder al Asistente Lisual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {(denied || error) && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {denied
                ? "No tenés acceso a esta aplicación. Solo cuentas autorizadas pueden ingresar."
                : error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(!!v)}
                aria-describedby="remember"
              />
              <span id="remember">Recordarme</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Olvidé mi contraseña
            </Link>
          </div>

          <Button
            type="submit"
            className="h-10 w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
              });
            }}
            aria-label="Iniciar sesión con Google"
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
            className="h-10 w-10 rounded-full"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "azure",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
              });
            }}
            aria-label="Iniciar sesión con Microsoft"
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
            className="h-10 w-10 rounded-full"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: "apple",
                options: {
                  redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
                },
              });
            }}
            aria-label="Iniciar sesión con Apple"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </Button>
        </div>
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
