import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { LessonPlanClient } from "./LessonPlanClient";

export default async function LessonPlansPage() {
  const db = await getDb();
  const [classes, sessions, staff] = await Promise.all([
    (db as any).class.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    (db as any).academicSession.findMany({ select: { id: true, session: true, isActive: true }, orderBy: { startDate: "desc" } }),
    (db as any).staff.findMany({
      where: { user: { role: { in: ["TEACHER", "ADMIN", "SUPER_ADMIN"] }, isActive: true } },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }),
  ]);
  const currentSession = sessions.find((s: any) => s.isActive) ?? sessions[0] ?? null;
  const teachers = staff.map((s: any) => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, employeeId: s.employeeId }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Lesson Plan" />
      <main className="flex-1 p-4 md:p-6">
        <LessonPlanClient
          classes={classes}
          sessions={sessions}
          teachers={teachers}
          currentSessionId={currentSession?.id ?? ""}
        />
      </main>
    </div>
  );
}
