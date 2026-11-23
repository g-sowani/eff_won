export const API_BASE = "https://api.jolpi.ca/ergast/f1";

export async function getJSON<T>(path: string): Promise<T> {
  // no-store: auto-refreshes must hit the API, not the browser's HTTP cache.
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}
