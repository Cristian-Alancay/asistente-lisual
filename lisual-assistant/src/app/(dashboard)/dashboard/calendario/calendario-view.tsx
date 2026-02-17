"use client";

import { useState, useEffect } from "react";
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);

  const mes = date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  const ano = date ? date.getFullYear() : new Date().getFullYear();

  useEffect(() => {
    setLoading(true);
    getEventosMes(ano, mes)
      .then(setEventos)
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, [ano, mes]);

  const fechaSel = date?.toISOString().split("T")[0];
  const eventosDelDia = eventos.filter((e) => e.fecha === fechaSel);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
          <CardDescription>Selecciona un día para ver los eventos</CardDescription>
        </CardHeader>
        <CardContent>
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
