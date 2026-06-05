import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AttendanceClient } from "./AttendanceClient";

async function getData() {
  const [sessions, classSections, attendanceTypes] = await Promise.all([
    ((await getDb()) as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    ((await getDb()) as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    ((await getDb()) as any).attendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
  ]);
  return { sessions, classSections, attendanceTypes };
}

export default async function AttendancePage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Student Attendance" />
      <AttendanceClient {...data} />
    </div>
  );
}
