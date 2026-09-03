export type CheckStatus = "operational" | "degraded" | "down";
export type EventLevel = "info" | "warning" | "critical";
export type EventKind = "probe" | "webhook" | "deployment" | "alert" | "system";

export type EndpointCheck = {
  name: string;
  path: string;
  status: CheckStatus;
  httpStatus: number | null;
  latencyMs: number;
  detail: string;
};

export type DeploymentSummary = {
  state: string;
  url: string | null;
  createdAt: string | null;
  source: "vercel" | "unconfigured" | "error";
};

export type MonitorSnapshot = {
  overall: CheckStatus;
  checkedAt: string;
  siteUrl: string;
  checks: EndpointCheck[];
  deployment: DeploymentSummary;
  recentEvents: MonitorEvent[];
  incidents: Incident[];
  notificationChannels: string[];
  storage: "redis" | "local-memory";
};

export type MonitorEvent = {
  id: string;
  createdAt: string;
  level: EventLevel;
  kind: EventKind;
  source: string;
  message: string;
  status?: CheckStatus;
  httpStatus?: number | null;
  latencyMs?: number;
  requestId?: string | null;
  eventType?: string;
  payload?: unknown;
};

export type Incident = {
  id: string;
  openedAt: string;
  resolvedAt: string | null;
  status: "open" | "resolved";
  title: string;
  summary: string;
  affected: string[];
};
