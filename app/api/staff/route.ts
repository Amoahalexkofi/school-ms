import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function generateEmployeeId(count: number) {
  return `EMP${String(count + 1).padStart(4, "0")}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const departmentId  = searchParams.get("departmentId");
  const designationId = searchParams.get("designationId");
  const search        = searchParams.get("search");
  const isActive      = searchParams.get("isActive");

  const where: any = {};
  if (isActive !== null) where.isActive = isActive === "true";
  if (departmentId)  where.departmentId  = departmentId;
  if (designationId) where.designationId = designationId;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName:  { contains: search, mode: "insensitive" } },
      { employeeId: { contains: search, mode: "insensitive" } },
      { contactNo:  { contains: search, mode: "insensitive" } },
    ];
  }

  const staff = await (prisma as any).staff.findMany({
    where,
    include: {
      user:        { select: { email: true, role: true } },
      department:  { select: { name: true } },
      designation: { select: { name: true } },
      teacherSubjects: { include: { subject: { select: { name: true } } } },
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["firstName", "lastName", "gender"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `${f} is required` }, { status: 422 });
    }

    const count = await (prisma as any).staff.count();
    const employeeId = body.employeeId || generateEmployeeId(count);

    const existingEmp = await (prisma as any).staff.findUnique({ where: { employeeId } });
    if (existingEmp) return NextResponse.json({ error: "Employee ID already exists" }, { status: 409 });

    const email    = body.email || `${employeeId.toLowerCase()}@school.local`;
    const username = `staff_${employeeId.toLowerCase()}`;

    const existingUser = await (prisma as any).user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const password = await bcrypt.hash("Staff@1234", 12);
    const role     = body.role || "TEACHER";

    const staff = await (prisma as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { email, username, password, role } });

      return tx.staff.create({
        data: {
          userId:           user.id,
          employeeId,
          departmentId:     body.departmentId     || null,
          designationId:    body.designationId     || null,
          firstName:        body.firstName?.trim(),
          lastName:         body.lastName?.trim(),
          fatherName:       body.fatherName        || null,
          motherName:       body.motherName        || null,
          dob:              body.dob               ? new Date(body.dob)              : null,
          gender:           body.gender,
          maritalStatus:    body.maritalStatus     || null,
          religion:         body.religion          || null,
          qualification:    body.qualification     || null,
          workExperience:   body.workExperience     || null,
          dateOfJoining:    body.dateOfJoining     ? new Date(body.dateOfJoining)    : null,
          contractType:     body.contractType      || null,
          contactNo:        body.contactNo         || null,
          emergencyContact: body.emergencyContact  || null,
          localAddress:     body.localAddress      || null,
          permanentAddress: body.permanentAddress  || null,
          city:             body.city              || null,
          state:            body.state             || null,
          country:          body.country           || null,
          basicSalary:      body.basicSalary       ? parseFloat(body.basicSalary)    : null,
          bankAccountNo:    body.bankAccountNo     || null,
          bankName:         body.bankName          || null,
          ifscCode:         body.ifscCode          || null,
          bankBranch:       body.bankBranch        || null,
          epfNo:            body.epfNo             || null,
          payscale:         body.payscale          || null,
          shift:            body.shift             || null,
          location:         body.location          || null,
          facebook:         body.facebook          || null,
          twitter:          body.twitter           || null,
          linkedin:         body.linkedin          || null,
          instagram:        body.instagram         || null,
          note:             body.note              || null,
        },
      });
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create staff" }, { status: 500 });
  }
}
