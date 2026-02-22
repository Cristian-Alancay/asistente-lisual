import { useQuery } from "@tanstack/react-query";
import * as reporteService from "@/services/reportes";

export const reportesKeys = {
  ventas: (filtro?: { fechaDesde?: string; fechaHasta?: string }) =>
    ["reportes", "ventas", filtro] as const,
  operaciones: ["reportes", "operaciones"] as const,
  experiencia: ["reportes", "experiencia"] as const,
};

export function useReporteVentas(filtro?: { fechaDesde?: string; fechaHasta?: string }) {
  return useQuery({
    queryKey: reportesKeys.ventas(filtro),
    queryFn: () => reporteService.getReporteVentas(filtro),
  });
}

export function useReporteOperaciones() {
  return useQuery({
    queryKey: reportesKeys.operaciones,
    queryFn: reporteService.getReporteOperaciones,
  });
}

export function useReporteExperiencia() {
  return useQuery({
    queryKey: reportesKeys.experiencia,
    queryFn: reporteService.getReporteExperiencia,
  });
}
