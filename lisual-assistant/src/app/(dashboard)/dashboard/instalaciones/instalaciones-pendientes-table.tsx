import { getInstalacionesPendientes } from "@/lib/actions/operaciones";
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
import Link from "next/link";
import { Wrench } from "lucide-react";

export async function InstalacionesPendientesTable() {
  let pendientes: Awaited<ReturnType<typeof getInstalacionesPendientes>> = [];
  try {
    pendientes = await getInstalacionesPendientes();
  } catch (e) {
    return (
      <p className="text-sm text-destructive py-4">
        Error al cargar. La vista v_instalaciones_pendientes requiere la migración 004.
      </p>
    );
  }

  if (pendientes.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Sin instalaciones pendientes"
        description="No hay instalaciones pendientes en este momento."
        action={{ label: "Ver operaciones", href: "/dashboard/operaciones" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Proyecto</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha programada</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Equipos en distribución</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pendientes.map((p) => (
          <TableRow key={p.proyecto_id}>
            <TableCell className="font-medium">{p.proyecto_nombre}</TableCell>
            <TableCell>
              {p.cliente_nombre}
              {p.cliente_empresa ? ` (${p.cliente_empresa})` : ""}
            </TableCell>
            <TableCell>
              {p.fecha_instalacion_programada
                ? new Date(p.fecha_instalacion_programada).toLocaleDateString("es-AR")
                : "-"}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{p.proyecto_estado}</Badge>
            </TableCell>
            <TableCell>
              {(p.equipos_en_distribucion ?? 0) > 0 ? (
                <Badge variant="secondary">{p.equipos_en_distribucion} en distribución</Badge>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/operaciones`}
                className="text-sm text-primary hover:underline"
              >
                Ver proyecto
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
