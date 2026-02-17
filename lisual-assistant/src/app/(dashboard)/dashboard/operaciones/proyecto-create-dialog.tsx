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
import { createProyecto } from "@/lib/actions/operaciones";
import { useClientes } from "@/lib/hooks/use-clientes";
import { useRole } from "@/components/dashboard/role-provider";
import { Plus } from "lucide-react";

export function ProyectoCreateDialog() {
  const { canEdit } = useRole();
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
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement)?.value;
    const direccion = (form.elements.namedItem("direccion") as HTMLInputElement)?.value;
    const contacto_sitio = (form.elements.namedItem("contacto_sitio") as HTMLInputElement)?.value;
    const telefono_sitio = (form.elements.namedItem("telefono_sitio") as HTMLInputElement)?.value;
    const fecha_instalacion_programada = (form.elements.namedItem("fecha_instalacion_programada") as HTMLInputElement)?.value;

    if (!clienteId || !nombre) {
      setError("Cliente y nombre son requeridos");
      setLoading(false);
      return;
    }

    try {
      await createProyecto({
        cliente_id: clienteId,
        nombre,
        direccion: direccion || undefined,
        contacto_sitio: contacto_sitio || undefined,
        telefono_sitio: telefono_sitio || undefined,
        fecha_instalacion_programada: fecha_instalacion_programada || undefined,
      });
      setOpen(false);
      setClienteId("");
      router.refresh();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  }

  if (!canEdit) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo Proyecto</DialogTitle>
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
            <Label htmlFor="nombre">Nombre del proyecto *</Label>
            <Input id="nombre" name="nombre" placeholder="Instalación Oficina Centro" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" placeholder="Calle, número, ciudad" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contacto_sitio">Contacto en sitio</Label>
            <Input id="contacto_sitio" name="contacto_sitio" placeholder="Nombre y teléfono" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono_sitio">Teléfono sitio</Label>
            <Input id="telefono_sitio" name="telefono_sitio" placeholder="+54 11..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fecha_instalacion_programada">Fecha instalación programada</Label>
            <Input id="fecha_instalacion_programada" name="fecha_instalacion_programada" type="date" />
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
