import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DISC_ALLOWED = ["name","discountType","value","applicableTo","studentSessionId","feeGroupItemId","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of DISC_ALLOWED) {
    if (key in body) {
      if (key === "value" && body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  const db = await getDb();
  const d = await (db as any).feeDiscount.update({ where: { id }, data });
  return NextResponse.json(d);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).feeDiscount.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
