import { useQuery } from "@tanstack/react-query";
import * as svc from "@/services/reuniones";

const keys = {
  all: ["reuniones"] as const,
  byLead: (leadId: string) => ["reuniones", "lead", leadId] as const,
  detail: (id: string) => ["reuniones", id] as const,
  participants: (reunionId: string) => ["reunion-participantes", reunionId] as const,
};

export function useReuniones() {
  return useQuery({
    queryKey: keys.all,
    queryFn: svc.getReuniones,
  });
}

export function useReunionesByLead(leadId: string) {
  return useQuery({
    queryKey: keys.byLead(leadId),
    queryFn: () => svc.getReunionesByLead(leadId),
    enabled: !!leadId,
  });
}

export function useReunion(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => svc.getReunion(id),
    enabled: !!id,
  });
}

export function useParticipantes(reunionId: string) {
  return useQuery({
    queryKey: keys.participants(reunionId),
    queryFn: () => svc.getParticipantes(reunionId),
    enabled: !!reunionId,
  });
}
