import { useQuery } from "@tanstack/react-query";
import * as dashService from "@/services/dashboard";

export const dashboardKeys = {
  stats: ["dashboard", "stats"] as const,
  leadsNegociacion: ["dashboard", "leads-negociacion"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: dashService.getDashboardStats,
    staleTime: 60_000,
  });
}

export function useLeadsNegociacion() {
  return useQuery({
    queryKey: dashboardKeys.leadsNegociacion,
    queryFn: dashService.getLeadsNegociacion,
    staleTime: 60_000,
  });
}
