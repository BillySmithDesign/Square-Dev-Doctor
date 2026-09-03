import type { CheckStatus, DeploymentSummary, EndpointCheck, MonitorEvent, MonitorSnapshot } from "@/lib/types";
import type { SquareConnection } from "@/lib/session";

const TIMEOUT_MS = 12_000;

type SquareResult = { errors?: Array<{ code?: string; detail?: string }>; objects?: unknown[]; locations?: unknown[] };

async function probe(name: string, path: string, detail: string, connection: SquareConnection, validate: (body: SquareResult) => boolean): Promise<EndpointCheck> {
  const started = Date.now();
  const base = connection.environment === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";
  try {
    const response = await fetch(`${base}${path}`, {
      cache: "no-store",
      headers: { authorization: `Bearer ${connection.accessToken}`, "square-version": "2026-08-20", "user-agent": "SquareDevDoctor/1.0" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await response.json().catch(() => ({})) as SquareResult;
    const valid = response.ok && validate(body);
    return { name, path, detail: valid ? detail : body.errors?.[0]?.detail || (response.ok ? "Response validation failed" : `Square API HTTP ${response.status}`), status: valid ? "operational" : "down", httpStatus: response.status, latencyMs: Date.now() - started };
  } catch (error) {
    return { name, path, detail: error instanceof Error ? error.message : "Square request failed", status: "down", httpStatus: null, latencyMs: Date.now() - started };
  }
}

async function deployment(connection: SquareConnection): Promise<DeploymentSummary> {
  if (!connection.vercelToken || !connection.vercelProjectId) return { state: "Optional", url: null, createdAt: null, source: "unconfigured" };
  try {
    const params = new URLSearchParams({ projectId: connection.vercelProjectId, limit: "1", target: "production" });
    if (connection.vercelTeamId) params.set("teamId", connection.vercelTeamId);
    const response = await fetch(`https://api.vercel.com/v6/deployments?${params}`, { cache: "no-store", headers: { authorization: `Bearer ${connection.vercelToken}` }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!response.ok) throw new Error(`Vercel API HTTP ${response.status}`);
    const body = await response.json() as { deployments?: Array<{ state?: string; url?: string; createdAt?: number }> };
    const item = body.deployments?.[0];
    return { state: item?.state || "Unknown", url: item?.url ? `https://${item.url}` : null, createdAt: item?.createdAt ? new Date(item.createdAt).toISOString() : null, source: "vercel" };
  } catch (error) {
    return { state: error instanceof Error ? error.message : "Vercel lookup failed", url: null, createdAt: null, source: "error" };
  }
}

export async function getConnectedSnapshot(connection: SquareConnection): Promise<MonitorSnapshot> {
  const checks = await Promise.all([
    probe("Square authentication", "/v2/locations", "Token and location access verified", connection, (body) => Array.isArray(body.locations) && body.locations.length > 0),
    probe("Catalog categories", "/v2/catalog/list?types=CATEGORY", "Square catalog category access", connection, (body) => Array.isArray(body.objects)),
    probe("Catalog services", "/v2/catalog/list?types=ITEM", "Square catalog item access", connection, (body) => Array.isArray(body.objects)),
  ]);
  const checkedAt = new Date().toISOString();
  const overall: CheckStatus = checks.some((item) => item.status === "down") ? "down" : checks.some((item) => item.status === "degraded") ? "degraded" : "operational";
  const recentEvents: MonitorEvent[] = checks.map((check, index) => ({ id: `${checkedAt}-${index}`, createdAt: checkedAt, level: check.status === "operational" ? "info" : "critical", kind: "probe", source: check.path, message: `${check.name}: ${check.detail}`, status: check.status, httpStatus: check.httpStatus, latencyMs: check.latencyMs }));
  return { overall, checkedAt, siteUrl: "https://developer.squareup.com/apps", checks, deployment: await deployment(connection), recentEvents, incidents: [], notificationChannels: [], storage: "local-memory" };
}
