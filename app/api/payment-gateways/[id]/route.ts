import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const g = await (db as any).paymentGateway.findUnique({ where: { id } });
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(g);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { apiUsername, apiSecretKey, apiPublishableKey, apiPassword, apiSignature, apiEmail, accountNo, isSandbox, isActive, chargeType, chargeValue } = await req.json();
    const data: any = {};
    if (apiUsername       !== undefined) data.apiUsername       = apiUsername       || null;
    if (apiSecretKey      !== undefined) data.apiSecretKey      = apiSecretKey      || null;
    if (apiPublishableKey !== undefined) data.apiPublishableKey = apiPublishableKey || null;
    if (apiPassword       !== undefined) data.apiPassword       = apiPassword       || null;
    if (apiSignature      !== undefined) data.apiSignature      = apiSignature      || null;
    if (apiEmail          !== undefined) data.apiEmail          = apiEmail          || null;
    if (accountNo         !== undefined) data.accountNo         = accountNo         || null;
    if (isSandbox         !== undefined) data.isSandbox         = Boolean(isSandbox);
    if (isActive          !== undefined) data.isActive          = Boolean(isActive);
    if (chargeType        !== undefined) data.chargeType        = chargeType        || null;
    if (chargeValue       !== undefined) data.chargeValue       = chargeValue       || null;
    const db = await getDb();
    const g = await (db as any).paymentGateway.update({ where: { id }, data });
    return NextResponse.json(g);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).paymentGateway.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
