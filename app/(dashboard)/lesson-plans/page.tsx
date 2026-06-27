import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { LessonPlanClient } from "./LessonPlanClient";

export default async function LessonPlansPage() {
  const db = await getDb();
  const [classes, sessions] = await Promise.all([
    (db as any).class.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    (db as any).academicSession.findMany({ select: { id: true, session: true, isActive: true }, orderBy: { startDate: "desc" } }),
  ]);
  const currentSession = sessions.find((s: any) => s.isActive) ?? sessions[0] ?? null;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Lesson Plan" />
      <main className="flex-1 p-4 md:p-6">
        <LessonPlanClient
          classes={classes}
          sessions={sessions}
          currentSessionId={currentSession?.id ?? ""}
        />
      </main>
    </div>
  );
}
