import { getProyectos } from "@/lib/actions/operaciones";
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
import { FolderKanban } from "lucide-react";

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pendiente: "secondary",
  programada: "default",
  en_proceso: "outline",
  completada: "outline",
  atrasada: "destructive",
};

export async function ProyectosTable() {
  let proyectos: Awaited<ReturnType<typeof getProyectos>> = [];
  try {
    proyectos = await getProyectos();
  } catch (e) {
    return (
      <p className="text-sm text-destructive py-4">
        Error al cargar proyectos. Verifica que la migración 004 esté aplicada en Supabase.
      </p>
    );
  }

  if (proyectos.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Sin proyectos"
        description="Crea un cliente primero (desde un lead convertido) y luego crea un proyecto."
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
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {proyectos.map((p) => {
          const cliente = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes;
          const lead = cliente?.leads;
          const clienteNombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-";
          return (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.nombre}</TableCell>
              <TableCell>{clienteNombre}</TableCell>
              <TableCell>
                {p.fecha_instalacion_programada
                  ? new Date(p.fecha_instalacion_programada).toLocaleDateString("es-AR")
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={estadoVariant[p.estado] ?? "secondary"}>{p.estado}</Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/instalaciones?proyecto=${p.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Ver instalación
                </Link>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
