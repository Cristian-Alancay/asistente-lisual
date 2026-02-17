"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PresupuestoForm } from "@/components/forms/presupuesto-form";
import {
  updatePresupuesto,
  updatePresupuestoEstado,
  deletePresupuesto,
  type getPresupuestos,
} from "@/lib/actions/presupuestos";
import { useLeads } from "@/lib/hooks/use-leads";
import { useRole } from "@/components/dashboard/role-provider";
import type { PresupuestoFormData } from "@/lib/validations/presupuesto";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

type Presupuesto = Awaited<ReturnType<typeof getPresupuestos>>[number];

export function PresupuestosTableActions({ presupuesto }: { presupuesto: Presupuesto }) {
  const { canEdit } = useRole();
  const [editOpen, setEditOpen] = useState(false);
  const leads = useLeads();

  if (!canEdit) return <span className="text-muted-foreground">—</span>;
  const leadOptions = leads.map((l) => ({ id: l.id, nombre: l.nombre, empresa: l.empresa }));

  const items = (presupuesto.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [];

  const defaultValues: Partial<PresupuestoFormData> = {
    lead_id: presupuesto.lead_id,
    numero: presupuesto.numero,
    fecha_emision: presupuesto.fecha_emision,
    vigencia_hasta: presupuesto.vigencia_hasta,
    items: items.length ? items : [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
    moneda: presupuesto.moneda,
    estado: presupuesto.estado,
  };

  async function handleUpdate(data: PresupuestoFormData) {
    await updatePresupuesto(presupuesto.id, data);
    toast.success("Presupuesto actualizado");
    setEditOpen(false);
  }

  async function handleEstado(estado: PresupuestoFormData["estado"]) {
    await updatePresupuestoEstado(presupuesto.id, estado);
    toast.success(`Estado actualizado a ${estado}`);
  }

  async function handleDelete() {
    if (confirm("¿Eliminar este presupuesto?")) {
      await deletePresupuesto(presupuesto.id);
      toast.success("Presupuesto eliminado");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {presupuesto.estado === "borrador" && (
            <DropdownMenuItem onClick={() => handleEstado("enviado")}>
              Marcar como Enviado
            </DropdownMenuItem>
          )}
          {presupuesto.estado === "enviado" && (
            <>
              <DropdownMenuItem onClick={() => handleEstado("aceptado")}>
                Marcar como Aceptado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEstado("rechazado")}>
                Marcar como Rechazado
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar presupuesto</DialogTitle>
          </DialogHeader>
          <PresupuestoForm
            leads={leadOptions}
            defaultValues={defaultValues}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            submitLabel="Guardar"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
