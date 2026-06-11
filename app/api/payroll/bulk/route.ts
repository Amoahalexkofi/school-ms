import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Payroll_model searchEmployee + createPayslip loop —
// generate payslips for all active staff who don't have one for the given month/year.
export async function POST(req: NextRequest) {
  try {
    const { month, year, departmentId } = await req.json();
    if (!month || !year) return NextResponse.json({ error: "month and year required" }, { status: 422 });

    const db = await getDb();

    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;

    const [allStaff, existingPayslips] = await Promise.all([
      (db as any).staff.findMany({ where, select: { id: true, basicSalary: true } }),
      (db as any).staffPayslip.findMany({ where: { month, year }, select: { staffId: true } }),
    ]);

    const alreadyHas = new Set(existingPayslips.map((p: any) => p.staffId));
    const toGenerate = (allStaff as any[]).filter((s: any) => !alreadyHas.has(s.id) && Number(s.basicSalary ?? 0) > 0);

    if (toGenerate.length === 0) {
      return NextResponse.json({ created: 0, skipped: allStaff.length });
    }

    await (db as any).staffPayslip.createMany({
      data: toGenerate.map((s: any) => {
        const basic = Number(s.basicSalary ?? 0);
        return {
          staffId:        s.id,
          month,
          year,
          basicSalary:    basic,
          totalAllowance: 0,
          totalDeduction: 0,
          leaveDeduction: 0,
          tax:            0,
          netSalary:      basic,
          status:         "DRAFT",
        };
      }),
      skipDuplicates: true,
    });

    return NextResponse.json({ created: toGenerate.length, skipped: allStaff.length - toGenerate.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
