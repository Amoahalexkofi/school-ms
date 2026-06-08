import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = await getDb();
  const d = await (db as any).feeDiscount.update({ where: { id }, data: body });
  return NextResponse.json(d);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).feeDiscount.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
