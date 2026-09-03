import { cookies } from "next/headers";
import { encryptConnection, SQUARE_SESSION_COOKIE, type SquareConnection } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Partial<SquareConnection> | null;
  if (!body?.accessToken || !["sandbox", "production"].includes(body.environment || "")) return Response.json({ error: "A Square access token and environment are required" }, { status: 400 });
  try {
    const session = encryptConnection({ accessToken: body.accessToken.trim(), environment: body.environment as SquareConnection["environment"], locationId: body.locationId?.trim(), vercelToken: body.vercelToken?.trim(), vercelProjectId: body.vercelProjectId?.trim(), vercelTeamId: body.vercelTeamId?.trim() });
    if (session.length > 3800) return Response.json({ error: "Connection details are too large" }, { status: 400 });
    (await cookies()).set(SQUARE_SESSION_COOKIE, session, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not create secure session" }, { status: 503 });
  }
}
