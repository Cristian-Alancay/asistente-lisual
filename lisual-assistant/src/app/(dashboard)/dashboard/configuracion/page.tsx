import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ConfigStatus } from "./config-status";

export default async function ConfiguracionPage() {
  const profile = await requireRole("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema y datos de perfil en Supabase</p>
      </div>

      <ProfileForm profile={profile} />

      <ConfigStatus />

      <Card>
        <CardHeader>
          <CardTitle>Integraciones</CardTitle>
          <CardDescription>Supabase, Google, WhatsApp, Evolution API</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Supabase: auth, base de datos, storage</li>
            <li>• Evolution API: WhatsApp Business</li>
            <li>• OpenAI: chat, agente y herramientas IA</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
