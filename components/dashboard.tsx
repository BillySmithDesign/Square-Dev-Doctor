"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Activity, BellRing, Clock3, ExternalLink, FileClock, LayoutDashboard, RefreshCw, Search, Siren, Webhook } from "lucide-react";
import type { MonitorEvent, MonitorSnapshot } from "@/lib/types";

const ActivityChart = dynamic(() => import("@/components/activity-chart").then((module) => module.ActivityChart), { ssr: false, loading: () => <div className="chart-empty">Loading activity…</div> });

const statusLabel = { operational: "Operational", degraded: "Degraded", down: "Outage" } as const;
type View = "overview" | "logs" | "webhooks" | "incidents";

function formatTime(value: string | null) {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "medium", timeZone: "Australia/Adelaide" }).format(new Date(value));
}

function EventTable({ events }: { events: MonitorEvent[] }) {
  if (!events.length) return <div className="empty">No matching events yet.</div>;
  return <div className="event-table">
    <div className="event-row event-head"><span>Time</span><span>Level</span><span>Source</span><span>Event</span><span>Result</span></div>
    {events.map((event) => <div className="event-row" key={event.id}>
      <time>{formatTime(event.createdAt)}</time>
      <span><i className={`dot ${event.level === "critical" ? "down" : event.level === "warning" ? "degraded" : "operational"}`} />{event.level}</span>
      <code>{event.source}</code>
      <span><strong>{event.eventType || event.kind}</strong><small>{event.message}</small></span>
      <span>{event.httpStatus ?? "—"}{event.latencyMs !== undefined ? <small>{event.latencyMs} ms</small> : null}</span>
    </div>)}
  </div>;
}

export function Dashboard({ initialSnapshot, productName = "SquareDevDoctor", environmentLabel = "Connected environment" }: { initialSnapshot: MonitorSnapshot; productName?: string; environmentLabel?: string }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [view, setView] = useState<View>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const webhookEvents = useMemo(() => snapshot.recentEvents.filter((event) => event.kind === "webhook"), [snapshot]);
  const chartData = useMemo(() => snapshot.recentEvents.filter((event) => event.kind === "probe" && event.latencyMs !== undefined).slice(0, 30).reverse().map((event) => ({ time: new Date(event.createdAt).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" }), latency: event.latencyMs! })), [snapshot]);

  async function refresh() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSnapshot(await response.json());
      setRefreshError(false);
    } catch { setRefreshError(true); } finally { setRefreshing(false); }
  }

  useEffect(() => { const timer = window.setInterval(refresh, 60_000); return () => window.clearInterval(timer); }, []);

  return <main>
    <header className="topbar">
      <div className="brand"><Image src="/logo.svg" alt="" width={40} height={40}/><div><strong>{productName}</strong><small>{environmentLabel}</small></div></div>
      <div className="top-actions"><span className={`status-chip ${snapshot.overall}`}><i className="dot" />{statusLabel[snapshot.overall]}</span><a href={snapshot.siteUrl} target="_blank" rel="noreferrer">Open app <ExternalLink size={14}/></a></div>
    </header>

    <section className="hero compact">
      <div><p className="eyebrow">Developer operations console</p><h1>Production, at a glance.</h1><p className="lede">Health probes, API requests, webhook deliveries, incidents, deployments and alert readiness in one place.</p></div>
      <button className="primary" onClick={refresh} disabled={refreshing}><RefreshCw size={16} className={refreshing ? "spin" : ""}/>{refreshing ? "Running checks…" : "Run checks now"}</button>
    </section>

    {refreshError && <div className="notice">Refresh failed. Showing the last successful result.</div>}
    <nav className="tabs" aria-label="Monitor views">
      <button className={view === "overview" ? "active" : ""} onClick={() => setView("overview")}><LayoutDashboard size={15}/>Overview</button>
      <button className={view === "logs" ? "active" : ""} onClick={() => setView("logs")}><Search size={15}/>Logs</button>
      <button className={view === "webhooks" ? "active" : ""} onClick={() => setView("webhooks")}><Webhook size={15}/>Webhooks</button>
      <button className={view === "incidents" ? "active" : ""} onClick={() => setView("incidents")}><Siren size={15}/>Incidents</button>
    </nav>

    {view === "overview" && <>
      <section className="metric-grid">
        <article><small><Activity size={15}/> Services passing</small><strong>{snapshot.checks.filter((c) => c.status === "operational").length}/{snapshot.checks.length}</strong><span>Last run {formatTime(snapshot.checkedAt)}</span></article>
        <article><small><Clock3 size={15}/> Average latency</small><strong>{Math.round(snapshot.checks.reduce((sum, c) => sum + c.latencyMs, 0) / snapshot.checks.length)} ms</strong><span>Across production probes</span></article>
        <article><small><Siren size={15}/> Open incidents</small><strong>{snapshot.incidents.filter((i) => i.status === "open").length}</strong><span>{snapshot.incidents.length} retained total</span></article>
        <article><small><BellRing size={15}/> Notifications</small><strong>{snapshot.notificationChannels.length || "Off"}</strong><span>{snapshot.notificationChannels.join(" + ") || "Configure email or webhook"}</span></article>
      </section>

      <section className="activity-panel"><div className="panel-heading"><div><p className="eyebrow">Performance signal</p><h2>API latency activity</h2></div><span><FileClock size={15}/> Latest 30 probes</span></div><ActivityChart data={chartData}/></section>

      <section className="section-heading"><div><p className="eyebrow">Synthetic monitoring</p><h2>API health</h2></div><span className="storage">History: {snapshot.storage === "redis" ? "persistent" : "local session"}</span></section>
      <section className="checks">{snapshot.checks.map((check) => <article className="check-card" key={check.path}>
        <div className="check-title"><span className={`dot ${check.status}`} /><h3>{check.name}</h3><b>{check.httpStatus ?? "ERR"}</b></div>
        <p>{check.detail}</p><dl><div><dt>State</dt><dd>{statusLabel[check.status]}</dd></div><div><dt>Latency</dt><dd>{check.latencyMs} ms</dd></div></dl><code>{check.path}</code>
      </article>)}</section>

      <section className="lower-grid">
        <article className="panel"><p className="eyebrow">Deployment</p><h2>{snapshot.deployment.state}</h2><p>{snapshot.deployment.createdAt ? `Production created ${formatTime(snapshot.deployment.createdAt)}` : "Connect a read-only Vercel token for deployment context."}</p>{snapshot.deployment.url && <a href={snapshot.deployment.url} target="_blank" rel="noreferrer">Inspect deployment ↗</a>}</article>
        <article className="panel"><p className="eyebrow">Delivery pipeline</p><h2>How you get notified</h2><p>Outage checks create an incident and send configured email and webhook alerts. Recovery is retained in the incident timeline.</p><div className="channel-list">{snapshot.notificationChannels.length ? snapshot.notificationChannels.map((c) => <span key={c}>✓ {c} ready</span>) : <span>⚠ No external alert channel configured</span>}</div></article>
      </section>
    </>}

    {view === "logs" && <section className="data-view"><div className="section-heading"><div><p className="eyebrow">Request history</p><h2>API and probe logs</h2></div><span>{snapshot.recentEvents.length} recent events</span></div><EventTable events={snapshot.recentEvents} /></section>}
    {view === "webhooks" && <section className="data-view"><div className="section-heading"><div><p className="eyebrow">Inbound events</p><h2>Webhook deliveries</h2></div><code>POST /api/webhooks/[source]</code></div><EventTable events={webhookEvents} /><aside className="hint"><strong>Square-ready verification</strong><span>Square deliveries are checked using the official HMAC signature header before payloads are redacted and retained.</span></aside></section>}
    {view === "incidents" && <section className="data-view"><div className="section-heading"><div><p className="eyebrow">Operational history</p><h2>Incidents</h2></div><span>{snapshot.incidents.filter((i) => i.status === "open").length} open</span></div><div className="incident-list">{snapshot.incidents.length ? snapshot.incidents.map((incident) => <article key={incident.id}><span className={`incident-state ${incident.status}`}>{incident.status}</span><div><h3>{incident.title}</h3><p>{incident.summary}</p><small>Opened {formatTime(incident.openedAt)}{incident.resolvedAt ? ` · Resolved ${formatTime(incident.resolvedAt)}` : ""}</small></div></article>) : <div className="empty">No incidents recorded. That is a good thing.</div>}</div></section>}

    <footer><span>{productName} · production monitor</span><span>Auto-refresh every 60 seconds</span></footer>
  </main>;
}
