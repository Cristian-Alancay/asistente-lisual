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
import { createSolicitudVideo } from "@/lib/actions/experiencia";
import { useClientes } from "@/lib/hooks/use-clientes";
import { Plus } from "lucide-react";

export function SolicitudVideoDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState("");
  const router = useRouter();
  const clientes = useClientes();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fecha_hora_video = (form.elements.namedItem("fecha_hora_video") as HTMLInputElement)?.value;
    const motivo = (form.elements.namedItem("motivo") as HTMLTextAreaElement)?.value;
    const duracion_min = (form.elements.namedItem("duracion_min") as HTMLInputElement)?.value;

    if (!clienteId || !fecha_hora_video) {
      setError("Cliente y fecha/hora del video son requeridos");
      setLoading(false);
      return;
    }

    try {
      await createSolicitudVideo({
        cliente_id: clienteId,
        fecha_hora_video,
        motivo: motivo || undefined,
        duracion_min: duracion_min ? parseInt(duracion_min, 10) : undefined,
      });
      setOpen(false);
      setClienteId("");
      router.refresh();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva solicitud
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitud de video</DialogTitle>
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
            <Label htmlFor="fecha_hora_video">Fecha y hora del video *</Label>
            <Input id="fecha_hora_video" name="fecha_hora_video" type="datetime-local" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo / detalle</Label>
            <Textarea id="motivo" name="motivo" placeholder="Ej: revisión cámaras zona parking" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duracion_min">Duración estimada (minutos)</Label>
            <Input id="duracion_min" name="duracion_min" type="number" min={1} placeholder="30" />
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
