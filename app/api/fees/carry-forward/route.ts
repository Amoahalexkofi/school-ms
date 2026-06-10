import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School: deposit + discount both reduce the outstanding balance
function computePaid(deposits: any[]): number {
  return deposits.reduce((s, d) => {
    return s + Object.values(d.amountDetail as Record<string, any>)
      .reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0) + Number(v?.discount ?? 0), 0);
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

    // Get or create the system FeeType for "Previous Balance"
    let balanceFeeType = await (db as any).feeType.findFirst({ where: { code: "PREV_BAL", isSystem: true } });
    if (!balanceFeeType) {
      balanceFeeType = await (db as any).feeType.create({
        data: { name: "Previous Balance", code: "PREV_BAL", isSystem: true },
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

    // Ensure a FeeGroupItem exists for the balance type in this session group
    // (Smart School uses one item row per fee type; the per-student amount is on StudentFeesMaster)
    // Get or create FeeGroupItem; update dueDate if already exists (mirrors Smart School update_batch)
    let balanceItem = await (db as any).feeGroupItem.findFirst({
      where: { feeSessionGroupId: sessionGroup.id, feeTypeId: balanceFeeType.id },
    });
    if (!balanceItem) {
      balanceItem = await (db as any).feeGroupItem.create({
        data: {
          feeSessionGroupId: sessionGroup.id,
          feeTypeId: balanceFeeType.id,
          amount: 0,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        },
      });
    } else if (dueDate) {
      await (db as any).feeGroupItem.update({
        where: { id: balanceItem.id },
        data: { dueDate: new Date(dueDate) },
      });
    }

    for (const { studentId, balance } of rows) {
      const toSS = await (db as any).studentSession.findFirst({
        where: { studentId, sessionId: toSessionId },
      });
      if (!toSS) { skipped++; continue; }

      // Upsert — update amount if carry-forward already exists (mirrors Smart School update_batch)
      const existing = await (db as any).studentFeesMaster.findFirst({
        where: { studentSessionId: toSS.id, feeSessionGroupId: sessionGroup.id },
      });
      if (existing) {
        await (db as any).studentFeesMaster.update({
          where: { id: existing.id },
          data: { amount: balance },
        });
        carried++;
      } else {
        await (db as any).studentFeesMaster.create({
          data: {
            studentId,
            studentSessionId: toSS.id,
            feeSessionGroupId: sessionGroup.id,
            amount: balance,
            isSystem: true,
          },
        });
        carried++;
      }
    }

    return NextResponse.json({ carried, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
