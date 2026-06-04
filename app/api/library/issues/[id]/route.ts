import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH — return book
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const issue = await (prisma as any).bookIssue.findUnique({ where: { id } });
    if (!issue) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (issue.status === "RETURNED") return NextResponse.json({ error: "Already returned" }, { status: 409 });

    const today     = new Date();
    const due       = new Date(issue.dueDate);
    const overdueDays = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
    const fine      = overdueDays > 0 ? overdueDays * 0.5 : 0; // ₵0.50/day

    const [updated] = await (prisma as any).$transaction([
      (prisma as any).bookIssue.update({ where: { id }, data: { status: "RETURNED", returnedAt: today, fine } }),
      (prisma as any).book.update({ where: { id: issue.bookId }, data: { available: { increment: 1 } } }),
    ]);
    return NextResponse.json(updated);
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
