import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { redactList, redactSecrets, keepSecret } from "@/lib/config-secrets";
import { encryptSecret } from "@/lib/secrets-crypto";

const SECRET_FIELDS = ["apiKey", "password"];

export async function GET() {
  const db = await getDb();
  const configs = await (db as any).whatsAppConfig.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(redactList(configs, SECRET_FIELDS));
}

export async function POST(req: NextRequest) {
  const db   = (await getDb()) as any;
  const body = await req.json();
  const { provider, apiKey, password, senderId, endpoint, isActive } = body;

  if (!provider) return NextResponse.json({ error: "provider required" }, { status: 422 });

  const existing = await db.whatsAppConfig.findUnique({ where: { provider } });
  const resolvedApiKey = keepSecret(apiKey, existing?.apiKey);
  const resolvedSenderId = senderId ?? existing?.senderId ?? "";
  const resolvedEndpoint = endpoint ?? existing?.endpoint ?? "";

  // Activating a provider with no real credentials leaves it silently
  // shadowing the platform-wide default (sendWhatsApp checks the DB first) —
  // every send would fail instead of falling through. Require the minimum
  // fields each provider actually needs before allowing isActive: true, and
  // check this before deactivating whatever provider currently works.
  if (isActive) {
    const missingSenderOrEndpoint = provider === "wati" ? !resolvedEndpoint : !resolvedSenderId;
    if (!resolvedApiKey || missingSenderOrEndpoint) {
      return NextResponse.json(
        { error: "Fill in the required fields before activating this provider." },
        { status: 422 }
      );
    }
    // Only now deactivate all others — validation passed.
    await db.whatsAppConfig.updateMany({ data: { isActive: false } });
  }

  const data = {
    // Secrets: keep stored value when client submits a blank.
    apiKey:   encryptSecret(resolvedApiKey),
    password: encryptSecret(keepSecret(password, existing?.password)),
    senderId: resolvedSenderId,
    endpoint: resolvedEndpoint,
    isActive: Boolean(isActive),
  };

  const config = existing
    ? await db.whatsAppConfig.update({ where: { provider }, data })
    : await db.whatsAppConfig.create({ data: { provider, ...data } });

  await audit("update-config", "whatsapp-config", null);
  return NextResponse.json(redactSecrets(config, SECRET_FIELDS));
}

export async function DELETE(req: NextRequest) {
  const db  = await getDb();
  const { provider } = await req.json();
  await (db as any).whatsAppConfig.delete({ where: { provider } });
  return NextResponse.json({ ok: true });
}
