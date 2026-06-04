import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const [books, issues, students, staff] = await Promise.all([
    (prisma as any).book.findMany({
      where: { isActive: true },
      include: { _count: { select: { issues: true } } },
      orderBy: { title: "asc" },
    }),
    (prisma as any).bookIssue.findMany({
      include: {
        book:    { select: { title: true, bookNo: true } },
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        staff:   { select: { firstName: true, lastName: true, employeeId: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
    (prisma as any).student.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, admissionNo: true }, orderBy: { firstName: "asc" } }),
    (prisma as any).staff.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, employeeId: true }, orderBy: { firstName: "asc" } }),
  ]);
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Library" />
      <LibraryClient books={books} issues={issues} students={students} staff={staff} />
    </div>
  );
}
