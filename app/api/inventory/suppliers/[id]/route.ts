import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, phone, email, address, isActive } = await req.json();
    const data: any = {};
    if (name     !== undefined) data.name     = name?.trim() || null;
    if (phone    !== undefined) data.phone    = phone    || null;
    if (email    !== undefined) data.email    = email    || null;
    if (address  !== undefined) data.address  = address  || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    const db = await getDb();
    const s = await (db as any).supplier.update({ where: { id }, data });
    return NextResponse.json(s);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    const count = await (db as any).item.count({ where: { supplierId: id } });
    if (count > 0) return NextResponse.json({ error: `${count} item(s) use this supplier` }, { status: 409 });
    await (db as any).supplier.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
