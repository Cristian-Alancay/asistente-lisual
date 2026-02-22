import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useTareasHoy, useCrearTarea, useToggleTarea, useEliminarTarea } from "@/hooks/use-tareas";
import { toast } from "sonner";

export function TareasDelDia() {
  const { data: tareas, isLoading } = useTareasHoy();
  const crearTarea = useCrearTarea();
  const toggleTarea = useToggleTarea();
  const eliminarTarea = useEliminarTarea();
  const [nueva, setNueva] = useState("");

  async function handleAdd() {
    const titulo = nueva.trim();
    if (!titulo) return;
    try {
      await crearTarea.mutateAsync({ titulo });
      setNueva("");
      toast.success("Tarea agregada");
    } catch {
      toast.error("Error al agregar");
    }
  }

  async function handleToggle(id: string) {
    try { await toggleTarea.mutateAsync(id); }
    catch { toast.error("Error al actualizar"); }
  }

  async function handleDelete(id: string) {
    try {
      await eliminarTarea.mutateAsync(id);
      toast.success("Tarea eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  const items = tareas ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Nueva tarea..." value={nueva} onChange={(e) => setNueva(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button size="icon" onClick={handleAdd} disabled={crearTarea.isPending || !nueva.trim()}><Plus className="h-4 w-4" /></Button>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Sin tareas para hoy</p>
        ) : items.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 group">
            <Checkbox checked={t.completada} onCheckedChange={() => handleToggle(t.id)} />
            <span className={`flex-1 text-sm ${t.completada ? "line-through text-muted-foreground" : ""}`}>{t.titulo}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(t.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
