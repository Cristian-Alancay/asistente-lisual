"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeadForm } from "@/components/forms/lead-form";
import { createLead } from "@/lib/actions/leads";
import { Plus } from "lucide-react";

export function LeadsHeader() {
  const [open, setOpen] = useState(false);

  async function handleCreate(data: Parameters<Parameters<typeof LeadForm>[0]["onSubmit"]>[0]) {
    await createLead(data);
    toast.success("Lead creado correctamente");
    setOpen(false);
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">Gestiona tus prospectos y contactos</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Lead</DialogTitle>
          </DialogHeader>
          <LeadForm
            onSubmit={handleCreate}
            onCancel={() => setOpen(false)}
            submitLabel="Crear Lead"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
