"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PresupuestoForm } from "@/components/forms/presupuesto-form";
import { createPresupuesto, getProximoNumero } from "@/lib/actions/presupuestos";
import { useLeads } from "@/lib/hooks/use-leads";
import { useRole } from "@/components/dashboard/role-provider";
import { Plus } from "lucide-react";

export function PresupuestosHeader() {
  const { canEdit } = useRole();
  const [open, setOpen] = useState(false);
  const [proximoNumero, setProximoNumero] = useState("");
  const leads = useLeads();

  useEffect(() => {
    if (open) getProximoNumero().then(setProximoNumero).catch(() => {});
  }, [open]);

  async function handleCreate(data: Parameters<Parameters<typeof PresupuestoForm>[0]["onSubmit"]>[0]) {
    await createPresupuesto({
      ...data,
      numero: data.numero || proximoNumero || `PRE-${new Date().getFullYear()}-001`,
    });
    toast.success("Presupuesto creado");
    setOpen(false);
  }

  const leadOptions = leads.map((l) => ({ id: l.id, nombre: l.nombre, empresa: l.empresa }));

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Presupuestos</h1>
        <p className="text-muted-foreground">Crea y gestiona presupuestos para leads</p>
      </div>
      {canEdit && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo presupuesto
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo presupuesto</DialogTitle>
          </DialogHeader>
          <PresupuestoForm
            leads={leadOptions}
            defaultValues={{ numero: proximoNumero }}
            onSubmit={handleCreate}
            onCancel={() => setOpen(false)}
            submitLabel="Crear presupuesto"
          />
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}
