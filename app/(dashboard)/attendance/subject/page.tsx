import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { requireStaffPage } from "@/lib/auth/guards";
import { SubjectAttendanceClient } from "./SubjectAttendanceClient";

export default async function SubjectAttendancePage() {
  await requireStaffPage("/attendance");
  const db = (await getDb()) as any;
  const [classSections, attendanceTypes] = await Promise.all([
    db.classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
    db.attendanceType.findMany({ where: { isActive: true }, orderBy: { keyValue: "asc" } }),
  ]);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Period Attendance" />
      <SubjectAttendanceClient classSections={classSections} attendanceTypes={attendanceTypes} />
    </div>
  );
}
