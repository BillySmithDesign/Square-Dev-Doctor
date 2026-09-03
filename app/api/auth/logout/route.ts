import { cookies } from "next/headers";
import { SQUARE_SESSION_COOKIE } from "@/lib/session";

export async function POST() {
  const jar = await cookies();
  jar.delete(SQUARE_SESSION_COOKIE);
  return Response.json({ ok: true });
}
