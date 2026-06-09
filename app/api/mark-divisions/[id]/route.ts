import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, percentageFrom, percentageTo, isActive } = await req.json();
    const data: any = {};
    if (name           !== undefined) data.name           = name?.trim()             || null;
    if (percentageFrom !== undefined) data.percentageFrom = parseFloat(percentageFrom);
    if (percentageTo   !== undefined) data.percentageTo   = parseFloat(percentageTo);
    if (isActive       !== undefined) data.isActive       = Boolean(isActive);
    const d = await ((await getDb()) as any).markDivision.update({ where: { id }, data });
    return NextResponse.json(d);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).markDivision.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
