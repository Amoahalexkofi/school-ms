import { getDb } from "@/lib/db";

export async function listBooks(search?: string) {
  const where = search
    ? { OR: [{ title: { contains: search, mode: "insensitive" } }, { author: { contains: search, mode: "insensitive" } }] }
    : {};
  const prisma = await getDb();
  return (prisma as any).book.findMany({ where, orderBy: { title: "asc" } });
}

export async function addBook(input: { title: string; author: string; isbn?: string; category?: string; quantity?: number }) {
  if (!input.title.trim()) throw Object.assign(new Error("Title is required"), { code: "VALIDATION" });
  if (!input.author.trim()) throw Object.assign(new Error("Author is required"), { code: "VALIDATION" });
  const qty = input.quantity ?? 1;
  const prisma = await getDb();
  return (prisma as any).book.create({
    data: { title: input.title.trim(), author: input.author.trim(), isbn: input.isbn, category: input.category, quantity: qty, available: qty },
  });
}

export async function issueBook(input: { bookId: string; dueDate: Date; studentId?: string; staffId?: string }) {
  if (!input.studentId && !input.staffId) throw Object.assign(new Error("Must specify student or staff"), { code: "VALIDATION" });
  const prisma = await getDb();
  const book = await (prisma as any).book.findUnique({ where: { id: input.bookId } });
  if (!book) throw Object.assign(new Error("Book not found"), { code: "NOT_FOUND" });
  if (book.available < 1) throw Object.assign(new Error("No copies available"), { code: "CONFLICT" });

  return (prisma as any).$transaction([
    (prisma as any).bookIssue.create({
      data: { bookId: input.bookId, dueDate: input.dueDate, studentId: input.studentId, staffId: input.staffId, status: "ISSUED" },
    }),
    (prisma as any).book.update({ where: { id: input.bookId }, data: { available: { decrement: 1 } } }),
  ]);
}

export async function returnBook(issueId: string) {
  const prisma = await getDb();
  const issue = await (prisma as any).bookIssue.findUnique({ where: { id: issueId } });
  if (!issue) throw Object.assign(new Error("Issue record not found"), { code: "NOT_FOUND" });
  if (issue.status === "RETURNED") throw Object.assign(new Error("Already returned"), { code: "CONFLICT" });

  const now = new Date();
  const overdueDays = Math.max(0, Math.floor((now.getTime() - new Date(issue.dueDate).getTime()) / 86400000));
  const fine = overdueDays * 0.5;

  return (prisma as any).$transaction([
    (prisma as any).bookIssue.update({
      where: { id: issueId },
      data: { returnedAt: now, status: "RETURNED", fine: fine > 0 ? fine : null },
    }),
    (prisma as any).book.update({ where: { id: issue.bookId }, data: { available: { increment: 1 } } }),
  ]);
}

export async function listIssues(studentId?: string) {
  const where = studentId ? { studentId } : {};
  const prisma = await getDb();
  return (prisma as any).bookIssue.findMany({
    where,
    include: { book: true, student: true, staff: true },
    orderBy: { issuedAt: "desc" },
  });
}
