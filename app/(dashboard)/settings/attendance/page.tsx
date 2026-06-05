import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AttendanceSettingsClient } from "./AttendanceSettingsClient";

async function getData() {
  const [classSections, attendanceTypes, staffAttendanceTypes, studentSchedules, staffSchedules] = await Promise.all([
    (prisma as any).classSection.findMany({
      include: {
        class: { select: { id: true, name: true } },
        section: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    (prisma as any).attendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
    (prisma as any).staffAttendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
    (prisma as any).studentAttendanceSchedule.findMany({
      where: { isActive: true },
      include: { classSection: true, attendanceType: true },
    }),
    (prisma as any).staffAttendanceSchedule.findMany({
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
