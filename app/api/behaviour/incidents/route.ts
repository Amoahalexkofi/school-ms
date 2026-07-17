import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";

// GET /api/behaviour/incidents?studentId= | ?classSectionId=&sessionId= | recent
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const studentId = sp.get("studentId");
  const db = await getDb();
  const incidents = await (db as any).studentIncident.findMany({
    where: studentId ? { studentId } : {},
    orderBy: { date: "desc" },
    take: studentId ? 100 : 50,
    include: {
      incidentType: { select: { title: true, points: true } },
      student: {
        select: {
          id: true, firstName: true, lastName: true, admissionNo: true,
          sessions: {
            where: { isActive: true }, take: 1,
            select: { classSection: { select: { class: { select: { name: true } }, section: { select: { name: true } } } } },
          },
        },
      },
    },
  });
  return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, incidentTypeId, date, note } = await req.json();
    if (!studentId || !incidentTypeId || !date) {
      return NextResponse.json({ error: "studentId, incidentTypeId and date are required" }, { status: 422 });
    }
    const db = await getDb();
    const session = await auth();
    const staff = await (db as any).staff
      .findFirst({ where: { userId: (session?.user as any)?.id }, select: { id: true } })
      .catch(() => null);
    const incident = await (db as any).studentIncident.create({
      data: {
        studentId, incidentTypeId,
        date: new Date(date),
        note: note || null,
        assignedById: staff?.id ?? null,
      },
      include: { incidentType: { select: { title: true, points: true } } },
    });
    await audit("behaviour.log_incident", "StudentIncident", incident.id, { studentId, incidentTypeId });
    return NextResponse.json(incident, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
