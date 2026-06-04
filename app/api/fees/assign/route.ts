import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — assign a feeSessionGroup to all students in a classSection for a session
// OR assign to a single student
export async function POST(req: NextRequest) {
  try {
    const { feeSessionGroupId, classSectionId, sessionId, studentSessionId } = await req.json();
    if (!feeSessionGroupId) return NextResponse.json({ error: "feeSessionGroupId required" }, { status: 422 });

    // Compute the total amount for this session group
    const items = await (prisma as any).feeGroupItem.findMany({ where: { feeSessionGroupId } });
    const totalAmount = items.reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    let targets: string[] = [];

    if (studentSessionId) {
      targets = [studentSessionId];
    } else if (classSectionId && sessionId) {
      const enrollments = await (prisma as any).studentSession.findMany({
        where: { classSectionId, sessionId, isActive: true },
        select: { id: true },
      });
      targets = enrollments.map((e: any) => e.id);
    } else {
      return NextResponse.json({ error: "Provide studentSessionId or classSectionId+sessionId" }, { status: 422 });
    }

    let created = 0;
    let skipped = 0;
    for (const ssId of targets) {
      const ss = await (prisma as any).studentSession.findUnique({ where: { id: ssId }, select: { studentId: true } });
      if (!ss) continue;
      try {
        await (prisma as any).studentFeesMaster.create({
          data: { studentId: ss.studentId, studentSessionId: ssId, feeSessionGroupId, amount: totalAmount },
        });
        created++;
      } catch (e: any) {
        if (e.code === "P2002") skipped++; // already assigned
        else throw e;
      }
    }

    return NextResponse.json({ ok: true, created, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
