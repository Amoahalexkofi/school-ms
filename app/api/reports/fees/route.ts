import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sessionId = searchParams.get("sessionId");

  if (!from || !to) {
    return NextResponse.json({ error: "from, to required" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const branchId = await getActiveBranchId();
  const where: any = {
    createdAt: { gte: fromDate, lte: toDate },
    isActive: true,
    ...(branchId ? { studentFeesMaster: { student: { branchId } } } : {}),
  };

  const deposits = await ((await getDb()) as any).feeDeposit.findMany({
    where,
    include: {
      studentFeesMaster: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNo: true,
              branch: { select: { name: true } },
            },
          },
          studentSession: {
            include: {
              session: { select: { id: true, name: true } },
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
            },
          },
        },
      },
      feeGroupItem: {
        include: {
          feeType: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Filter by session if provided
  const filtered = sessionId
    ? deposits.filter(
        (d: any) => d.studentFeesMaster.studentSession.session.id === sessionId
      )
    : deposits;

  // Flatten: one row per deposit with payment detail parsed
  const rows = filtered.map((d: any) => {
    const detail = d.amountDetail as Record<string, any>;
    const payments = Object.values(detail);
    const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0);
    const paymentMode = payments[0]?.payment_mode ?? "";
    const payDate = payments[0]?.date ?? d.createdAt;

    return {
      id: d.id,
      student: d.studentFeesMaster.student,
      branch: d.studentFeesMaster.student?.branch?.name ?? "—",
      session: d.studentFeesMaster.studentSession.session.name,
      class: d.studentFeesMaster.studentSession.classSection?.class?.name ?? "",
      section: d.studentFeesMaster.studentSession.classSection?.section?.name ?? "",
      feeGroup: d.studentFeesMaster.feeSessionGroup?.feeGroup?.name ?? "",
      feeType: d.feeGroupItem?.feeType?.name ?? "General",
      amount: totalPaid,
      paymentMode,
      payDate,
      createdAt: d.createdAt,
    };
  });

  const total = rows.reduce((s: number, r: any) => s + r.amount, 0);
  return NextResponse.json({ rows, total });
}
