import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PresupuestosHeader } from "./presupuestos-header";
import { PresupuestosTable } from "./presupuestos-table";

type Props = { searchParams?: { lead_id?: string } };

export default function PresupuestosPage({ searchParams }: Props) {
  const leadId = searchParams?.lead_id;

  return (
    <div className="space-y-6">
      <PresupuestosHeader />
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            {leadId ? "Presupuestos de este lead" : "Presupuestos con lead, fechas y estado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PresupuestosTable leadId={leadId} />
        </CardContent>
      </Card>
    </div>
  );
}
