import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.quantity)      body.quantity      = parseInt(body.quantity);
  if (body.lowStockAlert) body.lowStockAlert = parseInt(body.lowStockAlert);
  return NextResponse.json(await (prisma as any).item.update({ where: { id }, data: body }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await (prisma as any).item.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
