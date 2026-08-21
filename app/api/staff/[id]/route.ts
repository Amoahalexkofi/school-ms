import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { auth } from "@/lib/auth";

// Mirrors app/api/staff/route.ts's create-time whitelist — SUPER_ADMIN can
// never be minted through a staff edit, by design.
const ALLOWED_STAFF_ROLES = ["ADMIN", "TEACHER", "ACCOUNTANT", "LIBRARIAN", "RECEPTIONIST"];

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
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    const { role, email } = body;
    if (role && !ALLOWED_STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 422 });
    }

    const db = await getDb();
    let targetUserId: string | null = null;
    let currentEmail: string | null = null;
    if (role || email) {
      const s = await (db as any).staff.findUnique({ where: { id }, select: { userId: true, user: { select: { email: true } } } });
      targetUserId = s?.userId ?? null;
      currentEmail = s?.user?.email ?? null;
      // Never let anyone change their own role — self-elevation risk (an
      // Admin editing their own record could otherwise grant themselves
      // any role this route allows).
      if (role && targetUserId && targetUserId === session.user!.id) {
        return NextResponse.json({ error: "You cannot change your own role" }, { status: 403 });
      }
    }

    // Email is also the login identifier, so it's admin-gated rather than
    // covered by the general /staff permission matrix — only enforced when
    // the value actually changes, so the field can travel in every save
    // request without tripping this check for non-admin editors who never
    // touched it.
    let emailToSet: string | undefined;
    if (typeof email === "string" && targetUserId) {
      const trimmed = email.trim().toLowerCase();
      if (trimmed && trimmed !== currentEmail?.toLowerCase()) {
        const callerRole = (session.user as any).role;
        if (callerRole !== "SUPER_ADMIN" && callerRole !== "ADMIN") {
          return NextResponse.json({ error: "Only admins can change login email" }, { status: 403 });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          return NextResponse.json({ error: "Enter a valid email address" }, { status: 422 });
        }
        emailToSet = trimmed;
      }
    }

    const staff = await (db as any).$transaction(async (tx: any) => {
      if (targetUserId && (role || emailToSet)) {
        await tx.user.update({
          where: { id: targetUserId },
          data: { ...(role && { role }), ...(emailToSet && { email: emailToSet }) },
        });
      }
      return tx.staff.update({ where: { id }, data: staffData });
    });

    await audit("update", "staff", id, (role || emailToSet) ? { roleChangedTo: role, emailChangedTo: emailToSet } : undefined);

    return NextResponse.json(staff);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "That email is already in use" }, { status: 422 });
    }
    // Never leak raw Prisma dumps into the dialog.
    console.error("[staff PATCH]", err);
    return NextResponse.json({ error: "Failed to update staff — please check the field values" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).staff.delete({ where: { id } });
    await audit("delete", "staff", id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
