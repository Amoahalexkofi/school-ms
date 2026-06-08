import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Studenttransportfee_model::add() + update():
// 1. Set student_session.route_pickup_point_id (the assigned stop)
// 2. Create student_transport_fees rows for every TransportFeemaster in the session
//    (one row per month, so fees can be collected monthly)
export async function POST(req: NextRequest) {
  try {
    const { studentSessionId, routePickupPointId } = await req.json();
    if (!studentSessionId || !routePickupPointId)
      return NextResponse.json({ error: "studentSessionId and routePickupPointId required" }, { status: 422 });

    const db = await getDb();

    // Get the student session to know the sessionId
    const ss = await (db as any).studentSession.findUnique({ where: { id: studentSessionId } });
    if (!ss) return NextResponse.json({ error: "Student session not found" }, { status: 404 });

    // Update student_session.route_pickup_point_id (Smart School stores this on student_session)
    await (db as any).studentSession.update({
      where: { id: studentSessionId },
      data:  { routePickupPointId },
    });

    // Get all transport fee masters for this session (monthly fee schedule)
    const feemasters = await (db as any).transportFeemaster.findMany({
      where: { sessionId: ss.sessionId, isActive: true },
    });

    // Create student_transport_fees rows for each month (skip if already exists)
    let created = 0;
    for (const fm of feemasters) {
      const exists = await (db as any).studentTransportFee.findFirst({
        where: { studentSessionId, routePickupPointId, transportFeemasterId: fm.id },
      });
      if (!exists) {
        await (db as any).studentTransportFee.create({
          data: { studentSessionId, routePickupPointId, transportFeemasterId: fm.id },
        });
        created++;
      }
    }

    // Also keep the legacy StudentRoute record in sync
    await (db as any).studentRoute.upsert({
      where:  { studentId: ss.studentId },
      create: { studentId: ss.studentId, routeId: (await (db as any).routePickupPoint.findUnique({ where: { id: routePickupPointId }, select: { routeId: true } }))?.routeId, pickupPointId: (await (db as any).routePickupPoint.findUnique({ where: { id: routePickupPointId }, select: { pickupPointId: true } }))?.pickupPointId },
      update: { pickupPointId: (await (db as any).routePickupPoint.findUnique({ where: { id: routePickupPointId }, select: { pickupPointId: true } }))?.pickupPointId },
    });

    return NextResponse.json({ ok: true, transportFeesCreated: created }, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}

export async function DELETE(req: NextRequest) {
  try {
    const { studentSessionId } = await req.json();
    if (!studentSessionId) return NextResponse.json({ error: "studentSessionId required" }, { status: 422 });

    const db = await getDb();

    // Clear the pickup point assignment on student_session
    await (db as any).studentSession.update({
      where: { id: studentSessionId },
      data:  { routePickupPointId: null },
    });

    // Delete all student_transport_fees for this session (unassign from route)
    await (db as any).studentTransportFee.deleteMany({ where: { studentSessionId } });

    return NextResponse.json({ ok: true });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
