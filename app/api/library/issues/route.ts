import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const issues = await (prisma as any).bookIssue.findMany({
    where,
    include: {
      book:    { select: { title: true, bookNo: true } },
      student: { select: { firstName: true, lastName: true, admissionNo: true } },
      staff:   { select: { firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { issuedAt: "desc" },
  });
  return NextResponse.json(issues);
}

export async function POST(req: NextRequest) {
  try {
    const { bookId, studentId, staffId, dueDate } = await req.json();
    if (!bookId || !dueDate) return NextResponse.json({ error: "bookId and dueDate required" }, { status: 422 });
    if (!studentId && !staffId) return NextResponse.json({ error: "Either studentId or staffId required" }, { status: 422 });

    const book = await (prisma as any).book.findUnique({ where: { id: bookId }, select: { available: true } });
    if (!book || book.available < 1) return NextResponse.json({ error: "No copies available" }, { status: 409 });

    const issue = await (prisma as any).$transaction(async (tx: any) => {
      const i = await tx.bookIssue.create({
        data: { bookId, studentId: studentId || null, staffId: staffId || null, dueDate: new Date(dueDate) },
      });
      await tx.book.update({ where: { id: bookId }, data: { available: { decrement: 1 } } });
      return i;
    });
    return NextResponse.json(issue, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
