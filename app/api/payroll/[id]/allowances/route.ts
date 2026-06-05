import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: payslipId } = await params;
  try {
    const { type, amount, calType, isDeduction } = await req.json();
    if (!type?.trim())  return NextResponse.json({ error: "Type is required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });

    const payslip = await ((await getDb()) as any).staffPayslip.findUnique({ where: { id: payslipId }, select: { staffId: true, status: true } });
    if (!payslip) return NextResponse.json({ error: "Payslip not found" }, { status: 404 });
    if (payslip.status === "PAID") return NextResponse.json({ error: "Cannot edit a paid payslip" }, { status: 409 });

    const line = await ((await getDb()) as any).payslipAllowance.create({
      data: {
        payslipId,
        staffId:     payslip.staffId,
        type:        type.trim(),
        amount:      parseFloat(amount),
        calType:     calType || "fixed",
        isDeduction: isDeduction === true || isDeduction === "true",
      },
    });

    // Trigger recompute
    await recompute(payslipId);

    return NextResponse.json(line, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function recompute(payslipId: string) {
  const ps = await ((await getDb()) as any).staffPayslip.findUnique({
    where: { id: payslipId },
    include: { allowances: true },
  });
  if (!ps) return;
  const totalAllowance = ps.allowances.filter((a: any) => !a.isDeduction).reduce((s: number, a: any) => s + Number(a.amount), 0);
  const totalDeduction = ps.allowances.filter((a: any) =>  a.isDeduction).reduce((s: number, a: any) => s + Number(a.amount), 0);
  const netSalary = Math.max(Number(ps.basicSalary) + totalAllowance - totalDeduction - Number(ps.tax), 0);
  await ((await getDb()) as any).staffPayslip.update({
    where: { id: payslipId },
    data: { totalAllowance, totalDeduction, netSalary },
  });
}
