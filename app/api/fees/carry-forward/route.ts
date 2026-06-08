import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

function computePaid(deposits: any[]): number {
  return deposits.reduce((s, d) => {
    return s + Object.values(d.amountDetail as Record<string, any>)
      .reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0), 0);
  }, 0);
}

// GET — preview: show students + balances without committing
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const fromSessionId      = searchParams.get("fromSessionId");
  const fromClassSectionId = searchParams.get("fromClassSectionId");

  if (!fromSessionId || !fromClassSectionId)
    return NextResponse.json({ error: "fromSessionId and fromClassSectionId required" }, { status: 422 });

  const db = await getDb();
  const studentSessions = await (db as any).studentSession.findMany({
    where: { sessionId: fromSessionId, classSectionId: fromClassSectionId },
    include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } } },
  });

  const rows = await Promise.all(
    studentSessions.map(async (ss: any) => {
      const masters = await (db as any).studentFeesMaster.findMany({
        where: { studentId: ss.student.id, studentSessionId: ss.id },
        include: { deposits: true },
      });
      const totalFees = masters.reduce((s: number, m: any) => s + Number(m.amount), 0);
      const totalPaid = masters.reduce((s: number, m: any) => s + computePaid(m.deposits), 0);
      const balance   = Math.max(0, totalFees - totalPaid);
      return { student: ss.student, studentSessionId: ss.id, balance };
    })
  );

  return NextResponse.json(rows.filter(r => r.balance > 0));
}

// POST — commit the carry-forward
export async function POST(req: NextRequest) {
  try {
    const { fromSessionId, fromClassSectionId, toSessionId, dueDate } = await req.json();
    if (!fromSessionId || !fromClassSectionId || !toSessionId)
      return NextResponse.json({ error: "fromSessionId, fromClassSectionId and toSessionId required" }, { status: 422 });

    const db = await getDb();

    // Load students with balances
    const studentSessions = await (db as any).studentSession.findMany({
      where: { sessionId: fromSessionId, classSectionId: fromClassSectionId },
      include: { student: { select: { id: true } } },
    });

    const rows: { studentId: string; balance: number; fromSsId: string }[] = [];
    for (const ss of studentSessions) {
      const masters = await (db as any).studentFeesMaster.findMany({
        where: { studentId: ss.student.id, studentSessionId: ss.id },
        include: { deposits: true },
      });
      const totalFees = masters.reduce((s: number, m: any) => s + Number(m.amount), 0);
      const totalPaid = masters.reduce((s: number, m: any) => s + computePaid(m.deposits), 0);
      const balance   = totalFees - totalPaid;
      if (balance > 0) rows.push({ studentId: ss.student.id, balance, fromSsId: ss.id });
    }

    if (rows.length === 0) return NextResponse.json({ carried: 0, skipped: 0, message: "No outstanding balances found" });

    // Get or create "Previous Balance" system FeeGroup
    let balanceGroup = await (db as any).feeGroup.findFirst({ where: { name: "Previous Balance", isSystem: true } });
    if (!balanceGroup) {
      balanceGroup = await (db as any).feeGroup.create({
        data: { name: "Previous Balance", isSystem: true, nature: "SYSTEM" },
      });
    }

    // Get or create FeeSessionGroup for this group + target session
    let sessionGroup = await (db as any).feeSessionGroup.findFirst({
      where: { feeGroupId: balanceGroup.id, sessionId: toSessionId },
    });
    if (!sessionGroup) {
      sessionGroup = await (db as any).feeSessionGroup.create({
        data: { feeGroupId: balanceGroup.id, sessionId: toSessionId },
      });
    }

    let carried = 0;
    let skipped = 0;

    for (const { studentId, balance } of rows) {
      // Find student's session record in the target session
      const toSS = await (db as any).studentSession.findFirst({
        where: { studentId, sessionId: toSessionId },
      });
      if (!toSS) { skipped++; continue; }

      // Skip if carry-forward already exists
      const existing = await (db as any).studentFeesMaster.findFirst({
        where: { studentSessionId: toSS.id, feeSessionGroupId: sessionGroup.id },
      });
      if (existing) { skipped++; continue; }

      await (db as any).studentFeesMaster.create({
        data: {
          studentId,
          studentSessionId: toSS.id,
          feeSessionGroupId: sessionGroup.id,
          amount: balance,
          isSystem: true,
          ...(dueDate ? { createdAt: new Date(dueDate) } : {}),
        },
      });
      carried++;
    }

    return NextResponse.json({ carried, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
