import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const ALLOWED_FIELDS = [
  "departmentId","designationId","firstName","lastName","fatherName","motherName",
  "dob","gender","maritalStatus","religion","qualification","workExperience",
  "dateOfJoining","dateOfLeaving","contractType","contactNo","emergencyContact",
  "localAddress","permanentAddress","city","state","country","image",
  "basicSalary","bankAccountNo","bankName","bankBranch","ifscCode","epfNo",
  "accountTitle","payscale","shift","location",
  "facebook","twitter","linkedin","instagram",
  "resume","joiningLetter","resignationLetter","otherDocumentName","otherDocumentFile",
  "note","isActive","disabledAt",
];

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

    // Whitelist only allowed staff fields
    const staffData: any = {};
    for (const f of ALLOWED_FIELDS) {
      if (f in body) staffData[f] = body[f];
    }

    // Parse date fields
    if (staffData.dob)           staffData.dob           = new Date(staffData.dob);
    if (staffData.dateOfJoining) staffData.dateOfJoining = new Date(staffData.dateOfJoining);
    if (staffData.dateOfLeaving) staffData.dateOfLeaving = new Date(staffData.dateOfLeaving);
    if (staffData.disabledAt)    staffData.disabledAt    = new Date(staffData.disabledAt);
    if (staffData.basicSalary !== undefined && staffData.basicSalary !== null && staffData.basicSalary !== "") {
      staffData.basicSalary = parseFloat(staffData.basicSalary);
    }

    const { role } = body;

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
