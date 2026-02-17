"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  getTareasHoy,
  crearTarea,
  toggleTareaCompletada,
  eliminarTarea,
} from "@/lib/actions/tareas";
import { toast } from "sonner";

type Tarea = Awaited<ReturnType<typeof getTareasHoy>>[number];

export function TareasDelDia() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getTareasHoy();
      setTareas(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    const titulo = nueva.trim();
    if (!titulo) return;
    setAdding(true);
    try {
      await crearTarea(titulo);
      setNueva("");
      toast.success("Tarea agregada");
      await load();
    } catch {
      toast.error("Error al agregar");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(id: string) {
    try {
      await toggleTareaCompletada(id);
      await load();
    } catch {
      toast.error("Error al actualizar");
    }
  }

  async function handleDelete(id: string) {
    try {
      await eliminarTarea(id);
      toast.success("Tarea eliminada");
      await load();
    } catch {
      toast.error("Error al eliminar");
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nueva tarea..."
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button size="icon" onClick={handleAdd} disabled={adding || !nueva.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {tareas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Sin tareas para hoy</p>
        ) : (
          tareas.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-2 rounded-lg border px-3 py-2 group"
            >
              <Checkbox
                checked={t.completada}
                onCheckedChange={() => handleToggle(t.id)}
              />
              <span
                className={`flex-1 text-sm ${t.completada ? "line-through text-muted-foreground" : ""}`}
              >
                {t.titulo}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
