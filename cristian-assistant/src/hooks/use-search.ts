import { useQuery } from "@tanstack/react-query";
import * as searchService from "@/services/search";

export const searchKeys = {
  global: (q: string, contexto: "trabajo" | "personal") =>
    ["search", q, contexto] as const,
};

export function useSearch(q: string, contexto: "trabajo" | "personal" = "trabajo") {
  return useQuery({
    queryKey: searchKeys.global(q, contexto),
    queryFn: () => searchService.searchGlobal(q, contexto),
    enabled: q.trim().length >= 2,
    staleTime: 30_000,
  });
}
