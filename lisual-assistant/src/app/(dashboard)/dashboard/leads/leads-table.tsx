import { getLeads } from "@/lib/actions/leads";
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
import { LeadsTableActions } from "./leads-table-actions";
import { Users } from "lucide-react";

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  prospecto: "secondary",
  negociacion: "default",
  convertido: "outline",
  perdido: "destructive",
};

const canalLabels: Record<string, string> = {
  reunion: "Reunión",
  manual: "Manual",
  web: "Web",
  whatsapp: "WhatsApp",
  referencia: "Referencia",
};

export async function LeadsTable() {
  let leads: Awaited<ReturnType<typeof getLeads>> = [];
  try {
    leads = await getLeads();
  } catch (e) {
    return (
      <p className="text-sm text-destructive">
        Error al cargar leads. Verifica que las tablas existan en Supabase y que RLS permita el acceso.
      </p>
    );
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No hay leads"
        description="Usa el botón Nuevo Lead arriba para crear tu primer prospecto."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.id}>
            <TableCell className="font-medium">{lead.nombre}</TableCell>
            <TableCell>{lead.empresa || "-"}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{canalLabels[lead.canal_origen] ?? lead.canal_origen}</TableCell>
            <TableCell>
              <Badge variant={estadoVariant[lead.estado] ?? "secondary"}>
                {lead.estado}
              </Badge>
            </TableCell>
            <TableCell>
              <LeadsTableActions lead={lead} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
