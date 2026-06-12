import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status, approvedAt, approvedBy, remark } = await req.json();
  const data: any = {};
  if (status     !== undefined) data.status     = status     || null;
  if (approvedAt !== undefined && approvedAt) data.approvedAt = new Date(approvedAt);
  if (approvedBy !== undefined) data.approvedBy = approvedBy || null;
  if (remark     !== undefined) data.remark     = remark     || null;
  const r = await ((await getDb()) as any).studentLeaveRequest.update({ where: { id }, data });
  return NextResponse.json(r);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).studentLeaveRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
