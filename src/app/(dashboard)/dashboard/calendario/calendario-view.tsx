"use client";

import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getEventosMes, type EventoCalendario } from "@/lib/actions/calendario";
import { Calendar as CalendarIcon, Video, Wrench, Bell, ClipboardCheck } from "lucide-react";

const tipoIcon: Record<EventoCalendario["tipo"], React.ReactNode> = {
  reunion: <CalendarIcon className="h-4 w-4" />,
  instalacion: <Wrench className="h-4 w-4" />,
  seguimiento: <Bell className="h-4 w-4" />,
  revision: <ClipboardCheck className="h-4 w-4" />,
  solicitud_video: <Video className="h-4 w-4" />,
};

const tipoLabel: Record<EventoCalendario["tipo"], string> = {
  reunion: "Reunión",
  instalacion: "Instalación",
  seguimiento: "Seguimiento",
  revision: "Revisión",
  solicitud_video: "Video",
};

export function CalendarioView() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoy, setHoy] = useState<Date | null>(null);

  useEffect(() => {
    const now = new Date();
    setHoy(now);
    setDate(now);
  }, []);

  const mes = date ? date.getMonth() + 1 : 1;
  const ano = date ? date.getFullYear() : 2026;

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });
    getEventosMes(ano, mes)
      .then((data) => { if (!cancelled) setEventos(data); })
      .catch(() => { if (!cancelled) setEventos([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ano, mes, date]);

  const fechaSel = date?.toISOString().split("T")[0];
  const eventosDelDia = eventos.filter((e) => e.fecha === fechaSel);

  const diasSemana = useMemo(() => {
    if (!hoy) return [];
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicioSemana);
      d.setDate(inicioSemana.getDate() + i);
      return d;
    });
  }, [hoy]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
          <CardDescription>Selecciona un día para ver los eventos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hoy && diasSemana.length > 0 && (
            <div className="rounded-lg border p-2">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Semana actual</p>
              <div className="flex gap-1 overflow-x-auto">
                {diasSemana.map((d) => {
                  const df = d.toISOString().split("T")[0];
                  const count = eventos.filter((e) => e.fecha === df).length;
                  const isSelected = df === fechaSel;
                  const isToday = df === hoy.toISOString().split("T")[0];
                  return (
                    <button
                      key={df}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`flex min-w-[44px] flex-col items-center rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent ${
                        isSelected ? "bg-primary text-primary-foreground" : ""
                      } ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}
                    >
                      <span className="font-medium">{d.getDate()}</span>
                      <span className="text-[10px] opacity-80">
                        {d.toLocaleDateString("es-AR", { weekday: "short" }).slice(0, 2)}
                      </span>
                      {count > 0 && (
                        <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px]">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
            fromYear={2024}
            toYear={2030}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {fechaSel
              ? new Date(fechaSel + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })
              : "Eventos del día"}
          </CardTitle>
          <CardDescription>
            {fechaSel ? `${eventosDelDia.length} evento(s)` : "Selecciona un día"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : eventosDelDia.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {fechaSel ? "No hay eventos este día" : "Selecciona un día del calendario"}
            </p>
          ) : (
            <ul className="space-y-2">
              {eventosDelDia.map((e) => (
                <li
                  key={`${e.tipo}-${e.id}`}
                  className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                >
                  <span className="mt-0.5 text-muted-foreground">{tipoIcon[e.tipo]}</span>
                  <div>
                    <p className="font-medium">{e.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {tipoLabel[e.tipo]}
                      {e.fechaHora
                        ? ` · ${new Date(e.fechaHora).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
