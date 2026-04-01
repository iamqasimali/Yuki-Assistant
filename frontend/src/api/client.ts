/** Client HTTP vers l’API FastAPI (JWT Bearer). */

const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function getToken(): string | null {
  return sessionStorage.getItem("yuki_token");
}

export function setToken(token: string | null): void {
  if (token) sessionStorage.setItem("yuki_token", token);
  else sessionStorage.removeItem("yuki_token");
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error("Session expirée ou non autorisée. Reconnectez-vous.");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const j = await res.json();
      if (typeof j?.detail === "string") detail = j.detail;
      else if (Array.isArray(j?.detail)) detail = j.detail.map((x: { msg?: string }) => x.msg).join(", ");
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function loginRequest(motDePasse: string): Promise<{ access_token: string }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ mot_de_passe: motDePasse }),
  });
}

export interface MessageDto {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function fetchHistory(conversationId: string): Promise<{
  messages: MessageDto[];
  conversation_id: string;
}> {
  const q = new URLSearchParams({ conversation_id: conversationId, limit: "100" });
  return apiFetch(`/history?${q.toString()}`);
}

export async function sendChat(body: {
  message: string;
  conversation_id?: string | null;
  contexte_fichier?: string | null;
}): Promise<{ reponse: string; conversation_id: string }> {
  return apiFetch("/chat", { method: "POST", body: JSON.stringify(body) });
}

export async function uploadFile(file: File): Promise<{ texte: string; nom_fichier: string }> {
  const fd = new FormData();
  fd.append("fichier", file);
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}/upload`, { method: "POST", body: fd, headers });
  if (res.status === 401) {
    setToken(null);
    throw new Error("Session expirée. Reconnectez-vous.");
  }
  if (!res.ok) {
    const raw = await res.text();
    let detail = raw || res.statusText;
    try {
      const j = JSON.parse(raw) as { detail?: string | { msg?: string }[] };
      if (typeof j?.detail === "string") detail = j.detail;
      else if (Array.isArray(j?.detail))
        detail = j.detail.map((x) => x.msg ?? "").filter(Boolean).join(", ");
    } catch {
      /* corps non JSON */
    }
    throw new Error(detail || res.statusText);
  }
  return res.json();
}

export async function getConfig(): Promise<{
  personnalite_extra: string;
  preferences: Record<string, unknown>;
}> {
  return apiFetch("/config");
}

export async function saveConfig(body: {
  personnalite_extra?: string;
  preferences?: Record<string, unknown>;
}): Promise<{ personnalite_extra: string; preferences: Record<string, unknown> }> {
  return apiFetch("/config", { method: "POST", body: JSON.stringify(body) });
}
