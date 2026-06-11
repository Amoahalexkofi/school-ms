import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { SubjectGroupsClient } from "./SubjectGroupsClient";

export default async function SubjectGroupsPage() {
  const db = await getDb();
  const [sessions, groups, subjects, classSections] = await Promise.all([
    (db as any).academicSession.findMany({ orderBy: { createdAt: "desc" } }),
    (db as any).subjectGroup.findMany({
      include: {
        subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
        sections: {
          include: {
            classSection: {
              include: {
                class:   { select: { id: true, class: true } },
                section: { select: { id: true, section: true } },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    (db as any).subject.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, type: true },
    }),
    (db as any).classSection.findMany({
      where: { isActive: true },
      include: {
        class:   { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: [{ class: { name: "asc" } }, { section: { name: "asc" } }],
    }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Subject Groups" />
      <SubjectGroupsClient
        sessions={sessions}
        groups={groups}
        subjects={subjects}
        classSections={classSections}
      />
    </div>
  );
}
