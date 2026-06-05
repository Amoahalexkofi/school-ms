import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { StudentsClient } from "./StudentsClient";

async function getData() {
  const [students, sessions, classSections, schoolHouses] = await Promise.all([
    ((await getDb()) as any).student.findMany({
      include: {
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        schoolHouse: true,
      },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    ((await getDb()) as any).schoolHouse.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { students, sessions, classSections, schoolHouses };
}

export default async function StudentsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Students" />
      <StudentsClient {...data} />
    </div>
  );
}
