const GIS_SRC = "https://accounts.google.com/gsi/client";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
].join(" ");

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GIS_SRC}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = GIS_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Google Identity Services"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

let cachedToken: string | null = null;
let tokenExpiry = 0;

export function getClientId(): string {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!id) throw new Error("Falta VITE_GOOGLE_CLIENT_ID en las variables de entorno");
  return id;
}

export function getCachedToken(): string | null {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  cachedToken = null;
  return null;
}

export async function requestAccessToken(): Promise<string> {
  const existing = getCachedToken();
  if (existing) return existing;

  await loadScript();

  return new Promise<string>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: SCOPES,
      callback: (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        cachedToken = response.access_token;
        tokenExpiry = Date.now() + (Number(response.expires_in) - 60) * 1000;
        resolve(response.access_token);
      },
      error_callback: (err: { type: string; message?: string }) => {
        reject(new Error(err.message ?? "Error de autenticación con Google"));
      },
    });
    client.requestAccessToken();
  });
}

export function revokeToken() {
  const token = cachedToken;
  cachedToken = null;
  tokenExpiry = 0;
  if (token) {
    google.accounts.oauth2.revoke(token, () => {});
  }
}
