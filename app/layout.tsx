import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { siteUrl } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "SquareDevDoctor",
  title: {
    default: "SquareDevDoctor — Square API & Webhook Monitoring",
    template: "%s | SquareDevDoctor",
  },
  description: "Monitor Square APIs, webhook deliveries, production incidents, latency, deployments and alert readiness from one open-source operations console.",
  keywords: ["Square API monitoring", "Square webhook monitoring", "Square developer tools", "API uptime monitoring", "webhook logs", "incident monitoring", "Vercel monitoring"],
  authors: [{ name: "SquareDevDoctor" }],
  creator: "SquareDevDoctor",
  publisher: "SquareDevDoctor",
  category: "Developer Tools",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SquareDevDoctor",
    title: "SquareDevDoctor — Square API & Webhook Monitoring",
    description: "Monitor Square APIs, webhook deliveries, incidents, latency, deployments and alerts from one open-source operations console.",
    images: [{ url: "/og-squaredevdoctor.png", width: 1200, height: 630, alt: "SquareDevDoctor open-source Square API monitoring" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SquareDevDoctor — Square API & Webhook Monitoring",
    description: "Open-source monitoring for Square APIs, webhooks, incidents, latency, deployments and alerts.",
    images: ["/og-squaredevdoctor.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:logo" content={`${siteUrl}/logo.svg`} />
      </head>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
