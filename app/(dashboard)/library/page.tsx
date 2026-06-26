import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { Topbar } from "@/components/Topbar";
import { LibraryClient } from "./LibraryClient";

export default async function LibraryPage() {
  const db = await getDb();
  const branchId = await getActiveBranchId();
  const bScope = branchId ? { branchId } : {}; // active-branch filter (Multi Branch)
  const [books, issues, students, staff, memberRaw] = await Promise.all([
    (db as any).book.findMany({
      where: { isActive: true, ...bScope },
      include: { _count: { select: { issues: true } } },
      orderBy: { title: "asc" },
    }),
    (db as any).bookIssue.findMany({
      where: branchId ? { book: { branchId } } : {},
      include: {
        book:    { select: { title: true, bookNo: true } },
        student: { select: { firstName: true, lastName: true, admissionNo: true } },
        staff:   { select: { firstName: true, lastName: true, employeeId: true } },
      },
      orderBy: { issuedAt: "desc" },
      take: 100,
    }),
    (db as any).student.findMany({ where: { isActive: true, ...bScope }, select: { id: true, firstName: true, lastName: true, admissionNo: true }, orderBy: { firstName: "asc" } }),
    (db as any).staff.findMany({ where: { isActive: true, ...bScope }, select: { id: true, firstName: true, lastName: true, employeeId: true }, orderBy: { firstName: "asc" } }),
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
