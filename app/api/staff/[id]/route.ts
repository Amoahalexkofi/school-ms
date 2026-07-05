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

    // Date fields: blank clears the value; anything else must parse.
    for (const f of ["dob", "dateOfJoining", "dateOfLeaving", "disabledAt"]) {
      if (f in staffData) {
        if (!staffData[f]) { staffData[f] = null; continue; }
        const d = new Date(staffData[f]);
        if (isNaN(d.getTime())) return NextResponse.json({ error: `Invalid date for ${f}` }, { status: 422 });
        staffData[f] = d;
      }
    }
    // Optional relations and enums: a blank select means "none" — Prisma
    // rejects "" for both FK ids and enum values (ContractType, MaritalStatus).
    for (const f of ["departmentId", "designationId", "contractType", "maritalStatus"]) {
      if (f in staffData && !staffData[f]) staffData[f] = null;
    }
    if ("basicSalary" in staffData) {
      staffData.basicSalary =
        staffData.basicSalary === "" || staffData.basicSalary === null
          ? null
          : parseFloat(staffData.basicSalary);
      if (staffData.basicSalary !== null && isNaN(staffData.basicSalary))
        return NextResponse.json({ error: "Invalid basic salary" }, { status: 422 });
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
    // Never leak raw Prisma dumps into the dialog.
    console.error("[staff PATCH]", err);
    return NextResponse.json({ error: "Failed to update staff — please check the field values" }, { status: 500 });
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
