import { supabase } from "@/lib/supabase";

export type AreaContacto =
  | "direccion" | "obra" | "marketing" | "administracion"
  | "seguridad" | "compras" | "legal" | "otro";

export interface ContactoCliente {
  id: string;
  cliente_id: string;
  nombre: string;
  cargo: string | null;
  area: AreaContacto | null;
  email: string | null;
  telefono: string | null;
  es_principal: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactoInsert = Omit<ContactoCliente, "id" | "created_at" | "updated_at">;
export type ContactoUpdate = Partial<Omit<ContactoCliente, "id" | "cliente_id" | "created_at">>;

export async function getContactosByCliente(clienteId: string): Promise<ContactoCliente[]> {
  const { data, error } = await supabase
    .from("contactos_cliente")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("es_principal", { ascending: false })
    .order("nombre", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ContactoCliente[];
}

export async function createContacto(contacto: ContactoInsert): Promise<ContactoCliente> {
  if (contacto.es_principal) {
    await supabase
      .from("contactos_cliente")
      .update({ es_principal: false })
      .eq("cliente_id", contacto.cliente_id)
      .eq("es_principal", true);
  }

  const { data, error } = await supabase
    .from("contactos_cliente")
    .insert(contacto)
    .select()
    .single();
  if (error) throw error;
  return data as ContactoCliente;
}

export async function updateContacto(id: string, updates: ContactoUpdate): Promise<ContactoCliente> {
  if (updates.es_principal) {
    const { data: current } = await supabase
      .from("contactos_cliente")
      .select("cliente_id")
      .eq("id", id)
      .single();
    if (current) {
      await supabase
        .from("contactos_cliente")
        .update({ es_principal: false })
        .eq("cliente_id", current.cliente_id)
        .eq("es_principal", true);
    }
  }

  const { data, error } = await supabase
    .from("contactos_cliente")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ContactoCliente;
}

export async function deleteContacto(id: string): Promise<void> {
  const { error } = await supabase
    .from("contactos_cliente")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
