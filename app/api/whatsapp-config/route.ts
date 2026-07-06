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

  // If activating this provider, deactivate all others first
  if (isActive) {
    await db.whatsAppConfig.updateMany({ data: { isActive: false } });
  }

  const existing = await db.whatsAppConfig.findUnique({ where: { provider } });
  const data = {
    // Secrets: keep stored value when client submits a blank.
    apiKey:   encryptSecret(keepSecret(apiKey, existing?.apiKey)),
    password: encryptSecret(keepSecret(password, existing?.password)),
    senderId: senderId ?? "",
    endpoint: endpoint ?? "",
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
