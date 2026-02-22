import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as personalService from "@/services/personal";

export const personalKeys = {
  tareas: (fecha?: string) => ["personal", "tareas", { fecha }] as const,
  eventosMes: (ano: number, mes: number) => ["personal", "eventos", ano, mes] as const,
  notas: ["personal", "notas"] as const,
  proximos: ["personal", "proximos"] as const,
};

// --- Tareas ---

export function usePersonalTareas(fecha?: string) {
  return useQuery({
    queryKey: personalKeys.tareas(fecha),
    queryFn: () => personalService.getPersonalTareas(fecha),
  });
}

export function useCrearPersonalTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ titulo, fecha }: { titulo: string; fecha?: string }) =>
      personalService.crearPersonalTarea(titulo, fecha),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "tareas"] }),
  });
}

export function useTogglePersonalTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => personalService.togglePersonalTareaCompletada(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "tareas"] }),
  });
}

export function useEliminarPersonalTarea() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => personalService.eliminarPersonalTarea(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "tareas"] }),
  });
}

// --- Eventos ---

export function useEventosPersonalesMes(ano: number, mes: number) {
  return useQuery({
    queryKey: personalKeys.eventosMes(ano, mes),
    queryFn: () => personalService.getEventosPersonalesMes(ano, mes),
  });
}

export function useCrearPersonalEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: personalService.crearPersonalEvento,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "eventos"] }),
  });
}

export function useActualizarPersonalEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: Parameters<typeof personalService.actualizarPersonalEvento>[1] }) =>
      personalService.actualizarPersonalEvento(id, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "eventos"] }),
  });
}

export function useEliminarPersonalEvento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => personalService.eliminarPersonalEvento(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal", "eventos"] }),
  });
}

// --- Notas ---

export function usePersonalNotas() {
  return useQuery({
    queryKey: personalKeys.notas,
    queryFn: personalService.getPersonalNotas,
  });
}

export function useCrearPersonalNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ titulo, contenido }: { titulo: string; contenido?: string }) =>
      personalService.crearPersonalNota(titulo, contenido),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.notas }),
  });
}

export function useActualizarPersonalNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, titulo, contenido }: { id: string; titulo: string; contenido?: string }) =>
      personalService.actualizarPersonalNota(id, titulo, contenido),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.notas }),
  });
}

export function useEliminarPersonalNota() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => personalService.eliminarPersonalNota(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: personalKeys.notas }),
  });
}

// --- Proximos ---

export function useProximosPersonales() {
  return useQuery({
    queryKey: personalKeys.proximos,
    queryFn: personalService.getProximosPersonales,
    staleTime: 60_000,
  });
}
