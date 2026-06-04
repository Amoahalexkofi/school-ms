import { NextRequest, NextResponse } from "next/server";
import { generatePayroll, markPayrollPaid } from "@/lib/services/finance";

export async function POST(req: NextRequest) {
  try {
    const { month, year, action, payrollId } = await req.json();
    if (action === "markPaid") {
      const p = await markPayrollPaid(payrollId);
      return NextResponse.json(p);
    }
    const payroll = await generatePayroll(Number(month), Number(year));
    return NextResponse.json(payroll, { status: 201 });
  } catch (err: any) {
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
