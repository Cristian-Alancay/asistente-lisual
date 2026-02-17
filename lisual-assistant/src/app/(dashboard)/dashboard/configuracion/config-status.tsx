import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

const vars = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role" },
  { key: "EVOLUTION_API_URL", label: "Evolution API URL" },
  { key: "EVOLUTION_API_KEY", label: "Evolution API Key" },
  { key: "CRON_SECRET", label: "Cron Secret" },
];

function envSet(key: string): boolean {
  if (typeof process.env[key] === "string" && process.env[key]!.trim().length > 0) {
    return true;
  }
  return false;
}

export function ConfigStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables de entorno</CardTitle>
        <CardDescription>
          Estado de configuración (solo se muestra si está definida o no)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {vars.map(({ key, label }) => {
            const ok = envSet(key);
            return (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{label}</span>
                {ok ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
                    <CheckCircle2 className="h-3 w-3" />
                    OK
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
                    <XCircle className="h-3 w-3" />
                    No configurada
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
