import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { usePersonalNotas, useCrearPersonalNota, useActualizarPersonalNota, useEliminarPersonalNota } from "@/hooks/use-personal";
import { toast } from "sonner";
import { useLocale } from "@/contexts/locale-context";

type Nota = { id: string; titulo: string; contenido: string | null; updated_at: string };

function PersonalNotasList() {
  const { data: notas, isLoading } = usePersonalNotas();
  const crearNota = useCrearPersonalNota();
  const actualizarNota = useActualizarPersonalNota();
  const eliminarNota = useEliminarPersonalNota();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Nota | null>(null);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");

  function openNew() { setEditing(null); setTitulo(""); setContenido(""); setOpen(true); }
  function openEdit(n: Nota) { setEditing(n); setTitulo(n.titulo); setContenido(n.contenido ?? ""); setOpen(true); }

  async function handleSave() {
    const t = titulo.trim();
    if (!t) { toast.error("El título es obligatorio"); return; }
    try {
      if (editing) {
        await actualizarNota.mutateAsync({ id: editing.id, titulo: t, contenido });
        toast.success("Nota actualizada");
      } else {
        await crearNota.mutateAsync({ titulo: t, contenido });
        toast.success("Nota creada");
      }
      setOpen(false);
    } catch { toast.error("Error al guardar"); }
  }

  async function handleDelete(id: string) {
    try { await eliminarNota.mutateAsync(id); toast.success("Nota eliminada"); }
    catch { toast.error("Error al eliminar"); }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Cargando...</p>;
  const items = (notas ?? []) as Nota[];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Nueva nota</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar nota" : "Nueva nota"}</DialogTitle><DialogDescription>Título y contenido (opcional).</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2"><Label htmlFor="nota-titulo">Título</Label><Input id="nota-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título de la nota" /></div>
              <div className="space-y-2"><Label htmlFor="nota-contenido">Contenido</Label><Textarea id="nota-contenido" value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Contenido..." rows={5} className="resize-none" /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={crearNota.isPending || actualizarNota.isPending || !titulo.trim()}>{editing ? "Guardar" : "Crear"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <ul className="space-y-2">
        {items.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Sin notas</p> : items.map((n) => (
          <li key={n.id} className="group flex items-start gap-2 rounded-lg border p-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{n.titulo}</p>
              {n.contenido && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.contenido}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{new Date(n.updated_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PersonalNotasPage() {
  const { tp } = useLocale();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">{tp.personalNotesTitle}</h1><p className="text-muted-foreground">Notas personales compartidas (Cristian Alancay).</p></div>
      <Card><CardHeader><CardTitle>Listado</CardTitle><CardDescription>Creá y editá notas</CardDescription></CardHeader><CardContent><PersonalNotasList /></CardContent></Card>
    </div>
  );
}
