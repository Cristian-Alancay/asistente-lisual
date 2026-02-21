"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import {
  getPersonalTareas,
  crearPersonalTarea,
  togglePersonalTareaCompletada,
  eliminarPersonalTarea,
} from "@/lib/actions/personal";
import type { PersonalTarea } from "@/lib/actions/personal";
import { toast } from "sonner";

export function PersonalTareasList() {
  const [tareas, setTareas] = useState<PersonalTarea[]>([]);
  const [loading, setLoading] = useState(true);
  const [nueva, setNueva] = useState("");
  const [adding, setAdding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getPersonalTareas();
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
      await crearPersonalTarea(titulo);
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
      await togglePersonalTareaCompletada(id);
      await load();
    } catch {
      toast.error("Error al actualizar");
    }
  }

  async function handleDelete(id: string) {
    try {
      await eliminarPersonalTarea(id);
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
          <p className="py-2 text-sm text-muted-foreground">Sin tareas</p>
        ) : (
          tareas.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-2 rounded-lg border px-3 py-2"
            >
              <Checkbox
                checked={t.completada}
                onCheckedChange={() => handleToggle(t.id)}
              />
              <span
                className={`flex-1 text-sm ${t.completada ? "text-muted-foreground line-through" : ""}`}
              >
                {t.titulo}
              </span>
              {t.fecha && (
                <span className="text-xs text-muted-foreground">
                  {new Date(t.fecha + "T12:00:00").toLocaleDateString("es-AR")}
                </span>
              )}
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
