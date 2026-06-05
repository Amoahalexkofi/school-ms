import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AddStudentForm } from "./AddStudentForm";

async function getData() {
  const [sessions, classSections, schoolHouses] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    (prisma as any).schoolHouse.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { sessions, classSections, schoolHouses };
}

export default async function NewStudentPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Add Student" />
      <AddStudentForm {...data} />
    </div>
  );
}
