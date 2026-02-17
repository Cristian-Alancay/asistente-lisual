"use client";

import { useEffect, useState } from "react";

type Proyecto = {
  id: string;
  nombre: string;
};

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  useEffect(() => {
    fetch("/api/proyectos")
      .then((r) => r.json())
      .then((data) => setProyectos(data?.map((p: { id: string; nombre: string }) => ({ id: p.id, nombre: p.nombre })) ?? []))
      .catch(() => setProyectos([]));
  }, []);

  return proyectos;
}
