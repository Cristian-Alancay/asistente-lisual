import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tareaService from "@/services/tareas";

export const tareasKeys = {
  hoy: ["tareas", "hoy"] as const,
};

export function useTareasHoy() {
  return useQuery({
    queryKey: tareasKeys.hoy,
    queryFn: tareaService.getTareasHoy,
  });
}

export function useCrearTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ titulo, fecha }: { titulo: string; fecha?: string }) =>
      tareaService.crearTarea(titulo, fecha),
    onSuccess: () => qc.invalidateQueries({ queryKey: tareasKeys.hoy }),
  });
}

export function useToggleTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tareaService.toggleTareaCompletada(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tareasKeys.hoy }),
  });
}

export function useEliminarTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tareaService.eliminarTarea(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: tareasKeys.hoy }),
  });
}
