import { requireRole } from "@/lib/auth";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ConfigStatus } from "./config-status";
import { ConfigIntegraciones } from "./config-integraciones";

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

      <ConfigIntegraciones />
    </div>
  );
}
