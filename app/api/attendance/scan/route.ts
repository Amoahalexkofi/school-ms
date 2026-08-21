import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isWithinGeofence } from "@/lib/geofence";
import { markAttendance, markStaffAttendance } from "@/lib/services/attendance";
import { isRateLimited } from "@/lib/rate-limit";

function todayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Whoever is operating the scanner (kiosk or their own phone) — a rate
  // limit here is just abuse protection, not the actual security control
  // (that's the geofence check below).
  if (isRateLimited(`attendance-scan:${session.user.id}`, 60, 60 * 1000)) {
    return NextResponse.json({ error: "Too many scans — slow down a moment" }, { status: 429 });
  }

  const { code, lat, lng } = await req.json();
  if (typeof code !== "string" || !code.startsWith("SKULA:")) {
    return NextResponse.json({ error: "Not a valid attendance QR code" }, { status: 422 });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Location is required to mark attendance — allow location access and try again" }, { status: 422 });
  }

  const [, kind, identifier] = code.split(":");
  if ((kind !== "STUDENT" && kind !== "STAFF") || !identifier) {
    return NextResponse.json({ error: "Not a valid attendance QR code" }, { status: 422 });
  }

  const db = await getDb();

  const profile = await (db as any).schoolProfile.findFirst({
    select: { latitude: true, longitude: true, geofenceRadius: true },
  });
  const geofence = isWithinGeofence(profile ?? { latitude: null, longitude: null, geofenceRadius: null }, { lat, lng });
  if (!geofence.ok) {
    return NextResponse.json({ error: geofence.reason }, { status: 403 });
  }

  const date = todayStart();

  if (kind === "STUDENT") {
    const student = await (db as any).student.findUnique({
      where: { admissionNo: identifier },
      select: {
        id: true, firstName: true, lastName: true,
        sessions: {
          orderBy: { createdAt: "desc" }, take: 1,
          select: { id: true, sessionId: true, classSectionId: true },
        },
      },
    });
    const enroll = student?.sessions?.[0];
    if (!student || !enroll) {
      return NextResponse.json({ error: "Student card not recognized" }, { status: 404 });
    }

    const attendanceDay = await (db as any).attendanceDay.findUnique({
      where: { date_classSectionId: { date, classSectionId: enroll.classSectionId } },
    });
    if (attendanceDay) {
      const existing = await (db as any).studentAttendance.findUnique({
        where: { studentSessionId_attendanceDayId: { studentSessionId: enroll.id, attendanceDayId: attendanceDay.id } },
        include: { attendanceType: true },
      });
      if (existing) {
        return NextResponse.json({
          ok: true, already: true, name: `${student.firstName} ${student.lastName}`,
          status: existing.attendanceType?.type ?? "marked",
        });
      }
    }

    const presentType = await (db as any).attendanceType.findUnique({ where: { keyValue: "P" } });
    if (!presentType) return NextResponse.json({ error: "No 'Present' attendance type configured" }, { status: 500 });

    await markAttendance({
      classSectionId: enroll.classSectionId,
      sessionId: enroll.sessionId,
      date,
      records: [{ studentId: student.id, studentSessionId: enroll.id, attendanceTypeId: presentType.id, inTime: new Date().toISOString() }],
    });

    return NextResponse.json({ ok: true, already: false, name: `${student.firstName} ${student.lastName}`, status: "Present" });
  }

  // STAFF
  const staff = await (db as any).staff.findUnique({
    where: { employeeId: identifier },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!staff) return NextResponse.json({ error: "Staff card not recognized" }, { status: 404 });

  const existing = await (db as any).staffAttendance.findUnique({
    where: { staffId_date: { staffId: staff.id, date } },
    include: { staffAttendanceType: true },
  });
  if (existing) {
    return NextResponse.json({
      ok: true, already: true, name: `${staff.firstName} ${staff.lastName}`,
      status: existing.staffAttendanceType?.type ?? "marked",
    });
  }

  const presentType = await (db as any).staffAttendanceType.findUnique({ where: { keyValue: "P" } });
  if (!presentType) return NextResponse.json({ error: "No 'Present' attendance type configured" }, { status: 500 });

  await markStaffAttendance({ staffId: staff.id, date, staffAttendanceTypeId: presentType.id, inTime: new Date().toISOString() });

  return NextResponse.json({ ok: true, already: false, name: `${staff.firstName} ${staff.lastName}`, status: "Present" });
}
