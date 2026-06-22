import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

// Daily Collection Report (mirrors Smart School Financereports::reportdailycollection).
// Payment dates live inside FeeDeposit.amountDetail JSON, so we fetch deposits and
// expand each payment entry, keeping those whose date falls in [from, to].
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to   = searchParams.get("to");
    if (!from || !to) return NextResponse.json({ error: "from and to dates are required" }, { status: 422 });

    const db = await getDb();
    const branchId = await getActiveBranchId();

    const deposits = await (db as any).feeDeposit.findMany({
      where: {
        isActive: true,
        ...(branchId ? { studentFeesMaster: { student: { branchId } } } : {}),
      },
      select: {
        amountDetail: true,
        studentFeesMaster: {
          select: {
            feeSessionGroup: { select: { feeGroup: { select: { name: true } } } },
            studentSession: {
              select: {
                student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
                classSection: { select: { class: { select: { name: true } }, section: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    const rows: any[] = [];
    for (const d of deposits) {
      const ss = d.studentFeesMaster?.studentSession;
      const student = ss?.student;
      if (!student) continue;
      const cs = ss?.classSection;
      const groupName = d.studentFeesMaster?.feeSessionGroup?.feeGroup?.name ?? "";
      const detail = (d.amountDetail ?? {}) as Record<string, any>;
      for (const entry of Object.values(detail)) {
        const date = entry?.date;
        if (!date || date < from || date > to) continue;
        rows.push({
          date,
          studentId:   student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          admissionNo: student.admissionNo,
          className:   cs ? `${cs.class?.name ?? ""}${cs.section?.name ? " - " + cs.section.name : ""}` : "",
          feeGroup:    groupName,
          amount:      Number(entry?.amount ?? 0),
          discount:    Number(entry?.discount ?? 0),
          fine:        Number(entry?.fine ?? 0),
          paymentMode: entry?.payment_mode ?? "",
          receivedBy:  entry?.received_by ?? "",
        });
      }
    }

    rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
