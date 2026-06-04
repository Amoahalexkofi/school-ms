import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { AttendanceReportClient } from "./AttendanceReportClient";

export default async function AttendanceReportPage() {
  const [sessions, classSections] = await Promise.all([
    (prisma as any).academicSession.findMany({ orderBy: { startDate: "desc" } }),
    (prisma as any).classSection.findMany({
      include: { class: true, section: true },
      orderBy: { class: { name: "asc" } },
    }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Attendance Report" />
      <AttendanceReportClient sessions={sessions} classSections={classSections} />
    </div>
  );
}
