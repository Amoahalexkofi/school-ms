import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { studentId, routeId, pickupPointId } = await req.json();
    if (!studentId || !routeId) return NextResponse.json({ error: "studentId and routeId required" }, { status: 422 });
    const r = await ((await getDb()) as any).studentRoute.upsert({
      where:  { studentId },
      create: { studentId, routeId, pickupPointId: pickupPointId || null },
      update: { routeId, pickupPointId: pickupPointId || null },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { studentId } = await req.json();
    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 422 });
    await ((await getDb()) as any).studentRoute.delete({ where: { studentId } });
    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
