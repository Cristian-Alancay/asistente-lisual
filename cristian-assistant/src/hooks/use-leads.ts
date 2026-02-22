import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as leadService from "@/services/leads";
import type { LeadFormData } from "@/lib/validations/lead";
import type { ConvertLeadPayload } from "@/services/leads";

export const leadKeys = {
  all: ["leads"] as const,
  detail: (id: string) => ["leads", id] as const,
};

export function useLeads() {
  return useQuery({
    queryKey: leadKeys.all,
    queryFn: leadService.getLeads,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => leadService.getLead(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: LeadFormData) => leadService.createLead(form),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: LeadFormData }) =>
      leadService.updateLead(id, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadService.deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useConvertLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConvertLeadPayload) => leadService.convertLeadToCliente(payload),
    onSuccess: () => {
      toast.success("Lead convertido a cliente", { description: "Ahora lo encontrás en CX → Clientes" });
      qc.invalidateQueries({ queryKey: leadKeys.all });
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
    onError: (e) => {
      toast.error("Error al convertir", { description: e instanceof Error ? e.message : "Error desconocido" });
    },
  });
}
