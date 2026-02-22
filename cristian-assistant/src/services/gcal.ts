import { supabase } from "@/lib/supabase";

const GCAL_EDGE_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gcal-sync`;

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  return {
    Authorization: `Bearer ${data.session?.access_token ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function syncReunionToCalendar(reunionId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${GCAL_EDGE_FN}/sync`, {
    method: "POST",
    headers,
    body: JSON.stringify({ reunion_id: reunionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error syncing" }));
    throw new Error(err.error ?? "Failed to sync");
  }
  return res.json() as Promise<{ google_event_id: string; htmlLink: string }>;
}

export async function unsyncReunionFromCalendar(reunionId: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${GCAL_EDGE_FN}/unsync`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ reunion_id: reunionId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error unsyncing" }));
    throw new Error(err.error ?? "Failed to unsync");
  }
}
