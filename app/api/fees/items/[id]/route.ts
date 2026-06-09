import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { feeTypeId, amount, dueDate, fineType, finePercentage, fineAmount, finePerDay, isActive } = await req.json();
    const data: any = {};
    if (feeTypeId      !== undefined) data.feeTypeId      = feeTypeId      || null;
    if (amount         !== undefined) data.amount         = parseFloat(amount)       || 0;
    if (finePercentage !== undefined) data.finePercentage = parseFloat(finePercentage) || 0;
    if (fineAmount     !== undefined) data.fineAmount     = parseFloat(fineAmount)   || 0;
    if (finePerDay     !== undefined) data.finePerDay     = parseInt(finePerDay)     || 0;
    if (fineType       !== undefined) data.fineType       = fineType;
    if (isActive       !== undefined) data.isActive       = Boolean(isActive);
    if (dueDate        !== undefined && dueDate) data.dueDate = new Date(dueDate);
    const item = await ((await getDb()) as any).feeGroupItem.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).feeDeposit.count({ where: { feeGroupItemId: id } });
  if (count > 0) return NextResponse.json({ error: "Has payment records — cannot delete" }, { status: 409 });
  await ((await getDb()) as any).feeGroupItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
