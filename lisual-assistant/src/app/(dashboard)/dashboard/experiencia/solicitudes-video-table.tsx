import { getSolicitudesVideo } from "@/lib/actions/experiencia";
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
import { Video } from "lucide-react";

const estadoVariant: Record<string, "default" | "secondary" | "outline"> = {
  pendiente: "secondary",
  en_proceso: "default",
  entregado: "outline",
};

export async function SolicitudesVideoTable() {
  let data: Awaited<ReturnType<typeof getSolicitudesVideo>> = [];
  try {
    data = await getSolicitudesVideo();
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
        icon={Video}
        title="Sin solicitudes"
        description="No hay solicitudes de video."
        action={{ label: "Ver experiencia", href: "/dashboard/experiencia" }}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Fecha/hora video</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((s) => {
          const cliente = Array.isArray(s.clientes) ? s.clientes[0] : s.clientes;
          const lead = cliente?.leads;
          const nombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-";
          return (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{nombre}</TableCell>
              <TableCell>
                {new Date(s.fecha_hora_video).toLocaleString("es-AR")}
              </TableCell>
              <TableCell>{s.motivo || "-"}</TableCell>
              <TableCell>
                <Badge variant={estadoVariant[s.estado] ?? "secondary"}>{s.estado}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
