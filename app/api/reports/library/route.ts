import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "ISSUED" | "RETURNED" | "LOST" | ""
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: any = {};
  if (status) where.status = status;
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    where.issuedAt = { gte: fromDate, lte: toDate };
  }

  const issues = await ((await getDb()) as any).bookIssue.findMany({
    where,
    include: {
      book: { select: { title: true, bookNo: true, author: true } },
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      staff: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(issues);
}
