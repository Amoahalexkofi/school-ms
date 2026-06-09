import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ITEM_ALLOWED = ["feeTypeId","amount","dueDate","finePercentage","fineAmount","description","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ITEM_ALLOWED) {
    if (key in body) {
      if (["amount","finePercentage","fineAmount"].includes(key) && body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
      else if (key === "dueDate" && body[key]) data[key] = new Date(body[key]);
      else data[key] = body[key] ?? null;
    }
  }
  const item = await ((await getDb()) as any).feeGroupItem.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).feeDeposit.count({ where: { feeGroupItemId: id } });
  if (count > 0) return NextResponse.json({ error: "Has payment records — cannot delete" }, { status: 409 });
  await ((await getDb()) as any).feeGroupItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
