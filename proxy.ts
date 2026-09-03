import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(?:css|js|png|jpg|jpeg|webp|svg|ico|woff2?|webmanifest)$/i;

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/_next/") || PUBLIC_FILE.test(path)) return NextResponse.next();
  if (["/", "/connect", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest", "/api/healthz", "/api/auth/connect", "/api/auth/logout"].includes(path) || path.startsWith("/api/webhooks/")) return NextResponse.next();

  const hasSession = request.cookies.has("square_doctor_session");
  if (hasSession) return NextResponse.next();

  if (path.startsWith("/api/")) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.redirect(new URL("/connect", request.url));
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
