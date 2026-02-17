import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const integrations = [
  {
    name: "Supabase",
    description: "Auth, base de datos, storage. Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.",
    href: "https://supabase.com/dashboard",
    env: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  },
  {
    name: "Google (OAuth)",
    description: "Inicio de sesión con Google. Configurá el provider en Supabase Dashboard → Authentication → Providers → Google.",
    href: "https://supabase.com/dashboard/project/_/auth/providers",
    env: [],
  },
  {
    name: "Evolution API (WhatsApp)",
    description: "WhatsApp Business. Variables: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE.",
    href: "https://doc.evolution-api.com",
    env: ["EVOLUTION_API_URL", "EVOLUTION_API_KEY", "EVOLUTION_INSTANCE"],
  },
  {
    name: "OpenAI",
    description: "Chat IA y agente. Variable: OPENAI_API_KEY.",
    href: "https://platform.openai.com/api-keys",
    env: ["OPENAI_API_KEY"],
  },
  {
    name: "Cron (Vercel)",
    description: "Seguimientos automáticos. Variable: CRON_SECRET (mismo valor en Vercel Cron).",
    href: "https://vercel.com/docs/cron-jobs",
    env: ["CRON_SECRET"],
  },
];

export function ConfigIntegraciones() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integraciones</CardTitle>
        <CardDescription>
          Servicios externos y variables de entorno. Configurá cada uno en Supabase Dashboard o en .env.local.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {int.name}
                  {int.href && (
                    <a
                      href={int.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary"
                      aria-label={`Abrir ${int.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{int.description}</p>
                {int.env.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {int.env.map((e) => (
                      <Badge key={e} variant="secondary" className="font-mono text-xs">
                        {e}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
