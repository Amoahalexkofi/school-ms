import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED = ["roomNo","hostelId","roomTypeId","capacity","costPerBed","title","description","isActive"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of ALLOWED) {
    if (key in body) {
      if (key === "capacity" && body[key] !== undefined)  data[key] = body[key] ? parseInt(body[key])   : null;
      else if (key === "costPerBed" && body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  return NextResponse.json(await ((await getDb()) as any).hostelRoom.update({ where: { id }, data }));
}
// Soft delete — a hard delete would throw on any HostelAllocation/
// StudentSession still referencing this room; matches the app-wide
// isActive convention. Still blocks while occupied so a room doesn't
// silently vanish out from under a current resident.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).hostelAllocation.count({ where: { roomId: id } });
  if (count > 0) return NextResponse.json({ error: "Room has occupants" }, { status: 409 });
  await ((await getDb()) as any).hostelRoom.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
