import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PresupuestosHeader } from "./presupuestos-header";
import { PresupuestosTable } from "./presupuestos-table";

export default function PresupuestosPage() {
  return (
    <div className="space-y-6">
      <PresupuestosHeader />
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Presupuestos con lead, fechas y estado</CardDescription>
        </CardHeader>
        <CardContent>
          <PresupuestosTable />
        </CardContent>
      </Card>
    </div>
  );
}
