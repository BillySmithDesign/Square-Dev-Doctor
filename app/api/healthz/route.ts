export function GET() {
  return Response.json({ ok: true, service: "square-dev-doctor", checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "no-store" } });
}
