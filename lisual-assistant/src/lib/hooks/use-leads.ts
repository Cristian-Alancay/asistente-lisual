"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
};

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .catch(() => setLeads([]));
  }, []);

  return leads;
}
