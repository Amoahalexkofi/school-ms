import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { redactSecrets, keepSecret } from "@/lib/config-secrets";
import { encryptSecret } from "@/lib/secrets-crypto";

const SECRET_FIELDS = ["apiSecretKey", "apiPassword", "apiSignature"];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const g = await (db as any).paymentGateway.findUnique({ where: { id } });
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(redactSecrets(g, SECRET_FIELDS));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { apiUsername, apiSecretKey, apiPublishableKey, apiPassword, apiSignature, apiEmail, accountNo, isSandbox, isActive, chargeType, chargeValue } = await req.json();
    const db = await getDb();
    const existing = await (db as any).paymentGateway.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data: any = {};
    if (apiUsername       !== undefined) data.apiUsername       = apiUsername       || null;
    if (apiPublishableKey !== undefined) data.apiPublishableKey = apiPublishableKey || null;
    if (apiEmail          !== undefined) data.apiEmail          = apiEmail          || null;
    if (accountNo         !== undefined) data.accountNo         = accountNo         || null;
    if (isSandbox         !== undefined) data.isSandbox         = Boolean(isSandbox);
    if (isActive          !== undefined) data.isActive          = Boolean(isActive);
    if (chargeType        !== undefined) data.chargeType        = chargeType        || null;
    if (chargeValue       !== undefined) data.chargeValue       = chargeValue       || null;
    // Secrets: blank keeps the stored value; encrypted at rest.
    if (apiSecretKey      !== undefined) data.apiSecretKey      = encryptSecret(keepSecret(apiSecretKey, existing.apiSecretKey)) || null;
    if (apiPassword       !== undefined) data.apiPassword       = encryptSecret(keepSecret(apiPassword,  existing.apiPassword))  || null;
    if (apiSignature      !== undefined) data.apiSignature      = encryptSecret(keepSecret(apiSignature, existing.apiSignature)) || null;

    const g = await (db as any).paymentGateway.update({ where: { id }, data });
    await audit("update-config", "payment-gateway", id);
    return NextResponse.json(redactSecrets(g, SECRET_FIELDS));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).paymentGateway.delete({ where: { id } });
  await audit("delete-config", "payment-gateway", id);
  return NextResponse.json({ ok: true });
}
