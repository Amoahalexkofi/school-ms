import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.quantity)    body.quantity    = parseInt(body.quantity);
  if (body.available)   body.available   = parseInt(body.available);
  if (body.perUnitCost) body.perUnitCost = parseFloat(body.perUnitCost);
  return NextResponse.json(await (prisma as any).book.update({ where: { id }, data: body }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const active = await (prisma as any).bookIssue.count({ where: { bookId: id, status: "ISSUED" } });
  if (active > 0) return NextResponse.json({ error: "Book has active issues" }, { status: 409 });
  await (prisma as any).book.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
