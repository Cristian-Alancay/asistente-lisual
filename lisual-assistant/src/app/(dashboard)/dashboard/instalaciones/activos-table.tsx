import { getActivos } from "@/lib/actions/operaciones";
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
import { Package } from "lucide-react";

const tipoLabels: Record<string, string> = {
  camara: "Cámara",
  chip: "Chip",
  teleport: "Teleport",
};

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  en_stock: "secondary",
  asignado: "default",
  instalado: "outline",
  en_distribucion: "destructive",
};

export async function ActivosTable() {
  let activos: Awaited<ReturnType<typeof getActivos>> = [];
  try {
    activos = await getActivos();
  } catch {
    return (
      <p className="text-sm text-destructive py-4">
        Error al cargar activos. Verifica la migración 004.
      </p>
    );
  }

  if (activos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Sin equipos"
        description="No hay equipos registrados. Haz clic en Nuevo equipo para agregar."
        action={{ label: "Ver instalaciones", href: "/dashboard/instalaciones" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Código</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Proyecto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Nº serie / ICCID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activos.map((a) => {
          const proyecto = Array.isArray(a.proyectos) ? a.proyectos[0] : a.proyectos;
          return (
            <TableRow key={a.id}>
              <TableCell className="font-medium">{a.codigo}</TableCell>
              <TableCell>{tipoLabels[a.tipo] ?? a.tipo}</TableCell>
              <TableCell>{proyecto?.nombre ?? "-"}</TableCell>
              <TableCell>
                <Badge variant={estadoVariant[a.estado] ?? "secondary"}>{a.estado}</Badge>
              </TableCell>
              <TableCell>{a.numero_serie || a.iccid || "-"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
