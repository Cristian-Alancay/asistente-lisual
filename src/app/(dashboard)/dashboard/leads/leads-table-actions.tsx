"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { LeadForm } from "@/components/forms/lead-form";
import { updateLead, deleteLead } from "@/lib/actions/leads";
import { useRole } from "@/components/dashboard/role-provider";
import type { LeadFormData } from "@/lib/validations/lead";

type Lead = {
  id: string;
  nombre: string;
  empresa: string | null;
  email: string;
  telefono: string | null;
  canal_origen: string;
  estado: string;
  presupuesto_estimado: number | null;
  necesidad: string | null;
  fecha_decision_estimada: string | null;
  notas: string | null;
};

export function LeadsTableActions({ lead }: { lead: Lead }) {
  const { canEdit } = useRole();
  const [editOpen, setEditOpen] = useState(false);

  if (!canEdit) return <span className="text-muted-foreground">—</span>;

  const defaultValues: LeadFormData = {
    nombre: lead.nombre,
    empresa: lead.empresa ?? "",
    email: lead.email,
    telefono: lead.telefono ?? "",
    canal_origen: lead.canal_origen as LeadFormData["canal_origen"],
    estado: lead.estado as LeadFormData["estado"],
    presupuesto_estimado: lead.presupuesto_estimado ?? undefined,
    necesidad: lead.necesidad ?? "",
    fecha_decision_estimada: lead.fecha_decision_estimada ?? "",
    notas: lead.notas ?? "",
  };

  async function handleUpdate(data: LeadFormData) {
    await updateLead(lead.id, data);
    toast.success("Lead actualizado");
    setEditOpen(false);
  }

  async function handleDelete() {
    if (confirm("¿Eliminar este lead?")) {
      await deleteLead(lead.id);
      toast.success("Lead eliminado");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            defaultValues={defaultValues}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
