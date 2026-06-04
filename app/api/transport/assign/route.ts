import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { studentId, routeId, pickupPointId } = await req.json();
    if (!studentId || !routeId) return NextResponse.json({ error: "studentId and routeId required" }, { status: 422 });
    const r = await (prisma as any).studentRoute.upsert({
      where:  { studentId },
      create: { studentId, routeId, pickupPointId: pickupPointId || null },
      update: { routeId, pickupPointId: pickupPointId || null },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
