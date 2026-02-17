import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Leads convertidos con servicio activo</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>Fase 1 - Listado y detalle de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </CardContent>
      </Card>
    </div>
  );
}
