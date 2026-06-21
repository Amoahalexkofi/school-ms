import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Studenttransportfee_model::add() + update():
// 1. Set student_session.route_pickup_point_id (the assigned stop)
// 2. Create student_transport_fees rows for every TransportFeemaster in the session
//
// The UI works with natural ids (studentId, routeId, pickupPointId), so we
// resolve them here to the studentSession + routePickupPoint the model needs.
// We also still accept pre-resolved {studentSessionId, routePickupPointId}.

async function resolveStudentSessionId(db: any, body: any): Promise<string | null> {
  if (body.studentSessionId) return body.studentSessionId;
  if (!body.studentId) return null;
  const ss = await db.studentSession.findFirst({
    where: { studentId: body.studentId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return ss?.id ?? null;
}

async function resolveRoutePickupPointId(db: any, body: any): Promise<string | null> {
  if (body.routePickupPointId) return body.routePickupPointId;
  if (!body.routeId) return null;
  // Specific stop chosen → find (or create) the route↔stop link
  if (body.pickupPointId) {
    const existing = await db.routePickupPoint.findFirst({
      where: { routeId: body.routeId, pickupPointId: body.pickupPointId },
    });
    if (existing) return existing.id;
    const created = await db.routePickupPoint.create({
      data: { routeId: body.routeId, pickupPointId: body.pickupPointId },
    });
    return created.id;
  }
  // No stop chosen → use the route's first stop
  const first = await db.routePickupPoint.findFirst({ where: { routeId: body.routeId } });
  return first?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = (await getDb()) as any;

    const studentSessionId = await resolveStudentSessionId(db, body);
    if (!studentSessionId)
      return NextResponse.json({ error: "Could not find an active enrollment for this student" }, { status: 422 });

    const routePickupPointId = await resolveRoutePickupPointId(db, body);
    if (!routePickupPointId)
      return NextResponse.json({ error: "Route has no pickup point. Add a stop to the route first." }, { status: 422 });

    const ss = await db.studentSession.findUnique({ where: { id: studentSessionId } });
    if (!ss) return NextResponse.json({ error: "Student session not found" }, { status: 404 });

    // Assign the stop on the student's session
    await db.studentSession.update({
      where: { id: studentSessionId },
      data: { routePickupPointId },
    });

    // Create monthly transport-fee rows for the session (skip existing)
    const feemasters = await db.transportFeemaster.findMany({
      where: { sessionId: ss.sessionId, isActive: true },
    });
    let created = 0;
    for (const fm of feemasters) {
      const exists = await db.studentTransportFee.findFirst({
        where: { studentSessionId, routePickupPointId, transportFeemasterId: fm.id },
      });
      if (!exists) {
        await db.studentTransportFee.create({
          data: { studentSessionId, routePickupPointId, transportFeemasterId: fm.id },
        });
        created++;
      }
    }

    // Keep the legacy StudentRoute record in sync
    const rpp = await db.routePickupPoint.findUnique({
      where: { id: routePickupPointId },
      select: { routeId: true, pickupPointId: true },
    });
    await db.studentRoute.upsert({
      where: { studentId: ss.studentId },
      create: { studentId: ss.studentId, routeId: rpp?.routeId, pickupPointId: rpp?.pickupPointId },
      update: { routeId: rpp?.routeId, pickupPointId: rpp?.pickupPointId },
    });

    return NextResponse.json({ ok: true, transportFeesCreated: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const db = (await getDb()) as any;

    const studentSessionId = await resolveStudentSessionId(db, body);
    if (!studentSessionId)
      return NextResponse.json({ error: "studentId or studentSessionId required" }, { status: 422 });

    const ss = await db.studentSession.findUnique({ where: { id: studentSessionId } });

    await db.studentSession.update({
      where: { id: studentSessionId },
      data: { routePickupPointId: null },
    });
    await db.studentTransportFee.deleteMany({ where: { studentSessionId } });
    if (ss?.studentId) {
      await db.studentRoute.deleteMany({ where: { studentId: ss.studentId } });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
