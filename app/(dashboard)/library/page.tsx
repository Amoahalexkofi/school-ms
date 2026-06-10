import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const db = await getDb();
  const [books, issues, students, staff, memberRaw] = await Promise.all([
    (db as any).book.findMany({
      where: { isActive: true },
      include: { _count: { select: { issues: true } } },
      orderBy: { title: "asc" },
    }),
    (db as any).bookIssue.findMany({
      include: {
        book:    { select: { title: true, bookNo: true } },
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        staff:   { select: { firstName: true, lastName: true, employeeId: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
    (db as any).student.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, admissionNo: true }, orderBy: { firstName: "asc" } }),
    (db as any).staff.findMany({ where: { isActive: true }, select: { id: true, firstName: true, lastName: true, employeeId: true }, orderBy: { firstName: "asc" } }),
    (db as any).libraryMember.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
  ]);

  // Enrich members with names
  const studentMap = new Map(students.map((s: any) => [s.id, s]));
  const staffMap   = new Map(staff.map((s: any) => [s.id, s]));
  const members = memberRaw.map((m: any) => ({
    ...m,
    person: m.memberType === "student" ? studentMap.get(m.memberId) : staffMap.get(m.memberId),
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Library" />
      <LibraryClient books={books} issues={issues} students={students} staff={staff} members={members} />
    </div>
  );
}
