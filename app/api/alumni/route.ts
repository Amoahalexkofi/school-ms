import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const sessionId = searchParams.get("sessionId");
  const classId = searchParams.get("classId");

  const studentWhere: any = {};
  if (search) {
    studentWhere.OR = [
      { admissionNo: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by pass-out session/class via StudentSession
  if (sessionId || classId) {
    const ssWhere: any = {};
    if (sessionId) ssWhere.sessionId = sessionId;
    if (classId) ssWhere.classSection = { classId };
    studentWhere.sessions = { some: ssWhere };
  }

  const alumni = await ((await getDb()) as any).alumni.findMany({
    include: {
      student: {
        select: {
          id: true, firstName: true, lastName: true, admissionNo: true,
          gender: true, image: true,
          sessions: {
            include: {
              session: { select: { id: true, session: true } },
              classSection: {
                include: {
                  class: { select: { name: true } },
                  section: { select: { name: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        where: studentWhere,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Filter out nulls (when studentWhere filters out some students)
  const filtered = alumni.filter((a: any) => a.student);
  return NextResponse.json(filtered);
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, currentEmail, currentPhone, occupation, address, photo, note } = await req.json();
    if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 422 });

    const db = await getDb();
    // The alumni flag lives on StudentSession (Smart School student_session.is_alumni),
    // not on Student — flag the most recent enrollment.
    const latest = await (db as any).studentSession.findFirst({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (latest) {
      await (db as any).studentSession.update({ where: { id: latest.id }, data: { isAlumni: true } });
    }

    const alumniData = {
      currentEmail: currentEmail || null,
      currentPhone: currentPhone || null,
      occupation:   occupation   || null,
      address:      address      || null,
      photo:        photo        || null,
      note:         note         || null,
    };

    const existing = await (db as any).alumni.findUnique({ where: { studentId } });
    const alumni = existing
      ? await (db as any).alumni.update({ where: { studentId }, data: alumniData })
      : await (db as any).alumni.create({ data: { studentId, ...alumniData } });

    return NextResponse.json(alumni, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
