import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as opService from "@/services/operaciones";

export const operacionesKeys = {
  proyectos: ["proyectos"] as const,
  proyecto: (id: string) => ["proyectos", id] as const,
  clientes: ["clientes"] as const,
  activos: (proyectoId?: string) => ["activos", { proyectoId }] as const,
  instalaciones: (proyectoId?: string) => ["instalaciones", { proyectoId }] as const,
  instalacionesPendientes: ["instalaciones", "pendientes"] as const,
  stats: ["operaciones", "stats"] as const,
};

export function useProyectos() {
  return useQuery({ queryKey: operacionesKeys.proyectos, queryFn: opService.getProyectos });
}

export function useProyecto(id: string) {
  return useQuery({
    queryKey: operacionesKeys.proyecto(id),
    queryFn: () => opService.getProyecto(id),
    enabled: !!id,
  });
}

export function useClientes() {
  return useQuery({ queryKey: operacionesKeys.clientes, queryFn: opService.getClientes });
}

export function useActivos(proyectoId?: string) {
  return useQuery({
    queryKey: operacionesKeys.activos(proyectoId),
    queryFn: () => opService.getActivos(proyectoId),
  });
}

export function useInstalaciones(proyectoId?: string) {
  return useQuery({
    queryKey: operacionesKeys.instalaciones(proyectoId),
    queryFn: () => opService.getInstalaciones(proyectoId),
  });
}

export function useInstalacionesPendientes() {
  return useQuery({
    queryKey: operacionesKeys.instalacionesPendientes,
    queryFn: opService.getInstalacionesPendientes,
  });
}

export function useOperacionesStats() {
  return useQuery({ queryKey: operacionesKeys.stats, queryFn: opService.getOperacionesStats });
}

export function useCreateProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opService.createProyecto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proyectos"] }),
  });
}

export function useUpdateProyecto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, form }: { id: string; form: Parameters<typeof opService.updateProyecto>[1] }) =>
      opService.updateProyecto(id, form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proyectos"] }),
  });
}

export function useCreateActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opService.createActivo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activos"] }),
  });
}

export function useAsignarActivo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activoId, proyectoId }: { activoId: string; proyectoId: string }) =>
      opService.asignarActivoAProyecto(activoId, proyectoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["activos"] }),
  });
}

export function useCreateInstalacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: opService.createInstalacion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["instalaciones"] }),
  });
}
