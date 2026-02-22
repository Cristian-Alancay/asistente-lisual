import { useQuery } from "@tanstack/react-query";
import * as calService from "@/services/calendario";

export const calendarioKeys = {
  mes: (ano: number, mes: number) => ["calendario", ano, mes] as const,
};

export function useEventosMes(ano: number, mes: number) {
  return useQuery({
    queryKey: calendarioKeys.mes(ano, mes),
    queryFn: () => calService.getEventosMes(ano, mes),
  });
}
