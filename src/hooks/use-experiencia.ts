import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as expService from "@/services/experiencia";

export const experienciaKeys = {
  solicitudesVideo: (clienteId?: string) => ["solicitudes-video", { clienteId }] as const,
  revisiones: (clienteId?: string) => ["revisiones", { clienteId }] as const,
  referencias: ["referencias"] as const,
};

export function useSolicitudesVideo(clienteId?: string) {
  return useQuery({
    queryKey: experienciaKeys.solicitudesVideo(clienteId),
    queryFn: () => expService.getSolicitudesVideo(clienteId),
  });
}

export function useRevisiones(clienteId?: string) {
  return useQuery({
    queryKey: experienciaKeys.revisiones(clienteId),
    queryFn: () => expService.getRevisiones(clienteId),
  });
}

export function useReferencias() {
  return useQuery({
    queryKey: experienciaKeys.referencias,
    queryFn: expService.getReferencias,
  });
}

export function useCreateSolicitudVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expService.createSolicitudVideo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["solicitudes-video"] }),
  });
}

export function useUpdateSolicitudVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof expService.updateSolicitudVideo>[1] }) =>
      expService.updateSolicitudVideo(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["solicitudes-video"] }),
  });
}

export function useCreateRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expService.createRevision,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revisiones"] }),
  });
}

export function useMarcarRevisionRealizada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expService.marcarRevisionRealizada(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["revisiones"] }),
  });
}

export function useCreateReferencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expService.createReferencia,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referencias"] }),
  });
}

export function useActivarIncentivoReferencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expService.activarIncentivoReferencia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referencias"] }),
  });
}
