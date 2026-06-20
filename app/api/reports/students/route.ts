import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");
  const gender = searchParams.get("gender");
  const status = searchParams.get("status"); // "active" | "inactive" | "all"

  const where: any = {};
  if (gender) where.gender = gender;
  if (status === "active") where.isActive = true;
  else if (status === "inactive") where.isActive = false;

  const sessionFilter: any = {};
  if (sessionId) sessionFilter.sessionId = sessionId;
  if (classId || sectionId) {
    const csWhere: any = {};
    if (classId) csWhere.classId = classId;
    if (sectionId) csWhere.sectionId = sectionId;
    const csList = await ((await getDb()) as any).classSection.findMany({ where: csWhere, select: { id: true } });
    sessionFilter.classSectionId = { in: csList.map((cs: any) => cs.id) };
  }

  const students = await ((await getDb()) as any).student.findMany({
    where: {
      ...where,
      ...(Object.keys(sessionFilter).length > 0
        ? { sessions: { some: sessionFilter } }
        : {}),
    },
    include: {
      sessions: {
        where: Object.keys(sessionFilter).length > 0 ? sessionFilter : undefined,
        include: {
          session: { select: { session: true } },
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
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return NextResponse.json(students);
}
