import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AlumniClient } from "./AlumniClient";

const LIMIT = 25;

async function getData(sp: { page?: string; search?: string; sessionId?: string; classId?: string }) {
  const page = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const search = sp.search?.trim() ?? "";

  // Server-side filters on the linked student
  const studentFilter: any = {};
  if (search) {
    studentFilter.OR = [
      { firstName:   { contains: search, mode: "insensitive" } },
      { lastName:    { contains: search, mode: "insensitive" } },
      { admissionNo: { contains: search, mode: "insensitive" } },
    ];
  }
  const sessionSome: any = {};
  if (sp.sessionId) sessionSome.sessionId = sp.sessionId;
  if (sp.classId)   sessionSome.classSection = { classId: sp.classId };
  if (Object.keys(sessionSome).length) studentFilter.sessions = { some: sessionSome };
  const where = Object.keys(studentFilter).length ? { student: studentFilter } : {};

  const db = (await getDb()) as any;
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  const [total, totalAll, thisYear, male, female] = await Promise.all([
    db.alumni.count({ where }),
    db.alumni.count(),
    db.alumni.count({ where: { createdAt: { gte: startOfYear } } }),
    db.alumni.count({ where: { student: { gender: "Male" } } }),
    db.alumni.count({ where: { student: { gender: "Female" } } }),
  ]);

  const [alumni, sessions, classes, students] = await Promise.all([
    ((await getDb()) as any).alumni.findMany({
      where,
      skip: (page - 1) * LIMIT,
      take: LIMIT,
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
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    // Students eligible to be marked as alumni: disabled students OR students
    // flagged isAlumni on a session (promote-with-leave — they stay isActive
    // like Smart School), minus those who already have an Alumni record.
    ((await getDb()) as any).student.findMany({
      where: {
        alumni: { is: null },
        OR: [{ isActive: false }, { sessions: { some: { isAlumni: true } } }],
      },
      select: {
        id: true, firstName: true, lastName: true, admissionNo: true,
        sessions: {
          include: {
            session: { select: { session: true } },
            classSection: { include: { class: { select: { name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ firstName: "asc" }],
      take: 200,
    }),
  ]);
  return {
    alumni, sessions, classes, students,
    total, page, totalPages: Math.ceil(total / LIMIT), limit: LIMIT,
    counts: { total: totalAll, thisYear, male, female },
    filters: { search, sessionId: sp.sessionId ?? "", classId: sp.classId ?? "" },
  };
}

export default async function AlumniPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; sessionId?: string; classId?: string }>;
}) {
  const data = await getData(await searchParams);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Alumni" />
      <AlumniClient {...data} />
    </div>
  );
}
