import { getRevisiones } from "@/lib/actions/experiencia";
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
import { CalendarCheck } from "lucide-react";

const tipoLabels: Record<string, string> = {
  semana1: "Semana 1",
  mes1: "Mes 1",
  trimestral: "Trimestral",
  semestral: "Semestral",
};

export async function RevisionesTable() {
  let data: Awaited<ReturnType<typeof getRevisiones>> = [];
  try {
    data = await getRevisiones();
  } catch {
    return (
      <p className="text-sm text-destructive py-4">
        Error al cargar. Verifica la migración 005.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Sin revisiones"
        description="No hay revisiones programadas."
        action={{ label: "Ver experiencia", href: "/dashboard/experiencia" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Programada para</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((r) => {
          const cliente = Array.isArray(r.clientes) ? r.clientes[0] : r.clientes;
          const lead = cliente?.leads;
          const nombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-";
          return (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{nombre}</TableCell>
              <TableCell>{tipoLabels[r.tipo] ?? r.tipo}</TableCell>
              <TableCell>
                {new Date(r.programada_para).toLocaleDateString("es-AR")}
              </TableCell>
              <TableCell>
                {r.realizada_at ? (
                  <Badge variant="outline">Realizada</Badge>
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
