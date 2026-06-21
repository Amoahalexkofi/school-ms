import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { redactSecrets, keepSecret } from "@/lib/config-secrets";

// Mirrors Smart School's Paymentsetting_model: payment gateway config.
// apiPublishableKey is a public key by design; the rest are secret.
const SECRET_FIELDS = ["apiSecretKey", "apiPassword", "apiSignature"];

export async function GET() {
  const db = await getDb();
  const gateways = await (db as any).paymentGateway.findMany({ orderBy: { paymentType: "asc" } });
  // Expose config + whether each secret is set, never the secret values.
  return NextResponse.json(gateways.map((g: any) => ({
    id:                g.id,
    paymentType:       g.paymentType,
    apiUsername:       g.apiUsername,
    apiPublishableKey: g.apiPublishableKey,
    apiEmail:          g.apiEmail,
    accountNo:         g.accountNo,
    isActive:          g.isActive,
    isSandbox:         g.isSandbox,
    chargeType:        g.chargeType,
    chargeValue:       g.chargeValue,
    createdAt:         g.createdAt,
    apiSecretKeySet:   !!g.apiSecretKey,
    apiPasswordSet:    !!g.apiPassword,
    apiSignatureSet:   !!g.apiSignature,
  })));
}

export async function POST(req: NextRequest) {
  try {
    const { paymentType, apiUsername, apiSecretKey, apiPublishableKey, apiPassword, apiSignature, apiEmail, accountNo, isSandbox, isActive, chargeType, chargeValue } = await req.json();
    if (!paymentType?.trim()) return NextResponse.json({ error: "paymentType is required" }, { status: 422 });
    const db = (await getDb()) as any;
    const type = paymentType.toLowerCase().trim();
    const existing = await db.paymentGateway.findUnique({ where: { paymentType: type } });

    // Secrets: keep stored value when client submits a blank.
    const secretData = {
      apiSecretKey: keepSecret(apiSecretKey, existing?.apiSecretKey) || null,
      apiPassword:  keepSecret(apiPassword,  existing?.apiPassword)  || null,
      apiSignature: keepSecret(apiSignature, existing?.apiSignature) || null,
    };
    const common = {
      apiUsername:       apiUsername       || null,
      apiPublishableKey: apiPublishableKey || null,
      apiEmail:          apiEmail          || null,
      accountNo:         accountNo         || null,
      isSandbox:         isSandbox ?? true,
      isActive:          isActive  ?? false,
      chargeType:        chargeType        || null,
      chargeValue:       chargeValue       || null,
      ...secretData,
    };

    const g = await db.paymentGateway.upsert({
      where:  { paymentType: type },
      create: { paymentType: type, ...common },
      update: common,
    });
    return NextResponse.json(redactSecrets(g, SECRET_FIELDS), { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
