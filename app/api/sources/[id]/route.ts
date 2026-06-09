import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, isActive } = await req.json();
    const data: any = {};
    if (name     !== undefined) data.name     = name?.trim() || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    return NextResponse.json(await ((await getDb()) as any).source.update({ where: { id }, data }));
  }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { await ((await getDb()) as any).source.update({ where: { id }, data: { isActive: false } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
