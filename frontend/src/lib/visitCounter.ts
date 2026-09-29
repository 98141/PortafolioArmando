import { apiBaseUrl } from "@/src/lib/publicConfig";

const storageKey = "portfolio.visit-session.v1";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let inFlight: Promise<number> | undefined;

export function loadVisitCount(): Promise<number> {
  if (inFlight) return inFlight;
  let sessionId: string | undefined;
  try {
    const saved = window.sessionStorage.getItem(storageKey);
    sessionId = saved && uuid.test(saved) ? saved : crypto.randomUUID();
    window.sessionStorage.setItem(storageKey, sessionId);
  } catch {
    // With storage blocked, display the count without inflating it on every reload.
    sessionId = undefined;
  }
  inFlight = (async () => {
    const response = await fetch(`${apiBaseUrl}/visits`, {
      method: sessionId ? "POST" : "GET",
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      ...(sessionId ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) } : {}),
    });
    if (!response.ok) throw new Error("Visit count unavailable");
    const result = await response.json();
    const count = result?.data?.visits;
    if (!Number.isSafeInteger(count) || count < 0) throw new Error("Invalid visit count");
    return count as number;
  })().finally(() => { inFlight = undefined; });
  return inFlight;
}
