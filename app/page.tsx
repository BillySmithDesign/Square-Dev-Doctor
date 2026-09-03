import Image from "next/image";
import Link from "next/link";
import { Activity, BellRing, GitBranch, HeartPulse, Search, ShieldCheck, Webhook } from "lucide-react";
import { repositoryUrl, siteUrl } from "@/lib/config";

const features = [
  { icon: HeartPulse, title: "Health probes", text: "Continuously test the Square API capabilities your integration depends on." },
  { icon: Search, title: "API request logs", text: "See response state, latency and operational context without digging through deployments." },
  { icon: Webhook, title: "Webhook visibility", text: "Verify Square signatures and retain redacted delivery history for faster diagnosis." },
  { icon: BellRing, title: "Actionable alerts", text: "Turn outages into incidents and notify your team through email or webhooks." },
];

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SquareDevDoctor",
    url: `${siteUrl}/`,
    image: `${siteUrl}/og-squaredevdoctor.png`,
    logo: `${siteUrl}/logo.svg`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: "Open-source monitoring for Square APIs, webhook deliveries, incidents, latency, deployments and alerts.",
    isAccessibleForFree: true,
    ...(repositoryUrl ? { codeRepository: repositoryUrl } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return <main className="marketing">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className="marketing-nav">
      <Link className="brand" href="/" aria-label="SquareDevDoctor home"><Image src="/logo.svg" alt="SquareDevDoctor logo" width={42} height={42}/><div><strong>SquareDevDoctor</strong><small>Open-source operations</small></div></Link>
      <nav aria-label="Primary navigation"><a href="#features">Features</a><a href="#open-source">Open source</a>{repositoryUrl ? <a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a> : null}<Link className="nav-cta" href="/connect">Connect Square</Link></nav>
    </header>

    <section className="marketing-hero">
      <div className="hero-copy"><p className="eyebrow">Square developer observability</p><h1>Know your Square integration is healthy.</h1><p>SquareDevDoctor brings API health, webhook deliveries, incidents, deployments and alert readiness into one focused production console.</p><div className="hero-actions"><Link className="primary" href="/connect"><Activity size={17}/>Connect your environment</Link>{repositoryUrl ? <a className="secondary" href={repositoryUrl} target="_blank" rel="noreferrer"><GitBranch size={17}/>View source</a> : null}</div><div className="trust-line"><ShieldCheck size={17}/><span>Encrypted sessions, open source and no credential database.</span></div></div>
      <div className="hero-product"><Image src="/og-squaredevdoctor.png" alt="SquareDevDoctor showing Square API health, latency and environment status" width={1200} height={630} priority sizes="(max-width: 900px) 100vw, 55vw"/></div>
    </section>

    <section className="feature-section" id="features"><div className="section-intro"><p className="eyebrow">Everything in one place</p><h2>Spot failures before customers do.</h2><p>Purpose-built visibility for the parts of a Square integration that matter most.</p></div><div className="feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={20}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

    <section className="open-source-panel" id="open-source"><div className="brand-cloud"><span><Image src="/brands/square.svg" alt="Square" width={110} height={32}/></span><span><Image src="/brands/vercel.svg" alt="Vercel" width={116} height={26}/></span><span><Image src="/brands/github.svg" alt="GitHub" width={110} height={32}/></span></div><div><p className="eyebrow">Open by design</p><h2>Inspect it. Fork it. Own it.</h2><p>The complete monitoring core is available under the Apache License 2.0. Run the hosted tool or deploy your own private installation.</p>{repositoryUrl ? <a className="secondary" href={repositoryUrl} target="_blank" rel="noreferrer"><GitBranch size={17}/>Explore on GitHub</a> : null}</div></section>
    <section className="marketing-cta"><div><p className="eyebrow">Production deserves a pulse</p><h2>Start monitoring with SquareDevDoctor.</h2></div><Link className="primary" href="/connect">Connect Square</Link></section>
    <footer><span>© {new Date().getFullYear()} SquareDevDoctor</span><span>Open-source Square integration monitoring</span></footer>
  </main>;
}
