import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  // Add pickup point to route
  if (body.addPickupPointId) {
    await ((await getDb()) as any).routePickupPoint.create({
      data: { routeId: id, pickupPointId: body.addPickupPointId, timing: body.timing || null, fees: body.fees ? parseFloat(body.fees) : null, order: body.order || 0 },
    });
    return NextResponse.json({ ok: true });
  }
  const r = await ((await getDb()) as any).route.update({ where: { id }, data: { title: body.title, vehicleId: body.vehicleId || null } });
  return NextResponse.json(r);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).route.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
