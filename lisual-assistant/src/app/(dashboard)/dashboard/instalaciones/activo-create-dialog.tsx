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
import { createActivo } from "@/lib/actions/operaciones";
import { useProyectos } from "@/lib/hooks/use-proyectos";
import { Plus } from "lucide-react";

export function ActivoCreateDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"camara" | "chip" | "teleport">("camara");
  const [proyectoId, setProyectoId] = useState<string>("");
  const [estado, setEstado] = useState<string>("en_stock");
  const router = useRouter();
  const proyectos = useProyectos();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const codigo = (form.elements.namedItem("codigo") as HTMLInputElement)?.value;
    const numero_serie = (form.elements.namedItem("numero_serie") as HTMLInputElement)?.value;
    const iccid = (form.elements.namedItem("iccid") as HTMLInputElement)?.value;
    const numero_telefono = (form.elements.namedItem("numero_telefono") as HTMLInputElement)?.value;

    if (!codigo) {
      setError("Código es requerido");
      setLoading(false);
      return;
    }

    try {
      await createActivo({
        proyecto_id: proyectoId || undefined,
        tipo,
        codigo,
        numero_serie: numero_serie || undefined,
        iccid: iccid || undefined,
        numero_telefono: numero_telefono || undefined,
        estado: proyectoId ? undefined : estado,
      });
      setOpen(false);
      setProyectoId("");
      router.refresh();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear equipo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo equipo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as "camara" | "chip" | "teleport")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="camara">Cámara</SelectItem>
                <SelectItem value="chip">Chip</SelectItem>
                <SelectItem value="teleport">Teleport</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="codigo">Código *</Label>
            <Input
              id="codigo"
              name="codigo"
              placeholder="CAM-ABC-001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numero_serie">Número de serie</Label>
            <Input id="numero_serie" name="numero_serie" placeholder="SN123456" />
          </div>
          {(tipo === "chip" || tipo === "teleport") && (
            <>
              <div className="space-y-2">
                <Label htmlFor="iccid">ICCID</Label>
                <Input id="iccid" name="iccid" placeholder="SIM card ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_telefono">Número de teléfono</Label>
                <Input id="numero_telefono" name="numero_telefono" placeholder="+54 11..." />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>Proyecto (opcional)</Label>
            <Select value={proyectoId} onValueChange={setProyectoId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {proyectos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!proyectoId && (
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_stock">En stock</SelectItem>
                  <SelectItem value="en_distribucion">En distribución</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
