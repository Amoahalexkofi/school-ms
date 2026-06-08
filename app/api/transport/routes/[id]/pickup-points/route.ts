import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: routeId } = await params;
  try {
    const { pickupPointId, timing, fees, order } = await req.json();
    if (!pickupPointId) return NextResponse.json({ error: "pickupPointId required" }, { status: 422 });
    const db = await getDb();
    const rpp = await (db as any).routePickupPoint.create({
      data: {
        routeId,
        pickupPointId,
        timing: timing || null,
        fees: fees ? parseFloat(fees) : null,
        order: order ?? 0,
      },
      include: { pickupPoint: true },
    });
    return NextResponse.json(rpp, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Point already on this route" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
