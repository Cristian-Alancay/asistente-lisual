import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/contactos-cliente";
import type { ContactoInsert, ContactoUpdate } from "@/services/contactos-cliente";

const keys = {
  byCliente: (clienteId: string) => ["contactos-cliente", clienteId] as const,
};

export function useContactosCliente(clienteId: string) {
  return useQuery({
    queryKey: keys.byCliente(clienteId),
    queryFn: () => svc.getContactosByCliente(clienteId),
    enabled: !!clienteId,
  });
}

export function useCreateContacto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ContactoInsert) => svc.createContacto(data),
    onSuccess: (_data, variables) => {
      toast.success("Contacto agregado");
      qc.invalidateQueries({ queryKey: keys.byCliente(variables.cliente_id) });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al crear contacto"),
  });
}

export function useUpdateContacto(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactoUpdate }) =>
      svc.updateContacto(id, data),
    onSuccess: () => {
      toast.success("Contacto actualizado");
      qc.invalidateQueries({ queryKey: keys.byCliente(clienteId) });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al actualizar"),
  });
}

export function useDeleteContacto(clienteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => svc.deleteContacto(id),
    onSuccess: () => {
      toast.success("Contacto eliminado");
      qc.invalidateQueries({ queryKey: keys.byCliente(clienteId) });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al eliminar"),
  });
}
