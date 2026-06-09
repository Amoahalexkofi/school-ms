import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, code, type, percentage, amount, description, expireDate, discountLimit, sessionId, isActive } = await req.json();
    const data: any = {};
    if (name          !== undefined) data.name          = name?.trim()             || null;
    if (code          !== undefined) data.code          = code?.trim().toUpperCase() || null;
    if (type          !== undefined) data.type          = type;
    if (percentage    !== undefined) data.percentage    = parseFloat(percentage)   || 0;
    if (amount        !== undefined) data.amount        = parseFloat(amount)       || 0;
    if (description   !== undefined) data.description   = description              || null;
    if (discountLimit !== undefined) data.discountLimit = discountLimit ? parseInt(discountLimit) : null;
    if (sessionId     !== undefined) data.sessionId     = sessionId                || null;
    if (isActive      !== undefined) data.isActive      = Boolean(isActive);
    if (expireDate    !== undefined && expireDate) data.expireDate = new Date(expireDate);
    const d = await ((await getDb()) as any).feeDiscount.update({ where: { id }, data });
    return NextResponse.json(d);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).feeDiscount.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
