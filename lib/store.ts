import type { Incident, MonitorEvent } from "@/lib/types";

const EVENTS_KEY = "devwatch:events";
const INCIDENTS_KEY = "devwatch:incidents";
const MAX_EVENTS = 500;
type MemoryStore = { events: MonitorEvent[]; incidents: Incident[] };
const globalStore = globalThis as typeof globalThis & { __devwatch?: MemoryStore };
globalStore.__devwatch ??= { events: [], incidents: [] };

function redisConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function redis(command: unknown[]) {
  const response = await fetch(process.env.KV_REST_API_URL!, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Storage HTTP ${response.status}`);
  const data = await response.json() as { result?: unknown; error?: string };
  if (data.error) throw new Error(data.error);
  return data.result;
}

export function storageMode(): "redis" | "local-memory" {
  return redisConfigured() ? "redis" : "local-memory";
}

export async function addEvent(event: MonitorEvent) {
  if (redisConfigured()) {
    await redis(["LPUSH", EVENTS_KEY, JSON.stringify(event)]);
    await redis(["LTRIM", EVENTS_KEY, 0, MAX_EVENTS - 1]);
    return;
  }
  globalStore.__devwatch!.events.unshift(event);
  globalStore.__devwatch!.events.length = Math.min(globalStore.__devwatch!.events.length, MAX_EVENTS);
}

export async function getEvents(limit = 100): Promise<MonitorEvent[]> {
  if (redisConfigured()) {
    const rows = await redis(["LRANGE", EVENTS_KEY, 0, Math.max(0, limit - 1)]) as string[] | null;
    return (rows || []).map((row) => JSON.parse(row));
  }
  return globalStore.__devwatch!.events.slice(0, limit);
}

export async function getIncidents(): Promise<Incident[]> {
  if (redisConfigured()) {
    const value = await redis(["GET", INCIDENTS_KEY]) as string | null;
    return value ? JSON.parse(value) : [];
  }
  return globalStore.__devwatch!.incidents;
}

export async function saveIncidents(incidents: Incident[]) {
  if (redisConfigured()) {
    await redis(["SET", INCIDENTS_KEY, JSON.stringify(incidents.slice(0, 100))]);
    return;
  }
  globalStore.__devwatch!.incidents = incidents.slice(0, 100);
}
