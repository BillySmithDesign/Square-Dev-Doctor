import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ConnectForm } from "@/components/connect-form";

export const metadata: Metadata = { title: "Connect your Square environment", description: "Securely connect a Square developer environment to SquareDevDoctor.", robots: { index: false, follow: false } };

export default function ConnectPage() {
  return <main className="connect-shell"><header className="connect-nav"><Link className="brand" href="/"><Image src="/logo.svg" alt="SquareDevDoctor" width={42} height={42}/><div><strong>SquareDevDoctor</strong><small>Secure connection setup</small></div></Link><Link href="/">Back to overview</Link></header><section className="connect-layout"><div className="connect-copy"><p className="eyebrow">Get started in minutes</p><h1>Connect your developer environment.</h1><p>Run live health checks against Square and optionally add read-only Vercel deployment context. Nothing is saved to a database.</p><ol><li><b>1</b><span><strong>Choose your environment</strong><small>Start safely with Square Sandbox.</small></span></li><li><b>2</b><span><strong>Add a restricted token</strong><small>Your secret is encrypted server-side.</small></span></li><li><b>3</b><span><strong>Open your console</strong><small>See latency, catalog access and deployment state.</small></span></li></ol></div><ConnectForm/></section></main>;
}
