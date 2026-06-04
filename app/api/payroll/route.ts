import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — all staff with their payslip status for a given month/year
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const month        = searchParams.get("month");
  const year         = searchParams.get("year");
  const departmentId = searchParams.get("departmentId");

  if (!month || !year) return NextResponse.json({ error: "month and year required" }, { status: 400 });

  const where: any = { isActive: true };
  if (departmentId) where.departmentId = departmentId;

  const [staff, payslips] = await Promise.all([
    (prisma as any).staff.findMany({
      where,
      include: {
        department:  { select: { name: true } },
        designation: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    (prisma as any).staffPayslip.findMany({
      where: { month, year },
      include: { allowances: true },
    }),
  ]);

  const payslipMap: Record<string, any> = {};
  for (const p of payslips) payslipMap[p.staffId] = p;

  const rows = staff.map((s: any) => ({
    staff:   s,
    payslip: payslipMap[s.id] ?? null,
  }));

  return NextResponse.json(rows);
}

// POST — generate a new payslip for one staff member
export async function POST(req: NextRequest) {
  try {
    const { staffId, month, year } = await req.json();
    if (!staffId || !month || !year) return NextResponse.json({ error: "staffId, month and year required" }, { status: 422 });

    const staff = await (prisma as any).staff.findUnique({ where: { id: staffId }, select: { basicSalary: true } });
    if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });

    const basicSalary = Number(staff.basicSalary ?? 0);

    const payslip = await (prisma as any).staffPayslip.create({
      data: {
        staffId,
        month,
        year,
        basicSalary,
        totalAllowance: 0,
        totalDeduction: 0,
        leaveDeduction: 0,
        tax:            0,
        netSalary:      basicSalary,
        status:         "DRAFT",
      },
    });

    return NextResponse.json(payslip, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Payslip already exists for this period" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
