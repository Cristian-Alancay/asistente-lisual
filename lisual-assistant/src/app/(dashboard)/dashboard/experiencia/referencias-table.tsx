import { getReferencias } from "@/lib/actions/experiencia";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export async function ReferenciasTable() {
  let data: Awaited<ReturnType<typeof getReferencias>> = [];
  try {
    data = await getReferencias();
  } catch (e) {
    return (
      <p className="text-sm text-destructive py-4">
        Error al cargar. Verifica la migración 005.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Sin referencias"
        description="No hay referencias registradas. Los clientes pueden referir leads desde la experiencia."
        action={{ label: "Ver experiencia", href: "/dashboard/experiencia" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente referidor</TableHead>
          <TableHead>Lead referido</TableHead>
          <TableHead>Incentivo</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => {
          const cliente = Array.isArray(r.clientes) ? r.clientes[0] : r.clientes;
          const leadRef = cliente?.leads;
          const referidor = leadRef ? (Array.isArray(leadRef) ? leadRef[0]?.nombre : leadRef.nombre) : "-";
          const leadRefi = Array.isArray(r.leads) ? r.leads[0] : r.leads;
          const referido = leadRefi ? `${leadRefi.nombre} (${leadRefi.email})` : "-";
          return (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{referidor}</TableCell>
              <TableCell>{referido}</TableCell>
              <TableCell>{r.incentivo_ofrecido || "-"}</TableCell>
              <TableCell>
                {r.incentivo_activado_at ? (
                  <Badge variant="outline">Activado</Badge>
                ) : (
                  <Badge variant="secondary">Pendiente</Badge>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
