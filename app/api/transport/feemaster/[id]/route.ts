import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { month, dueDate, fineAmount, fineType, finePercentage, isActive } = await req.json();
    const data: any = {};
    if (month          !== undefined) data.month          = month;
    if (dueDate        !== undefined) data.dueDate        = dueDate ? new Date(dueDate) : null;
    if (fineAmount     !== undefined) data.fineAmount     = fineAmount     !== null ? parseFloat(fineAmount)     : 0;
    if (fineType       !== undefined) data.fineType       = fineType       ?? "none";
    if (finePercentage !== undefined) data.finePercentage = finePercentage !== null ? parseFloat(finePercentage) : 0;
    if (isActive       !== undefined) data.isActive       = Boolean(isActive);
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 422 });
    const m = await ((await getDb()) as any).transportFeemaster.update({ where: { id }, data });
    return NextResponse.json(m);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).transportFeemaster.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
