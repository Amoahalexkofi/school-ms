import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// `location` never existed on PickupPoint (name/latitude/longitude/isActive
// are the real fields) — this would have thrown if a caller ever sent it.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, latitude, longitude, isActive } = await req.json();
  const data: any = {};
  if (name      !== undefined) data.name      = name?.trim() || null;
  if (latitude  !== undefined) data.latitude  = latitude  === "" || latitude  === null ? null : parseFloat(latitude);
  if (longitude !== undefined) data.longitude = longitude === "" || longitude === null ? null : parseFloat(longitude);
  if (isActive  !== undefined) data.isActive  = Boolean(isActive);
  try {
    const p = await ((await getDb()) as any).pickupPoint.update({ where: { id }, data });
    return NextResponse.json(p);
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "A pickup point with this name already exists" }, { status: 422 });
    return NextResponse.json({ error: "Failed to update pickup point" }, { status: 500 });
  }
}

// Soft delete — a hard delete would throw on any RoutePickupPoint/
// StudentRoute/StudentSession still referencing this point.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).pickupPoint.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
