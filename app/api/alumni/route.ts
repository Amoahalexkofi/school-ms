import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const alumni = await (prisma as any).alumni.findMany({
    include: {
      student: {
        select: {
          id: true, firstName: true, lastName: true, admissionNo: true,
          gender: true, image: true, isAlumni: true,
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
    const body = await req.json();
    const { studentId, ...data } = body;

    // Mark student as alumni
    await (prisma as any).student.update({
      where: { id: studentId },
      data: { isAlumni: true },
    });

    // Create or update alumni record
    const existing = await (prisma as any).alumni.findUnique({ where: { studentId } });
    const alumni = existing
      ? await (prisma as any).alumni.update({ where: { studentId }, data })
      : await (prisma as any).alumni.create({ data: { studentId, ...data } });

    return NextResponse.json(alumni, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
