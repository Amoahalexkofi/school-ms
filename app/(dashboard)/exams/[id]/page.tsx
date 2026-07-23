import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Topbar } from "@/components/Topbar";
import { ExamGroupDetailClient } from "./ExamGroupDetailClient";

export default async function ExamGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth().catch(() => null);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;

  // TEACHER sees which schedules are theirs to mark (null = unrestricted, e.g. ADMIN).
  let mySubjectIds: string[] | null = null;
  if (role === "TEACHER" && userId) {
    const db = (await getDb()) as any;
    const staff = await db.staff.findUnique({ where: { userId }, select: { id: true } });
    mySubjectIds = staff
      ? (await db.teacherSubject.findMany({ where: { staffId: staff.id }, select: { subjectId: true } }))
          .map((t: any) => t.subjectId)
      : [];
  }

  const [group, sessions, classSections, subjects] = await Promise.all([
    ((await getDb()) as any).examGroup.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            subject:      { select: { name: true, code: true } },
            session:      { select: { session: true } },
            classSection: { include: { class: true, section: true } },
            _count:       { select: { markEntries: true } },
          },
          orderBy: [{ classSectionId: "asc" }, { dateOfExam: "asc" }],
        },
      },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    ((await getDb()) as any).subject.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!group) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title={group.name} />
      <ExamGroupDetailClient group={group} sessions={sessions} classSections={classSections} subjects={subjects} mySubjectIds={mySubjectIds} />
    </div>
  );
}
