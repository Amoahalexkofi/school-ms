import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  const branchId = await getActiveBranchId();
  const where: any = { isActive: true };
  if (sessionId) {
    where.studentSession = { sessionId };
  }
  if (branchId) {
    where.student = { branchId };
  }

  const masters = await ((await getDb()) as any).studentFeesMaster.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          admissionNo: true,
          isActive: true,
          branch: { select: { name: true } },
        },
      },
      studentSession: {
        include: {
          session: { select: { name: true } },
          classSection: {
            include: {
              class: { select: { name: true } },
              section: { select: { name: true } },
            },
          },
        },
      },
      feeSessionGroup: {
        include: {
          feeGroup: { select: { name: true } },
          items: { select: { amount: true } },
        },
      },
      deposits: {
        where: { isActive: true },
        select: { amountDetail: true },
      },
    },
  });

  const rows = masters
    .map((m: any) => {
      const totalFee = Number(m.amount);
      const paid = m.deposits.reduce((s: number, d: any) => {
        const detail = d.amountDetail as Record<string, any>;
        return s + Object.values(detail).reduce((ds: number, p: any) => ds + Number(p.amount ?? 0), 0);
      }, 0);
      const due = totalFee - paid;
      return {
        student: m.student,
        branch: m.student?.branch?.name ?? "—",
        session: m.studentSession.session.name,
        class: m.studentSession.classSection?.class?.name ?? "",
        section: m.studentSession.classSection?.section?.name ?? "",
        feeGroup: m.feeSessionGroup?.feeGroup?.name ?? "",
        totalFee,
        paid,
        due,
      };
    })
    .filter((r: any) => r.due > 0);

  rows.sort((a: any, b: any) => b.due - a.due);
  return NextResponse.json(rows);
}
