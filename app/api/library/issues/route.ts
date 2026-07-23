import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const issues = await ((await getDb()) as any).bookIssue.findMany({
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

    const db = await getDb();

    // Mirrors Smart School: issuing is done FROM a library member's page
    // (admin/Member::issue), so a book can only ever be issued to someone who
    // is already a registered, active member.
    const member = await (db as any).libraryMember.findUnique({
      where: {
        memberType_memberId: {
          memberType: studentId ? "student" : "teacher",
          memberId: studentId || staffId,
        },
      },
    });
    if (!member || !member.isActive) {
      return NextResponse.json({ error: "Not a registered library member — add them as a member first" }, { status: 422 });
    }

    const book = await (db as any).book.findUnique({ where: { id: bookId }, select: { available: true } });
    if (!book || book.available < 1) return NextResponse.json({ error: "No copies available" }, { status: 409 });

    const issue = await ((await getDb()) as any).$transaction(async (tx: any) => {
      const i = await tx.bookIssue.create({
        data: { bookId, studentId: studentId || null, staffId: staffId || null, dueDate: new Date(dueDate) },
      });
      await tx.book.update({ where: { id: bookId }, data: { available: { decrement: 1 } } });
      return i;
    });
    return NextResponse.json(issue, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
