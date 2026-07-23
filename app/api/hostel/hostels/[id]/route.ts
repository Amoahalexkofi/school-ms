import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["name","address","intake","description","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (key === "intake" && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).hostel.update({ where: { id }, data }));
}
// Soft delete — HostelRoom.hostel cascades on a real delete, which would in
// turn hit Restrict on any HostelAllocation/StudentSession still pointing at
// one of those rooms. isActive:false matches the app-wide convention and
// simply hides the hostel (and, since the rooms list nests under it in the
// UI, its rooms) without touching any row a student record depends on.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).hostel.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
