import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, location, isActive } = await req.json();
    const data: any = {};
    if (name     !== undefined) data.name     = name?.trim() || null;
    if (location !== undefined) data.location = location    || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const db = await getDb();
    const s = await (db as any).store.update({ where: { id }, data });
    return NextResponse.json(s);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    const count = await (db as any).item.count({ where: { storeId: id } });
    if (count > 0) return NextResponse.json({ error: `${count} item(s) in this store` }, { status: 409 });
    await (db as any).store.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
