import { useQuery } from "@tanstack/react-query";
import * as notifService from "@/services/notificaciones";

export const notificacionesKeys = {
  list: (limit?: number) => ["notificaciones", { limit }] as const,
  resumen: ["notificaciones", "resumen"] as const,
};

export function useNotificaciones(limit = 10) {
  return useQuery({
    queryKey: notificacionesKeys.list(limit),
    queryFn: () => notifService.getNotificaciones(limit),
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useResumenAlertasProactivas() {
  return useQuery({
    queryKey: notificacionesKeys.resumen,
    queryFn: notifService.getResumenAlertasProactivas,
    staleTime: 60_000,
  });
}
