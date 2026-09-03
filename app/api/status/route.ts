import { cookies } from "next/headers";
import { decryptConnection, SQUARE_SESSION_COOKIE } from "@/lib/session";
import { getConnectedSnapshot } from "@/lib/square-monitor";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  try {
    const connection = decryptConnection((await cookies()).get(SQUARE_SESSION_COOKIE)?.value);
    if (!connection) return Response.json({ error: "Square connection required" }, { status: 401 });
    const snapshot = await getConnectedSnapshot(connection);
    return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      msg: "status_route_failed",
      route: "/api/status",
      requestId: request.headers.get("x-vercel-id"),
      error: error instanceof Error ? error.message : String(error),
      ms: Date.now() - startedAt,
    }));
    return Response.json({ error: "Status check failed" }, { status: 500 });
  }
}
