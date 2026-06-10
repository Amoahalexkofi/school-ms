import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { reason, isActive } = await req.json();
    const data: any = {};
    if (reason   !== undefined) data.reason   = reason?.trim() || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const db = await getDb();
    const r = await (db as any).disableReason.update({ where: { id }, data });
    return NextResponse.json(r);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).disableReason.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
