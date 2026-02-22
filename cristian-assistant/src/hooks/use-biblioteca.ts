import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/biblioteca";
import type { CasoExitoInsert, CasoExitoUpdate } from "@/services/biblioteca";

const keys = {
  all: ["casos-exito"] as const,
  detail: (id: string) => ["casos-exito", id] as const,
};

export function useCasosExito() {
  return useQuery({
    queryKey: keys.all,
    queryFn: svc.getCasosExito,
  });
}

export function useCasoExito(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => svc.getCasoExitoById(id),
    enabled: !!id,
  });
}

export function useCreateCasoExito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CasoExitoInsert) => svc.createCasoExito(data),
    onSuccess: () => {
      toast.success("Caso de éxito creado");
      qc.invalidateQueries({ queryKey: keys.all });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al crear"),
  });
}

export function useUpdateCasoExito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CasoExitoUpdate }) =>
      svc.updateCasoExito(id, data),
    onSuccess: () => {
      toast.success("Caso actualizado");
      qc.invalidateQueries({ queryKey: keys.all });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al actualizar"),
  });
}

export function useDeleteCasoExito() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteCasoExito(id),
    onSuccess: () => {
      toast.success("Caso eliminado");
      qc.invalidateQueries({ queryKey: keys.all });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al eliminar"),
  });
}
