import { createHmac, timingSafeEqual } from "node:crypto";
import { recordEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function verifySquare(request: Request, body: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const signature = request.headers.get("x-square-hmacsha256-signature");
  if (!key || !signature) return false;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL || request.url;
  const expected = createHmac("sha256", key).update(notificationUrl + body).digest("base64");
  return equal(expected, signature);
}

export async function POST(request: Request, { params }: { params: Promise<{ source: string }> }) {
  const startedAt = Date.now();
  const { source } = await params;
  const body = await request.text();
  const genericSecret = process.env.WEBHOOK_INGEST_SECRET;
  const suppliedSecret = request.headers.get("x-squaredevdoctor-secret") || new URL(request.url).searchParams.get("secret");
  const verified = source === "square" ? verifySquare(request, body) : Boolean(genericSecret && suppliedSecret && equal(genericSecret, suppliedSecret));
  if (!verified) {
    await recordEvent({ level: "warning", kind: "webhook", source, message: "Rejected webhook: signature or ingest secret invalid", httpStatus: 401, requestId: request.headers.get("x-vercel-id") });
    return Response.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let payload: unknown = body;
  try { payload = JSON.parse(body); } catch {}
  const eventType = payload && typeof payload === "object" && "type" in payload ? String(payload.type) : "untyped";
  await recordEvent({
    level: "info", kind: "webhook", source, eventType,
    message: `Webhook received: ${eventType}`, httpStatus: 202,
    latencyMs: Date.now() - startedAt, requestId: request.headers.get("x-vercel-id"), payload,
  });
  return Response.json({ accepted: true }, { status: 202 });
}
