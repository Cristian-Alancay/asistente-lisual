import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useResumenAlertasProactivas } from "@/hooks/use-notificaciones";
import { prefixedKey } from "@/lib/storage-keys";

const STORAGE_KEY = prefixedKey("proactive-alerts-shown");
const LEGACY_STORAGE_KEY = "proactive-alerts-shown";
const LEGACY_PREFIXED_KEY = "lisual_proactive-alerts-shown";
const COOLDOWN_MS = 60 * 60 * 1000;

export function ProactiveAlerts() {
  const navigate = useNavigate();
  const shown = useRef(false);
  const { data: resumen } = useResumenAlertasProactivas();

  useEffect(() => {
    if (shown.current || !resumen || resumen.total === 0) return;
    shown.current = true;

    const lastShown =
      sessionStorage.getItem(STORAGE_KEY) ??
      sessionStorage.getItem(LEGACY_PREFIXED_KEY) ??
      sessionStorage.getItem(LEGACY_STORAGE_KEY);
    const lastTime = lastShown ? parseInt(lastShown, 10) : 0;
    if (Date.now() - lastTime < COOLDOWN_MS) return;

    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));

    const goTo = (path: string) => () => navigate(path);

    if (resumen.seguimientosHoy > 0) {
      toast.info("Seguimientos pendientes hoy", {
        description: `Tienes ${resumen.seguimientosHoy} seguimiento${resumen.seguimientosHoy > 1 ? "s" : ""} programado${resumen.seguimientosHoy > 1 ? "s" : ""} para hoy.`,
        action: { label: "Ver planificacion", onClick: goTo("/dashboard/planificacion") },
        duration: 8000,
      });
    }

    if (resumen.presupuestosVencenHoy > 0) {
      toast.warning("Presupuestos vencen hoy", {
        description: `${resumen.presupuestosVencenHoy} presupuesto${resumen.presupuestosVencenHoy > 1 ? "s" : ""} vence${resumen.presupuestosVencenHoy === 1 ? "" : "n"} hoy.`,
        action: { label: "Ver presupuestos", onClick: goTo("/dashboard/presupuestos") },
        duration: 8000,
      });
    }

    if (resumen.presupuestosVencen > 0 && resumen.presupuestosVencenHoy === 0) {
      toast.warning("Presupuestos por vencer", {
        description: `${resumen.presupuestosVencen} presupuesto${resumen.presupuestosVencen > 1 ? "s" : ""} en los proximos 7 dias.`,
        action: { label: "Ver presupuestos", onClick: goTo("/dashboard/presupuestos") },
        duration: 6000,
      });
    }

    if (resumen.instalaciones > 0 && resumen.seguimientosHoy === 0 && resumen.presupuestosVencenHoy === 0) {
      toast("Instalaciones programadas", {
        description: `${resumen.instalaciones} instalacion${resumen.instalaciones > 1 ? "es" : ""} en los proximos 7 dias.`,
        action: { label: "Ver operaciones", onClick: goTo("/dashboard/operaciones") },
        duration: 6000,
      });
    }

    if (resumen.revisiones > 0 && resumen.seguimientosHoy === 0 && resumen.presupuestosVencenHoy === 0 && resumen.instalaciones === 0) {
      toast("Revisiones pendientes", {
        description: `${resumen.revisiones} revision${resumen.revisiones > 1 ? "es" : ""} programada${resumen.revisiones > 1 ? "s" : ""} esta semana.`,
        action: { label: "Ver experiencia", onClick: goTo("/dashboard/experiencia") },
        duration: 6000,
      });
    }
  }, [resumen, navigate]);

  return null;
}
