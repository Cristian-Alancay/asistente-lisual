"use client";

import { useMemo } from "react";
import { useFetchList } from "./use-fetch-list";

type Proyecto = {
  id: string;
  nombre: string;
};

export function useProyectos() {
  const { data } = useFetchList<Proyecto>("/api/proyectos");
  return useMemo(() => data.map((p) => ({ id: p.id, nombre: p.nombre })), [data]);
}
