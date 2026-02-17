"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRevision } from "@/lib/actions/experiencia";
import { useClientes } from "@/lib/hooks/use-clientes";
import { Plus } from "lucide-react";

const TIPO_OPCIONES = [
  { value: "semana1", label: "Semana 1" },
  { value: "mes1", label: "Mes 1" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
];

export function RevisionDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState("");
  const router = useRouter();
  const clientes = useClientes();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const programada_para = (form.elements.namedItem("programada_para") as HTMLInputElement)?.value;
    const notas = (form.elements.namedItem("notas") as HTMLTextAreaElement)?.value;

    if (!clienteId || !tipo || !programada_para) {
      setError("Cliente, tipo y fecha son requeridos");
      setLoading(false);
      return;
    }

    try {
      await createRevision({
        cliente_id: clienteId,
        tipo,
        programada_para,
        notas: notas || undefined,
      });
      setOpen(false);
      setClienteId("");
      setTipo("");
      router.refresh();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear revisión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva revisión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva revisión periódica</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="cliente_id">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => {
                  const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
                  const label = lead ? `${lead.nombre}${lead.empresa ? ` (${lead.empresa})` : ""}` : c.id;
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de revisión *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPCIONES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="programada_para">Fecha programada *</Label>
            <Input id="programada_para" name="programada_para" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" placeholder="Observaciones o recordatorios" rows={3} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
