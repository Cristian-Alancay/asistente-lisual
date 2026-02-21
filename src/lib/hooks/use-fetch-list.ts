"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Generic hook for fetching a list from an API endpoint.
 * Returns { data, loading, error, refetch } for full control,
 * but specific hooks can destructure only what they need.
 */
export function useFetchList<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then((raw: T[]) => setData(raw ?? []))
      .catch((e) => {
        setError(e?.message ?? "Error");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
