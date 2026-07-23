import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Payroll report (Smart School Financereports::payroll).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: any = {};
  if (month) where.month = month;
  if (year) where.year = year;

  const payslips = await ((await getDb()) as any).staffPayslip.findMany({
    where,
    include: { staff: { select: { firstName: true, lastName: true, employeeId: true, designation: { select: { name: true } } } } },
    orderBy: [{ year: "desc" }, { month: "desc" }, { staff: { firstName: "asc" } }],
  });

  const rows = payslips.map((p: any) => ({
    staff: `${p.staff.firstName} ${p.staff.lastName}`,
    employeeId: p.staff.employeeId ?? "",
    designation: p.staff.designation?.name ?? "",
    month: p.month,
    year: p.year,
    basicSalary: Number(p.basicSalary),
    allowance: Number(p.totalAllowance),
    deduction: Number(p.totalDeduction),
    tax: Number(p.tax),
    netSalary: Number(p.netSalary),
    status: p.status,
  }));

  const totalNet = rows.reduce((s: number, r: any) => s + r.netSalary, 0);
  return NextResponse.json({ rows, totalNet });
}
