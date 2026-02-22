import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as emailService from "@/services/email";
import type { SendEmailPayload } from "@/services/email";

export const emailKeys = {
  all: ["email-log"] as const,
  forPresupuesto: (id: string) => ["email-log", "presupuesto", id] as const,
  lastForPresupuesto: (id: string) => ["email-log", "last", id] as const,
};

export function useEmailLog(presupuestoId?: string) {
  return useQuery({
    queryKey: presupuestoId ? emailKeys.forPresupuesto(presupuestoId) : emailKeys.all,
    queryFn: () => emailService.getEmailLog(presupuestoId),
  });
}

export function useLastEmailForPresupuesto(presupuestoId: string) {
  return useQuery({
    queryKey: emailKeys.lastForPresupuesto(presupuestoId),
    queryFn: () => emailService.getLastEmailForPresupuesto(presupuestoId),
    enabled: !!presupuestoId,
  });
}

export function useSendEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendEmailPayload) => emailService.sendEmail(payload),
    onSuccess: (_data, variables) => {
      toast.success("Email enviado", { description: `A: ${variables.to}` });
      qc.invalidateQueries({ queryKey: emailKeys.all });
      if (variables.presupuesto_id) {
        qc.invalidateQueries({ queryKey: emailKeys.forPresupuesto(variables.presupuesto_id) });
        qc.invalidateQueries({ queryKey: emailKeys.lastForPresupuesto(variables.presupuesto_id) });
        qc.invalidateQueries({ queryKey: ["presupuestos"] });
      }
    },
    onError: (error) => {
      toast.error("Error al enviar email", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    },
  });
}
