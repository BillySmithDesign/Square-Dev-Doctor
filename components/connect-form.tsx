"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, ServerCog, ShieldCheck } from "lucide-react";

export function ConnectForm() {
  const router = useRouter();
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true); setError("");
    const response = await fetch("/api/auth/connect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.error || "Connection failed"); setBusy(false); return; }
    router.push("/console"); router.refresh();
  }

  return <form className="connect-form" onSubmit={submit}>
    <div className="form-section"><span className="step-icon"><KeyRound size={20}/></span><div><h2>Square environment</h2><p>Use a restricted token whenever possible. It remains encrypted in a secure session cookie.</p></div></div>
    <label>Environment<select name="environment" defaultValue="sandbox"><option value="sandbox">Sandbox — recommended for testing</option><option value="production">Production</option></select></label>
    <label>Square access token<input name="accessToken" type="password" autoComplete="off" placeholder="EAAA…" required /></label>
    <label>Location ID <span>optional</span><input name="locationId" autoComplete="off" placeholder="L…" /></label>
    <button className="advanced-toggle" type="button" onClick={() => setAdvanced((value) => !value)}><ServerCog size={17}/>{advanced ? "Hide Vercel connection" : "Also connect Vercel"}</button>
    {advanced ? <div className="advanced-fields"><label>Vercel read-only token<input name="vercelToken" type="password" autoComplete="off" /></label><label>Vercel project ID<input name="vercelProjectId" autoComplete="off" placeholder="prj_…" /></label><label>Vercel team ID <span>optional</span><input name="vercelTeamId" autoComplete="off" placeholder="team_…" /></label></div> : null}
    <div className="security-note"><ShieldCheck size={18}/><span>Tokens are never placed in page HTML, analytics, logs or browser storage.</span></div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="primary connect-submit" disabled={busy}>{busy ? "Creating secure session…" : "Connect and run checks"}<ArrowRight size={17}/></button>
  </form>;
}
