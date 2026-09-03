export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ events: [] }, { headers: { "Cache-Control": "no-store" } });
}
