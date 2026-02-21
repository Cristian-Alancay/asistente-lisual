"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getPersonalConfig, setPersonalConfig } from "@/lib/actions/config-personal";
import {
  type PersonalConfig,
  DEFAULT_VALUES,
} from "@/lib/config-personal-defaults";
import { toast } from "sonner";

export function PersonalConfigForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<Partial<PersonalConfig>>(DEFAULT_VALUES);

  async function load() {
    setLoading(true);
    try {
      const data = await getPersonalConfig();
      setConfig((prev) => ({ ...DEFAULT_VALUES, ...prev, ...data }));
    } catch {
      setConfig(DEFAULT_VALUES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await setPersonalConfig(config);
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="config-timezone">Zona horaria</Label>
          <Input
            id="config-timezone"
            value={config.timezone ?? ""}
            onChange={(e) => setConfig((c) => ({ ...c, timezone: e.target.value }))}
            placeholder="America/Argentina/Buenos_Aires"
          />
          <p className="text-xs text-muted-foreground">
            Ej. America/Argentina/Buenos_Aires para Argentina
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="config-hora">Hora de recordatorios</Label>
          <Input
            id="config-hora"
            type="time"
            value={config.hora_recordatorio ?? "09:00"}
            onChange={(e) =>
              setConfig((c) => ({ ...c, hora_recordatorio: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Hora preferida para recordatorios de tareas/eventos
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <Label htmlFor="config-recordatorios">Recordatorios activos</Label>
          <p className="text-xs text-muted-foreground">
            Activar recordatorios para tareas y eventos personales
          </p>
        </div>
        <Checkbox
          id="config-recordatorios"
          checked={config.recordatorios_activos === "true"}
          onCheckedChange={(checked) =>
            setConfig((c) => ({
              ...c,
              recordatorios_activos: checked === true ? "true" : "false",
            }))
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="config-notas-pagina">Notas por página</Label>
        <Input
          id="config-notas-pagina"
          type="number"
          min={5}
          max={100}
          value={config.notas_por_pagina ?? "20"}
          onChange={(e) =>
            setConfig((c) => ({ ...c, notas_por_pagina: e.target.value || "20" }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Cantidad de notas a mostrar por página en el listado
        </p>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar configuración"}
      </Button>
    </form>
  );
}
