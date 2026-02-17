import { getPresupuestos } from "@/lib/actions/presupuestos";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PresupuestosTableActions } from "./presupuestos-table-actions";
import { FileText } from "lucide-react";

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary",
  enviado: "default",
  aceptado: "outline",
  rechazado: "destructive",
  vencido: "destructive",
};

const estadoLabels: Record<string, string> = {
  borrador: "Borrador",
  enviado: "Enviado",
  aceptado: "Aceptado",
  rechazado: "Rechazado",
  vencido: "Vencido",
};

export async function PresupuestosTable() {
  let data: Awaited<ReturnType<typeof getPresupuestos>> = [];
  try {
    data = await getPresupuestos();
  } catch {
    return <p className="text-sm text-destructive">Error al cargar presupuestos.</p>;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay presupuestos"
        description="Crea tu primer presupuesto con el botón Nuevo presupuesto."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead>Lead</TableHead>
          <TableHead>Emisión</TableHead>
          <TableHead>Vigencia</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((p) => {
          const lead = Array.isArray(p.leads) ? p.leads[0] : p.leads;
          const nombre = lead?.nombre ?? "-";
          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.numero}</TableCell>
              <TableCell>{nombre}</TableCell>
              <TableCell>{new Date(p.fecha_emision).toLocaleDateString("es-AR")}</TableCell>
              <TableCell>{new Date(p.vigencia_hasta).toLocaleDateString("es-AR")}</TableCell>
              <TableCell>
                {p.moneda} {Number(p.total).toLocaleString("es-AR")}
              </TableCell>
              <TableCell>
                <Badge variant={estadoVariant[p.estado] ?? "secondary"}>
                  {estadoLabels[p.estado] ?? p.estado}
                </Badge>
              </TableCell>
              <TableCell>
                <PresupuestosTableActions presupuesto={p} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
