"use client";

import { useEffect, useState } from "react";

type Cliente = {
  id: string;
  lead_id: string;
  id_lisual_pro: string | null;
  id_empresa: string | null;
  leads: { nombre: string; empresa: string | null } | { nombre: string; empresa: string | null }[] | null;
};

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then(setClientes)
      .catch(() => setClientes([]));
  }, []);

  return clientes;
}
