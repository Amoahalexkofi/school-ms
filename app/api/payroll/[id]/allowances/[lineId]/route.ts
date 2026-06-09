import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

async function recompute(payslipId: string) {
  const ps = await ((await getDb()) as any).staffPayslip.findUnique({
    where: { id: payslipId },
    include: { allowances: true },
  });
  if (!ps) return;
  const totalAllowance = ps.allowances.filter((a: any) => !a.isDeduction).reduce((s: number, a: any) => s + Number(a.amount), 0);
  const totalDeduction = ps.allowances.filter((a: any) =>  a.isDeduction).reduce((s: number, a: any) => s + Number(a.amount), 0);
  const netSalary = Math.max(Number(ps.basicSalary) + totalAllowance - totalDeduction - Number(ps.tax), 0);
  await ((await getDb()) as any).staffPayslip.update({ where: { id: payslipId }, data: { totalAllowance, totalDeduction, netSalary } });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { id: payslipId, lineId } = await params;
  const { type, amount, calType, isDeduction } = await req.json();
  const data: any = {};
  if (type        !== undefined) data.type        = type        || null;
  if (amount      !== undefined) data.amount      = parseFloat(amount);
  if (calType     !== undefined) data.calType     = calType     || "fixed";
  if (isDeduction !== undefined) data.isDeduction = Boolean(isDeduction);
  await ((await getDb()) as any).payslipAllowance.update({ where: { id: lineId }, data });
  await recompute(payslipId);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; lineId: string }> }) {
  const { id: payslipId, lineId } = await params;
  await ((await getDb()) as any).payslipAllowance.delete({ where: { id: lineId } });
  await recompute(payslipId);
  return NextResponse.json({ ok: true });
}
