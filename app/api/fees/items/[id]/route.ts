import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.amount)         body.amount         = parseFloat(body.amount);
  if (body.finePercentage) body.finePercentage = parseFloat(body.finePercentage);
  if (body.fineAmount)     body.fineAmount     = parseFloat(body.fineAmount);
  if (body.dueDate)        body.dueDate        = new Date(body.dueDate);
  const item = await ((await getDb()) as any).feeGroupItem.update({ where: { id }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).feeDeposit.count({ where: { feeGroupItemId: id } });
  if (count > 0) return NextResponse.json({ error: "Has payment records — cannot delete" }, { status: 409 });
  await ((await getDb()) as any).feeGroupItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
