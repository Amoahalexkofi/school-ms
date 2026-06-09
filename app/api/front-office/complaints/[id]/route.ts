import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
const ALLOWED = [
  "title","raisedBy","phone","complaintTypeId","description",
  "source","assignedTo","date","image","status","resolution","actionTaken","resolvedBy","resolvedAt",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (["date","resolvedAt"].includes(key) && body[key]) data[key] = new Date(body[key]);
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).complaint.update({ where: { id }, data }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).complaint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
