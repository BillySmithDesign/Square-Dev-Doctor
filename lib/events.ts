import { randomUUID } from "node:crypto";
import type { EventLevel, MonitorEvent } from "@/lib/types";
import { addEvent } from "@/lib/store";

const sensitive = /token|secret|password|authorization|cookie|card|email|phone|address/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, 25).map((item) => redact(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).slice(0, 50).map(([key, item]) => [key, sensitive.test(key) ? "[redacted]" : redact(item, depth + 1)]));
  }
  if (typeof value === "string" && value.length > 1000) return `${value.slice(0, 1000)}…`;
  return value;
}

export async function recordEvent(input: Omit<MonitorEvent, "id" | "createdAt">) {
  const event: MonitorEvent = { id: randomUUID(), createdAt: new Date().toISOString(), ...input, payload: redact(input.payload) };
  await addEvent(event);
  console.log(JSON.stringify({ ...event, payload: undefined }));
  return event;
}

export function levelForStatus(status: string): EventLevel {
  return status === "down" ? "critical" : status === "degraded" ? "warning" : "info";
}
