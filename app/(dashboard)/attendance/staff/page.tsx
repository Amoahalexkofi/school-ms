import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { StaffAttendanceClient } from "./StaffAttendanceClient";

export default async function StaffAttendancePage() {
  const [departments, staffAttendanceTypes] = await Promise.all([
    (prisma as any).department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    (prisma as any).staffAttendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Staff Attendance" />
      <StaffAttendanceClient departments={departments} attendanceTypes={staffAttendanceTypes} />
    </div>
  );
}
