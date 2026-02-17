import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientesTable } from "./clientes-table";

export default function ClientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Leads convertidos con servicio activo</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado de clientes</CardTitle>
          <CardDescription>Clientes con servicio activo. Desde acá podés ir a proyectos e instalaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientesTable />
        </CardContent>
      </Card>
    </div>
  );
}
