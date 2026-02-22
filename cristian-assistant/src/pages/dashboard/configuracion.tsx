import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink, Bell } from "lucide-react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { useAuth } from "@/contexts/auth-context";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useLocale } from "@/contexts/locale-context";

const envVars = [
  { key: "VITE_SUPABASE_URL", label: "Supabase URL" },
  { key: "VITE_SUPABASE_ANON_KEY", label: "Supabase Anon Key" },
];

function ConfigStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Variables de entorno</CardTitle>
        <CardDescription>Estado de configuración del cliente (solo variables públicas)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2">
          {envVars.map(({ key, label }) => {
            const ok = !!import.meta.env[key];
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <span className="text-muted-foreground">{label}</span>
                {ok ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-300"><CheckCircle2 className="h-3 w-3" />OK</Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300"><XCircle className="h-3 w-3" />No configurada</Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

const integrations = [
  { name: "Supabase", description: "Auth, base de datos, storage.", href: "https://supabase.com/dashboard", env: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"] },
  { name: "Google (OAuth)", description: "Inicio de sesión con Google.", href: "https://supabase.com/dashboard/project/_/auth/providers", env: [] },
  { name: "Evolution API (WhatsApp)", description: "WhatsApp Business vía Edge Function.", href: "https://doc.evolution-api.com", env: [] },
  { name: "OpenAI", description: "Chat IA y agente vía Edge Function.", href: "https://platform.openai.com/api-keys", env: [] },
];

function ConfigIntegraciones() {
  return (
    <Card>
      <CardHeader><CardTitle>Integraciones</CardTitle><CardDescription>Servicios externos. Las API keys sensibles se configuran en Supabase Edge Functions.</CardDescription></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {integrations.map((int) => (
            <div key={int.name} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium">
                  {int.name}
                  {int.href && <a href={int.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></a>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{int.description}</p>
                {int.env.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{int.env.map((e) => <Badge key={e} variant="secondary" className="font-mono text-xs">{e}</Badge>)}</div>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigNotificaciones() {
  const { permission, isSupported, isGranted, requestPermission, sendLocalNotification } = usePushNotifications();

  if (!isSupported) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notificaciones push</CardTitle>
        <CardDescription>Recibí alertas de seguimientos, reuniones y vencimientos.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Badge variant={isGranted ? "outline" : "secondary"} className={isGranted ? "text-green-600 border-green-300" : ""}>
          {permission === "granted" ? "Activadas" : permission === "denied" ? "Bloqueadas" : "Sin activar"}
        </Badge>
        {permission === "default" && (
          <Button size="sm" onClick={requestPermission}>Activar notificaciones</Button>
        )}
        {isGranted && (
          <Button size="sm" variant="outline" onClick={() => sendLocalNotification("Test de notificación", { body: "Las notificaciones push funcionan correctamente." })}>
            Probar
          </Button>
        )}
        {permission === "denied" && (
          <p className="text-xs text-muted-foreground">Las notificaciones fueron bloqueadas. Activálas desde la configuración del navegador.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ConfiguracionPage() {
  const { tp } = useLocale();
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tp.settingsTitle}</h1>
        <p className="text-muted-foreground">{tp.settingsSubtitle}</p>
      </div>
      {profile && <ProfileForm profile={profile} />}
      <ConfigNotificaciones />
      <ConfigStatus />
      <ConfigIntegraciones />
    </div>
  );
}
