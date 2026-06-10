import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Paymentsetting_model: payment gateway config

export async function GET() {
  const db = await getDb();
  const gateways = await (db as any).paymentGateway.findMany({ orderBy: { paymentType: "asc" } });
  // Strip sensitive keys from list response
  return NextResponse.json(gateways.map((g: any) => ({
    id:           g.id,
    paymentType:  g.paymentType,
    isActive:     g.isActive,
    isSandbox:    g.isSandbox,
    chargeType:   g.chargeType,
    chargeValue:  g.chargeValue,
    createdAt:    g.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  try {
    const { paymentType, apiUsername, apiSecretKey, apiPublishableKey, apiPassword, apiSignature, apiEmail, accountNo, isSandbox, isActive, chargeType, chargeValue } = await req.json();
    if (!paymentType?.trim()) return NextResponse.json({ error: "paymentType is required" }, { status: 422 });
    const db = await getDb();
    const g = await (db as any).paymentGateway.upsert({
      where: { paymentType: paymentType.toLowerCase().trim() },
      create: {
        paymentType:       paymentType.toLowerCase().trim(),
        apiUsername:       apiUsername       || null,
        apiSecretKey:      apiSecretKey      || null,
        apiPublishableKey: apiPublishableKey || null,
        apiPassword:       apiPassword       || null,
        apiSignature:      apiSignature      || null,
        apiEmail:          apiEmail          || null,
        accountNo:         accountNo         || null,
        isSandbox:         isSandbox ?? true,
        isActive:          isActive  ?? false,
        chargeType:        chargeType        || null,
        chargeValue:       chargeValue       || null,
      },
      update: {
        apiUsername:       apiUsername       || null,
        apiSecretKey:      apiSecretKey      || null,
        apiPublishableKey: apiPublishableKey || null,
        apiPassword:       apiPassword       || null,
        apiSignature:      apiSignature      || null,
        apiEmail:          apiEmail          || null,
        accountNo:         accountNo         || null,
        isSandbox:         isSandbox ?? true,
        isActive:          isActive  ?? false,
        chargeType:        chargeType        || null,
        chargeValue:       chargeValue       || null,
      },
    });
    return NextResponse.json(g, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
