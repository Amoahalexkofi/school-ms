import { NextRequest, NextResponse } from "next/server";
import { markPayrollPaid } from "@/lib/services/finance";

// Generation was retired here — it wrote netSalary = basicSalary only, with
// no allowances/deductions/tax, duplicating (and undercutting) the richer
// StaffPayslip flow at /payroll. This route now only marks legacy historical
// runs as paid.
export async function POST(req: NextRequest) {
  try {
    const { action, payrollId } = await req.json();
    if (action !== "markPaid") {
      return NextResponse.json(
        { error: "Payroll generation has moved to /payroll" },
        { status: 410 }
      );
    }
    const p = await markPayrollPaid(payrollId);
    return NextResponse.json(p);
  } catch (err: any) {
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
