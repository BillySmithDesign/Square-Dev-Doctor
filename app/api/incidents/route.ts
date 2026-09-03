export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ incidents: [] }, { headers: { "Cache-Control": "no-store" } });
}
