import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalConfigForm } from "./personal-config-form";

export default function PersonalConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Ajustes del contexto Cristian Alancay (personal). Se guardan en la base de datos.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Preferencias personales</CardTitle>
          <CardDescription>
            Zona horaria, recordatorios y preferencias de listado. Solo afectan este contexto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalConfigForm />
        </CardContent>
      </Card>
    </div>
  );
}
