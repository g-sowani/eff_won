export const API_BASE = "https://api.jolpi.ca/ergast/f1";

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}/${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
