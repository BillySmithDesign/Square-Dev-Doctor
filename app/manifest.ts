import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SquareDevDoctor",
    short_name: "DevDoctor",
    description: "Open-source monitoring for Square APIs and webhooks.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f5f2",
    theme_color: "#111815",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
