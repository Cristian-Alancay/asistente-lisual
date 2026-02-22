import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as presupuestoService from "@/services/presupuestos";
import type { PresupuestoFormData } from "@/lib/validations/presupuesto";
import { leadKeys } from "./use-leads";

export const presupuestoKeys = {
  all: ["presupuestos"] as const,
  list: (leadId?: string) => ["presupuestos", { leadId }] as const,
  detail: (id: string) => ["presupuestos", id] as const,
  proximoNumero: (cliente?: string, empresa?: string) =>
    ["presupuestos", "proximo-numero", cliente ?? "", empresa ?? ""] as const,
};

export function usePresupuestos(leadId?: string) {
  return useQuery({
    queryKey: presupuestoKeys.list(leadId),
    queryFn: () => presupuestoService.getPresupuestos(leadId),
  });
}

export function usePresupuesto(id: string) {
  return useQuery({
    queryKey: presupuestoKeys.detail(id),
    queryFn: () => presupuestoService.getPresupuesto(id),
    enabled: !!id,
  });
}

export function useProximoNumero(clienteNombre?: string, empresaNombre?: string) {
  return useQuery({
    queryKey: presupuestoKeys.proximoNumero(clienteNombre, empresaNombre),
    queryFn: () => presupuestoService.getProximoNumero(clienteNombre, empresaNombre),
  });
}

export function useCreatePresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: PresupuestoFormData) => presupuestoService.createPresupuesto(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: ["seguimientos"] });
    },
  });
}

export function useUpdatePresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: PresupuestoFormData }) =>
      presupuestoService.updatePresupuesto(id, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuestos"] }),
  });
}

export function useUpdatePresupuestoEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: PresupuestoFormData["estado"] }) =>
      presupuestoService.updatePresupuestoEstado(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["presupuestos"] });
      qc.invalidateQueries({ queryKey: ["seguimientos"] });
    },
  });
}

export function useDeletePresupuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presupuestoService.deletePresupuesto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuestos"] }),
  });
}
