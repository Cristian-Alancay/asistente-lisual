import { useQuery } from "@tanstack/react-query";
import * as planService from "@/services/planificacion";

export const planificacionKeys = {
  reunionesHoy: ["planificacion", "reuniones-hoy"] as const,
  seguimientosHoy: ["planificacion", "seguimientos-hoy"] as const,
};

export function useReunionesHoy() {
  return useQuery({
    queryKey: planificacionKeys.reunionesHoy,
    queryFn: planService.getReunionesHoy,
  });
}

export function useSeguimientosHoy() {
  return useQuery({
    queryKey: planificacionKeys.seguimientosHoy,
    queryFn: planService.getSeguimientosHoy,
  });
}
