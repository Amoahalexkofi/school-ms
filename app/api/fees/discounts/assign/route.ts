import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School: Feediscount_model.searchAssignFeeByClassSection + allotdiscount + deletedisstd

// GET — list students in a class/session + whether each has the discount assigned
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const discountId     = searchParams.get("discountId");

  if (!sessionId || !classSectionId || !discountId)
    return NextResponse.json({ error: "sessionId, classSectionId and discountId are required" }, { status: 422 });

  const db = await getDb();

  const studentSessions = await (db as any).studentSession.findMany({
    where: { sessionId, classSectionId, isActive: true, student: { isActive: true } },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
    },
    orderBy: { student: { firstName: "asc" } },
  });

  const ssIds = studentSessions.map((ss: any) => ss.id);

  const assigned = await (db as any).studentFeeDiscount.findMany({
    where: { studentSessionId: { in: ssIds }, feeDiscountId: discountId, isActive: true },
    select: { id: true, studentSessionId: true, status: true },
  });

  const assignedMap = new Map(assigned.map((a: any) => [a.studentSessionId, a]));

  return NextResponse.json(
    studentSessions.map((ss: any) => ({
      studentSessionId: ss.id,
      rollNo:           ss.rollNo ?? null,
      student:          ss.student,
      assigned:         assignedMap.get(ss.id) ?? null,
    }))
  );
}

// POST — allot a discount to a list of students (upsert — mirrors allotdiscount)
export async function POST(req: NextRequest) {
  try {
    const { discountId, studentSessionIds } = await req.json();
    if (!discountId || !Array.isArray(studentSessionIds) || studentSessionIds.length === 0)
      return NextResponse.json({ error: "discountId and studentSessionIds[] required" }, { status: 422 });

    const db = await getDb();
    let created = 0;

    for (const studentSessionId of studentSessionIds) {
      const existing = await (db as any).studentFeeDiscount.findFirst({
        where: { studentSessionId, feeDiscountId: discountId },
      });
      if (!existing) {
        await (db as any).studentFeeDiscount.create({
          data: { studentSessionId, feeDiscountId: discountId, status: "assigned", isActive: true },
        });
        created++;
      } else if (!existing.isActive) {
        await (db as any).studentFeeDiscount.update({
          where: { id: existing.id },
          data: { isActive: true, status: "assigned" },
        });
        created++;
      }
    }

    return NextResponse.json({ created });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — remove discount from a list of students (mirrors deletedisstd)
export async function DELETE(req: NextRequest) {
  try {
    const { discountId, studentSessionIds } = await req.json();
    if (!discountId || !Array.isArray(studentSessionIds) || studentSessionIds.length === 0)
      return NextResponse.json({ error: "discountId and studentSessionIds[] required" }, { status: 422 });

    const db = await getDb();
    const result = await (db as any).studentFeeDiscount.deleteMany({
      where: { feeDiscountId: discountId, studentSessionId: { in: studentSessionIds } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
