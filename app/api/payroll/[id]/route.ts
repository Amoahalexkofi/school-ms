import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payslip = await ((await getDb()) as any).staffPayslip.findUnique({
    where: { id },
    include: {
      staff: {
        include: {
          department:  { select: { name: true } },
          designation: { select: { name: true } },
          user:        { select: { email: true } },
        },
      },
      allowances: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(payslip);
}

// PATCH — approve, mark paid, or update remark/paymentMode
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    if (body.paymentDate) body.paymentDate = new Date(body.paymentDate);

    // Recompute net from current allowances if not explicitly set
    if (body.recompute) {
      delete body.recompute;
      const current = await ((await getDb()) as any).staffPayslip.findUnique({
        where: { id },
        include: { allowances: true },
      });
      if (current) {
        const totalAllowance = current.allowances
          .filter((a: any) => !a.isDeduction)
          .reduce((s: number, a: any) => s + Number(a.amount), 0);
        const totalDeduction = current.allowances
          .filter((a: any) => a.isDeduction)
          .reduce((s: number, a: any) => s + Number(a.amount), 0);
        const netSalary = Number(current.basicSalary) + totalAllowance - totalDeduction - Number(current.tax);
        body.totalAllowance = totalAllowance;
        body.totalDeduction = totalDeduction;
        body.netSalary      = Math.max(netSalary, 0);
      }
    }

    const payslip = await ((await getDb()) as any).staffPayslip.update({ where: { id }, data: body });
    return NextResponse.json(payslip);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payslip = await ((await getDb()) as any).staffPayslip.findUnique({ where: { id }, select: { status: true } });
  if (!payslip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (payslip.status === "PAID") return NextResponse.json({ error: "Cannot delete a paid payslip" }, { status: 409 });
  await ((await getDb()) as any).staffPayslip.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
