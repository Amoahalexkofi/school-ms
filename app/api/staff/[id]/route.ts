import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await ((await getDb()) as any).staff.findUnique({
    where: { id },
    include: {
      user:        { select: { email: true, role: true, isActive: true } },
      department:  true,
      designation: true,
      teacherSubjects: { include: { subject: { select: { name: true, code: true } } } },
      classSectionsTeaching: { include: { class: true, section: true } },
      attendanceRecords: {
        orderBy: { date: "desc" },
        take: 30,
        include: { staffAttendanceType: true },
      },
      payslips: { orderBy: { createdAt: "desc" }, take: 5 },
      leaveRequests: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!staff) return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  return NextResponse.json(staff);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    if (body.dob)           body.dob           = new Date(body.dob);
    if (body.dateOfJoining) body.dateOfJoining = new Date(body.dateOfJoining);
    if (body.dateOfLeaving) body.dateOfLeaving = new Date(body.dateOfLeaving);
    if (body.disabledAt)    body.disabledAt    = new Date(body.disabledAt);
    if (body.basicSalary !== undefined && body.basicSalary !== null && body.basicSalary !== "") {
      body.basicSalary = parseFloat(body.basicSalary);
    }

    const { role, ...staffData } = body;

    const staff = await ((await getDb()) as any).$transaction(async (tx: any) => {
      if (role) {
        const s = await tx.staff.findUnique({ where: { id }, select: { userId: true } });
        if (s) await tx.user.update({ where: { id: s.userId }, data: { role } });
      }
      return tx.staff.update({ where: { id }, data: staffData });
    });

    return NextResponse.json(staff);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).staff.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
