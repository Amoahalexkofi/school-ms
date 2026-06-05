import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { IssueBookForm } from "./IssueBookForm";

export default async function IssueBookPage() {
  const [books, students, staff] = await Promise.all([
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
  ]);

  // Compute available count for each book
  const booksWithAvailable = books.map((b: any) => ({
    ...b,
    available: Math.max(0, b.quantity - (b._count?.issues ?? 0)),
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Issue Book" />
      <IssueBookForm books={booksWithAvailable} students={students} staff={staff} />
    </div>
  );
}
