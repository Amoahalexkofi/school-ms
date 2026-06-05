import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.approvedAt) body.approvedAt = new Date(body.approvedAt);
  const r = await ((await getDb()) as any).studentLeaveRequest.update({ where: { id }, data: body });
  return NextResponse.json(r);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).studentLeaveRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
