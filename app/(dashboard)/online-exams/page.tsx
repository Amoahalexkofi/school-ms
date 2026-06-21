import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/Topbar";
import { OnlineExamsClient } from "./OnlineExamsClient";
import { StudentExamsClient } from "./StudentExamsClient";

const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER"];

async function getStaffData() {
  const [exams, classes, subjects] = await Promise.all([
    ((await getDb()) as any).onlineExam.findMany({
      include: {
        class: { select: { id: true, name: true } },
        _count: { select: { questions: true, attempts: true } },
        attempts: {
          where: { submittedAt: { not: null } },
          select: { score: true, total: true },
        },
      },
      orderBy: { startTime: "desc" },
    }),
    ((await getDb()) as any).class.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).subject.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { exams, classes, subjects };
}

async function getStudentData(userId?: string) {
  const db = await getDb();

  const student = userId
    ? await (db as any).student
        .findUnique({
          where: { userId },
          include: {
            sessions: {
              include: { classSection: { include: { class: true } } },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        })
        .catch(() => null)
    : null;

  const classId = student?.sessions?.[0]?.classSection?.class?.id ?? null;

  // Only published exams, scoped to the student's class (classId null = any class)
  const exams = await (db as any).onlineExam
    .findMany({
      where: {
        isPublished: true,
        ...(classId ? { OR: [{ classId: null }, { classId }] } : {}),
      },
      include: {
        class: { select: { name: true } },
        _count: { select: { questions: true } },
        ...(student
          ? {
              attempts: {
                where: { studentId: student.id },
                select: { id: true, score: true, total: true, submittedAt: true },
              },
            }
          : {}),
      },
      orderBy: { startTime: "desc" },
    })
    .catch(() => []);

  return { exams, hasProfile: !!student };
}

export default async function OnlineExamsPage() {
  const session = await auth();
  const role = (session?.user as any)?.role ?? "";

  if (STAFF_ROLES.includes(role)) {
    const data = await getStaffData();
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Online Exams" />
        <OnlineExamsClient {...data} />
      </div>
    );
  }

  // Students (and parents) only see published exams they can take — never the
  // create / edit / publish / delete controls.
  const data = await getStudentData((session?.user as any)?.id);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Online Exams" />
      <StudentExamsClient {...data} />
    </div>
  );
}
