import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { IssueBookForm } from "./IssueBookForm";

export default async function IssueBookPage() {
  const [books, students, staff, members] = await Promise.all([
    ((await getDb()) as any).book.findMany({
      where: { isActive: true },
      include: { _count: { select: { issues: true } } },
      orderBy: { title: "asc" },
    }),
    ((await getDb()) as any).student.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, admissionNo: true },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).staff.findMany({
      where: { isActive: true },
      select: { id: true, firstName: true, lastName: true, employeeId: true },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).libraryMember.findMany({ where: { isActive: true }, select: { memberType: true, memberId: true } }),
  ]);

  // Compute available count for each book
  const booksWithAvailable = books.map((b: any) => ({
    ...b,
    available: Math.max(0, b.quantity - (b._count?.issues ?? 0)),
  }));

  // Only registered library members can be issued a book (mirrors Smart
  // School: issuing is done FROM a member's page, enforced server-side too).
  const memberStudentIds = new Set(members.filter((m: any) => m.memberType === "student").map((m: any) => m.memberId));
  const memberStaffIds   = new Set(members.filter((m: any) => m.memberType === "teacher").map((m: any) => m.memberId));
  const memberStudents = students.filter((s: any) => memberStudentIds.has(s.id));
  const memberStaff    = staff.filter((s: any) => memberStaffIds.has(s.id));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Issue Book" />
      <IssueBookForm books={booksWithAvailable} students={memberStudents} staff={memberStaff} />
    </div>
  );
}
