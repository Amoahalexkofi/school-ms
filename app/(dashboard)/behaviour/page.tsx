import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { BehaviourClient } from "./BehaviourClient";

export default async function BehaviourPage() {
  const db = await getDb();
  const [types, recent, topStudents] = await Promise.all([
    (db as any).incidentType.findMany({
      where: { isActive: true },
      orderBy: [{ points: "asc" }, { title: "asc" }],
      include: { _count: { select: { incidents: true } } },
    }).catch(() => []),
    (db as any).studentIncident.findMany({
      orderBy: { date: "desc" },
      take: 30,
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
    }).catch(() => []),
    // net conduct points per student (worst first) — the head's watch list
    (db as any).studentIncident.groupBy({
      by: ["studentId"],
      _count: { _all: true },
    }).catch(() => []),
  ]);

  // resolve points + names for the watch list (groupBy can't sum a relation)
  const allIncidents = await (db as any).studentIncident.findMany({
    select: { studentId: true, incidentType: { select: { points: true } } },
  }).catch(() => []);
  const pointsByStudent: Record<string, number> = {};
  for (const i of allIncidents) {
    pointsByStudent[i.studentId] = (pointsByStudent[i.studentId] ?? 0) + (i.incidentType?.points ?? 0);
  }
  const watchIds = Object.entries(pointsByStudent).sort(([, a], [, b]) => a - b).slice(0, 5).map(([id]) => id);
  const watchStudents = watchIds.length
    ? await (db as any).student.findMany({
        where: { id: { in: watchIds } },
        select: { id: true, firstName: true, lastName: true, admissionNo: true },
      }).catch(() => [])
    : [];
  const watchList = watchIds
    .map((id) => {
      const st = watchStudents.find((s: any) => s.id === id);
      return st ? { ...st, points: pointsByStudent[id] } : null;
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Behaviour Records" />
      <BehaviourClient types={types} recent={recent} watchList={watchList as any[]} />
    </div>
  );
}
