"use client";

import { useFetchList } from "./use-fetch-list";

type Cliente = {
  id: string;
  lead_id: string;
  id_lisual_pro: string | null;
  id_empresa: string | null;
  leads:
    | { nombre: string; empresa: string | null }
    | { nombre: string; empresa: string | null }[]
    | null;
};

export function useClientes() {
  const { data } = useFetchList<Cliente>("/api/clientes");
  return data;
}
