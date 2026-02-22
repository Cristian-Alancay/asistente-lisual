import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { usePersonalTareas, useCrearPersonalTarea, useTogglePersonalTarea, useEliminarPersonalTarea } from "@/hooks/use-personal";
import { toast } from "sonner";
import { useLocale } from "@/contexts/locale-context";

function PersonalTareasList() {
  const { data: tareas, isLoading } = usePersonalTareas();
  const crearTarea = useCrearPersonalTarea();
  const toggleTarea = useTogglePersonalTarea();
  const eliminarTarea = useEliminarPersonalTarea();
  const [nueva, setNueva] = useState("");

  async function handleAdd() {
    const titulo = nueva.trim();
    if (!titulo) return;
    try { await crearTarea.mutateAsync({ titulo }); setNueva(""); toast.success("Tarea agregada"); }
    catch { toast.error("Error al agregar"); }
  }

  async function handleToggle(id: string) {
    try { await toggleTarea.mutateAsync(id); } catch { toast.error("Error al actualizar"); }
  }

  async function handleDelete(id: string) {
    try { await eliminarTarea.mutateAsync(id); toast.success("Tarea eliminada"); }
    catch { toast.error("Error al eliminar"); }
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
        {items.length === 0 ? <p className="py-2 text-sm text-muted-foreground">Sin tareas</p> : items.map((t) => (
          <li key={t.id} className="group flex items-center gap-2 rounded-lg border px-3 py-2">
            <Checkbox checked={t.completada} onCheckedChange={() => handleToggle(t.id)} />
            <span className={`flex-1 text-sm ${t.completada ? "text-muted-foreground line-through" : ""}`}>{t.titulo}</span>
            {t.fecha && <span className="text-xs text-muted-foreground">{new Date(t.fecha + "T12:00:00").toLocaleDateString("es-AR")}</span>}
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PersonalTareasPage() {
  const { tp } = useLocale();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">{tp.personalTasksTitle}</h1><p className="text-muted-foreground">Tareas personales compartidas (Cristian Alancay).</p></div>
      <Card><CardHeader><CardTitle>Listado</CardTitle><CardDescription>Agregá tareas y marcálas como completadas</CardDescription></CardHeader><CardContent><PersonalTareasList /></CardContent></Card>
    </div>
  );
}
