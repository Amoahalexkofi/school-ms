import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.nextFollowUp) body.nextFollowUp = new Date(body.nextFollowUp);
  return NextResponse.json(await ((await getDb()) as any).enquiry.update({ where: { id }, data: body }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).enquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
