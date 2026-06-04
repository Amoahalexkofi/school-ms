import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const fsgId          = searchParams.get("fsgId");
  const classSectionId = searchParams.get("classSectionId");

  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

  const where: any = { isActive: true, studentSession: { sessionId } };
  if (fsgId) where.feeSessionGroupId = fsgId;
  if (classSectionId) where.studentSession = { ...where.studentSession, classSectionId };

  const masters = await (prisma as any).studentFeesMaster.findMany({
    where,
    include: {
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      feeSessionGroup: {
        include: {
          feeGroup: { select: { name: true } },
          session:  { select: { session: true } },
        },
      },
      deposits: { select: { amountDetail: true } },
    },
    orderBy: { student: { firstName: "asc" } },
  });

  const rows = masters.map((m: any) => {
    const paid = m.deposits.reduce((s: number, d: any) => {
      return s + Object.values(d.amountDetail as Record<string, any>)
        .reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0), 0);
    }, 0);
    const amount  = Number(m.amount);
    const balance = amount - paid;
    const status  = balance <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
    return {
      student:      m.student,
      feeGroupName: m.feeSessionGroup.feeGroup.name,
      sessionName:  m.feeSessionGroup.session.session,
      amount, paid, balance, status,
    };
  });

  return NextResponse.json(rows);
}
