import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).studentFeesMaster.count({ where: { feeSessionGroupId: id } });
  if (count > 0) return NextResponse.json({ error: `Assigned to ${count} student(s) — cannot delete` }, { status: 409 });
  await (prisma as any).feeSessionGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
