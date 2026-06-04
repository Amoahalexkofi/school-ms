import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { LibraryClient } from "./LibraryClient";

async function getData() {
  const [books, issues, students, staff] = await Promise.all([
    (prisma as any).book.findMany({ orderBy: { title: "asc" } }),
    (prisma as any).bookIssue.findMany({
      where: { status: { in: ["ISSUED", "OVERDUE"] } },
      include: { book: true, student: true, staff: true },
      orderBy: { issuedAt: "desc" },
    }),
    (prisma as any).student.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true, admissionNumber: true } }),
    (prisma as any).staff.findMany({ orderBy: { firstName: "asc" }, select: { id: true, firstName: true, lastName: true } }),
  ]);
  return { books, issues, students, staff };
}

export default async function LibraryPage() {
  const data = await getData();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Library" />
      <LibraryClient {...data} />
    </div>
  );
}
