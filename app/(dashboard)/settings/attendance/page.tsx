import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { AttendanceSettingsClient } from "./AttendanceSettingsClient";

async function getData() {
  const [classSections, attendanceTypes, staffAttendanceTypes, studentSchedules, staffSchedules] = await Promise.all([
    ((await getDb()) as any).classSection.findMany({
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    ((await getDb()) as any).attendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
    ((await getDb()) as any).staffAttendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
    ((await getDb()) as any).studentAttendanceSchedule.findMany({
      where: { isActive: true },
      include: { classSection: true, attendanceType: true },
    }),
    ((await getDb()) as any).staffAttendanceSchedule.findMany({
      where: { isActive: true },
      include: { staffAttendanceType: true },
    }),
  ]);
  return { classSections, attendanceTypes, staffAttendanceTypes, studentSchedules, staffSchedules };
}

export default async function AttendanceSettingsPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Attendance Settings" />
      <AttendanceSettingsClient {...data} />
    </div>
  );
}
