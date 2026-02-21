"use client";

import { useFetchList } from "./use-fetch-list";

type Lead = {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
};

export function useLeads() {
  const { data } = useFetchList<Lead>("/api/leads");
  return data;
}
