import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as segService from "@/services/seguimientos";

export const seguimientosKeys = {
  pendientes: ["seguimientos", "pendientes"] as const,
};

export function useSeguimientosPendientes() {
  return useQuery({
    queryKey: seguimientosKeys.pendientes,
    queryFn: segService.getSeguimientosPendientes,
  });
}

export function useMarcarSeguimientoEjecutado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contenidoUsado }: { id: string; contenidoUsado?: "cont1" | "cont2" | "cont3" }) =>
      segService.marcarSeguimientoEjecutado(id, contenidoUsado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seguimientos"] });
      qc.invalidateQueries({ queryKey: ["planificacion"] });
    },
  });
}
