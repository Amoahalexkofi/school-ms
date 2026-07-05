import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { redactSecrets, keepSecret } from "@/lib/config-secrets";
import { encryptSecret } from "@/lib/secrets-crypto";

const SECRET_FIELDS = ["smtpPassword"];

export async function GET() {
  const config = await ((await getDb()) as any).emailConfig.findFirst();
  return NextResponse.json(config ? redactSecrets(config, SECRET_FIELDS) : {});
}

export async function POST(req: NextRequest) {
  try {
    const { smtpHost, smtpPort, smtpUsername, smtpPassword, smtpSecure, fromEmail, fromName, isActive } = await req.json();
    const db = (await getDb()) as any;
    const existing = await db.emailConfig.findFirst();

    const data: any = {};
    if (smtpHost     !== undefined) data.smtpHost     = smtpHost     || "";
    if (smtpPort     !== undefined) data.smtpPort     = parseInt(smtpPort) || 587;
    if (smtpUsername !== undefined) data.smtpUsername = smtpUsername || "";
    if (smtpSecure   !== undefined) data.smtpSecure   = smtpSecure   || "tls";
    if (fromEmail    !== undefined) data.fromEmail    = fromEmail    || "";
    if (fromName     !== undefined) data.fromName     = fromName     || "";
    if (isActive     !== undefined) data.isActive     = Boolean(isActive);
    // Secret: keep stored value when client submits a blank.
    if (smtpPassword !== undefined) data.smtpPassword = encryptSecret(keepSecret(smtpPassword, existing?.smtpPassword));

    const config = existing
      ? await db.emailConfig.update({ where: { id: existing.id }, data })
      : await db.emailConfig.create({ data: { smtpPassword: "", ...data } });
    return NextResponse.json(redactSecrets(config, SECRET_FIELDS));
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save email config" }, { status: 500 });
  }
}
