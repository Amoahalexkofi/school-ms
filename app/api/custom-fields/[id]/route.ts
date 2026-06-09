import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { fieldLabel, fieldType, options, isRequired, isActive, order } = await req.json();
    const data: any = {};
    if (fieldLabel !== undefined) data.fieldLabel = fieldLabel?.trim() || null;
    if (fieldType  !== undefined) data.fieldType  = fieldType;
    if (options    !== undefined) data.options    = options    || null;
    if (isRequired !== undefined) data.isRequired = Boolean(isRequired);
    if (isActive   !== undefined) data.isActive   = Boolean(isActive);
    if (order      !== undefined) data.order      = parseInt(order) || 0;
    const field = await ((await getDb()) as any).customField.update({ where: { id }, data });
    return NextResponse.json(field);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).customField.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
