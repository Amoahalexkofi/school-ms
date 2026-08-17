import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { redactList, redactSecrets, keepSecret } from "@/lib/config-secrets";
import { encryptSecret } from "@/lib/secrets-crypto";

const SECRET_FIELDS = ["apiKey", "password"];

export async function GET() {
  const configs = await ((await getDb()) as any).smsConfig.findMany({ orderBy: { provider: "asc" } });
  return NextResponse.json(redactList(configs, SECRET_FIELDS));
}

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, senderId, username, password, isActive } = await req.json();
    const db = (await getDb()) as any;
    const existing = provider ? await db.smsConfig.findUnique({ where: { provider } }) : null;

    const resolvedApiKey = keepSecret(apiKey, existing?.apiKey);
    const resolvedUsername = username ?? existing?.username ?? "";

    // Same failure mode as WhatsApp config: an active provider with no real
    // credentials silently shadows the platform-wide SMS fallback. Africa's
    // Talking additionally needs a username; Twilio does not.
    if (isActive) {
      const missingUsername = provider === "africas_talking" && !resolvedUsername;
      if (!resolvedApiKey || missingUsername) {
        return NextResponse.json(
          { error: "Fill in the required fields before activating this provider." },
          { status: 422 }
        );
      }
    }

    const data: any = {};
    if (provider !== undefined) data.provider = provider || null;
    if (senderId !== undefined) data.senderId = senderId || "";
    if (username !== undefined) data.username = username || "";
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    // Secrets: keep the stored value when the client submits a blank; encrypt at rest.
    if (apiKey   !== undefined) data.apiKey   = encryptSecret(resolvedApiKey);
    if (password !== undefined) data.password = encryptSecret(keepSecret(password, existing?.password));

    const config = existing
      ? await db.smsConfig.update({ where: { provider }, data })
      : await db.smsConfig.create({ data: { apiKey: "", password: "", ...data } });
    await audit("update-config", "sms-config", provider ?? null);
    return NextResponse.json(redactSecrets(config, SECRET_FIELDS));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
