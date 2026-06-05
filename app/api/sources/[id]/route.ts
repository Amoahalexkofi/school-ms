import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { return NextResponse.json(await (prisma as any).source.update({ where: { id }, data: await req.json() })); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try { await (prisma as any).source.update({ where: { id }, data: { isActive: false } }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
