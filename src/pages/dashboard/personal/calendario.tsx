import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { useEventosPersonalesMes, useCrearPersonalEvento, useEliminarPersonalEvento } from "@/hooks/use-personal";
import { toast } from "sonner";
import { useLocale } from "@/contexts/locale-context";

type PersonalEvento = { id: string; titulo: string; fecha_inicio: string; fecha_fin: string; descripcion?: string | null };

function eventFechas(e: PersonalEvento): string[] {
  const start = new Date(e.fecha_inicio); const end = new Date(e.fecha_fin); const dates: string[] = [];
  const d = new Date(start); d.setHours(0, 0, 0, 0); const endDay = new Date(end); endDay.setHours(0, 0, 0, 0);
  while (d <= endDay) { dates.push(d.toISOString().split("T")[0]); d.setDate(d.getDate() + 1); }
  return dates;
}

export default function PersonalCalendarioPage() {
  const { tp } = useLocale();
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [hoy] = useState(() => new Date());
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaInicio, setNuevaInicio] = useState("");
  const [nuevaFin, setNuevaFin] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");

  const mes = date ? date.getMonth() + 1 : 1;
  const ano = date ? date.getFullYear() : 2026;
  const { data: eventos, isLoading } = useEventosPersonalesMes(ano, mes);
  const crearEvento = useCrearPersonalEvento();
  const eliminarEvento = useEliminarPersonalEvento();

  const allEventos = (eventos ?? []) as PersonalEvento[];
  const fechaSel = date?.toISOString().split("T")[0];
  const eventosDelDia = fechaSel ? allEventos.filter((e) => eventFechas(e).includes(fechaSel)) : [];

  const countByDate: Record<string, number> = {};
  allEventos.forEach((e) => eventFechas(e).forEach((d) => { countByDate[d] = (countByDate[d] ?? 0) + 1; }));

  const diasSemana = useMemo(() => {
    if (!hoy) return [];
    const inicioSemana = new Date(hoy); inicioSemana.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1));
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(inicioSemana); d.setDate(inicioSemana.getDate() + i); return d; });
  }, [hoy]);

  async function handleDelete(id: string) {
    try { await eliminarEvento.mutateAsync(id); toast.success("Evento eliminado"); }
    catch { toast.error("Error al eliminar"); }
  }

  async function handleCrear() {
    const titulo = nuevoTitulo.trim();
    if (!titulo || !nuevaInicio || !nuevaFin) { toast.error("Completá título, inicio y fin"); return; }
    try {
      await crearEvento.mutateAsync({ titulo, fecha_inicio: new Date(nuevaInicio).toISOString(), fecha_fin: new Date(nuevaFin).toISOString(), descripcion: nuevaDesc.trim() || undefined });
      toast.success("Evento creado"); setNuevoTitulo(""); setNuevaInicio(""); setNuevaFin(""); setNuevaDesc("");
    } catch { toast.error("Error al crear"); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">{tp.personalCalendarTitle}</h1><p className="text-muted-foreground">Eventos personales (Cristian Alancay).</p></div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Calendario</CardTitle><CardDescription>Selecciona un día para ver los eventos</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            {hoy && diasSemana.length > 0 && (
              <div className="rounded-lg border p-2">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Semana actual</p>
                <div className="flex gap-1 overflow-x-auto">
                  {diasSemana.map((d) => {
                    const df = d.toISOString().split("T")[0]; const count = countByDate[df] ?? 0; const isSelected = df === fechaSel; const isToday = df === hoy.toISOString().split("T")[0];
                    return (
                      <button key={df} type="button" onClick={() => setDate(d)} className={`flex min-w-[44px] flex-col items-center rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent ${isSelected ? "bg-primary text-primary-foreground" : ""} ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}>
                        <span className="font-medium">{d.getDate()}</span><span className="text-[10px] opacity-80">{d.toLocaleDateString("es-AR", { weekday: "short" }).slice(0, 2)}</span>
                        {count > 0 && <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px]">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" fromYear={2024} toYear={2030} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{fechaSel ? new Date(fechaSel + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "Eventos del día"}</CardTitle>
            <CardDescription>{fechaSel ? `${eventosDelDia.length} evento(s)` : "Selecciona un día"}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p>
            : eventosDelDia.length === 0 ? <p className="text-sm text-muted-foreground">{fechaSel ? "No hay eventos este día" : "Selecciona un día"}</p>
            : (
              <ul className="space-y-2">
                {eventosDelDia.map((e) => (
                  <li key={e.id} className="group flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{e.titulo}</p>
                      <p className="text-xs text-muted-foreground">{new Date(e.fecha_inicio).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} – {new Date(e.fecha_fin).toLocaleString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                      {e.descripcion && <p className="mt-1 text-xs text-muted-foreground">{e.descripcion}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Nuevo evento</CardTitle><CardDescription>Título, fecha/hora inicio y fin</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2"><Label htmlFor="ev-titulo">Título</Label><Input id="ev-titulo" placeholder="Ej. Reunión médico" value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="ev-inicio">Inicio</Label><Input id="ev-inicio" type="datetime-local" value={nuevaInicio} onChange={(e) => setNuevaInicio(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="ev-fin">Fin</Label><Input id="ev-fin" type="datetime-local" value={nuevaFin} onChange={(e) => setNuevaFin(e.target.value)} /></div>
              <div className="flex items-end"><Button onClick={handleCrear} disabled={crearEvento.isPending || !nuevoTitulo.trim() || !nuevaInicio || !nuevaFin}><Plus className="mr-2 h-4 w-4" />Crear evento</Button></div>
            </div>
            <div className="space-y-2"><Label htmlFor="ev-desc">Descripción (opcional)</Label><Textarea id="ev-desc" placeholder="Notas del evento" value={nuevaDesc} onChange={(e) => setNuevaDesc(e.target.value)} rows={2} className="resize-none" /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
