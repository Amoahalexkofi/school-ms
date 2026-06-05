import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).studentFeesMaster.count({ where: { feeSessionGroupId: id } });
  if (count > 0) return NextResponse.json({ error: `Assigned to ${count} student(s) — cannot delete` }, { status: 409 });
  await ((await getDb()) as any).feeSessionGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
