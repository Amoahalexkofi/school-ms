import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const masters = await ((await getDb()) as any).studentFeesMaster.findMany({
    where: { studentId, isActive: true },
    include: {
      feeSessionGroup: {
        include: {
          feeGroup:  { select: { name: true } },
          session:   { select: { session: true } },
          items: {
            include: { feeType: { select: { name: true, code: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      deposits: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute paid per master
  const result = masters.map((m: any) => {
    const totalPaid = m.deposits.reduce((sum: number, d: any) => {
      const detail = d.amountDetail as Record<string, any>;
      return sum + Object.values(detail).reduce((s: number, v: any) => s + Number(v?.amount ?? 0), 0);
    }, 0);
    const balance = Number(m.amount) - totalPaid;
    return { ...m, totalPaid, balance };
  });

  return NextResponse.json(result);
}
