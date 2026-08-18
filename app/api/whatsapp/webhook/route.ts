import { NextRequest, NextResponse } from "next/server";

// Meta calls GET once, during setup, to prove we own this URL.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode      = params.get("hub.mode");
  const token     = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "verification failed" }, { status: 403 });
}

// Meta calls POST for every incoming message and every delivery status update
// (sent → delivered → read → failed) for messages we've sent. Logged for now
// so real delivery status is visible in Vercel function logs instead of us
// only knowing whether Meta *accepted* a send — a persisted, UI-visible log
// is a natural next step once this is confirmed working.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};

        for (const status of value.statuses ?? []) {
          console.log("[whatsapp-webhook] status update", {
            messageId: status.id,
            recipient: status.recipient_id,
            status: status.status, // sent | delivered | read | failed
            timestamp: status.timestamp,
            error: status.errors?.[0]?.title,
          });
        }

        for (const message of value.messages ?? []) {
          console.log("[whatsapp-webhook] incoming message", {
            from: message.from,
            type: message.type,
            text: message.text?.body,
            timestamp: message.timestamp,
          });
        }
      }
    }
  } catch (err: any) {
    console.error("[whatsapp-webhook] failed to process payload", err.message);
  }

  // Meta requires a fast 200 regardless of processing outcome, or it will
  // retry aggressively and eventually disable the webhook subscription.
  return NextResponse.json({ ok: true });
}
