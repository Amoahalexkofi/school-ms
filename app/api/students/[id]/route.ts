import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deleteStudentCascade } from "@/lib/services/students";

const ALLOWED_FIELDS = [
  "firstName","middleName","lastName","admissionDate","dateOfBirth","gender",
  "bloodGroup","religion","caste","category","nationality","rte",
  "mobileNo","image",
  "currentAddress","permanentAddress","city","state","country","pincode",
  "guardianIs","fatherName","fatherPhone","fatherEmail","fatherOccupation","fatherPic",
  "motherName","motherPhone","motherEmail","motherOccupation","motherPic",
  "guardianName","guardianRelation","guardianPhone","guardianEmail","guardianOccupation",
  "guardianAddress","guardianPic",
  "previousSchool","previousClass","previousPercent","previousTcNo","samagraId",
  "schoolHouseId","height","weight","measurementDate",
  "bankAccountNo","bankName","bankBranch","ifscCode","aadharNo",
  "appKey","parentAppKey","note","about",
  "isActive","disableReason","disableNote","disabledAt",
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await ((await getDb()) as any).student.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, username: true, role: true, isActive: true } },
      schoolHouse: true,
      sessions: {
        include: {
          session: true,
          classSection: { include: { class: true, section: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      hostelAllocation: { include: { room: { include: { hostel: true, roomType: true } } } },
      transportRoute: { include: { route: true, pickupPoint: true } },
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });
  return NextResponse.json(student);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Whitelist only allowed student fields
    const data: any = {};
    for (const f of ALLOWED_FIELDS) {
      if (f in body) data[f] = body[f];
    }

    // Parse date fields
    if (data.dateOfBirth)     data.dateOfBirth     = new Date(data.dateOfBirth);
    if (data.admissionDate)   data.admissionDate   = new Date(data.admissionDate);
    if (data.measurementDate) data.measurementDate = new Date(data.measurementDate);
    if (data.disabledAt)      data.disabledAt      = new Date(data.disabledAt);
    if (typeof data.rte !== "undefined") data.rte = data.rte === true || data.rte === "true";

    const db = await getDb();
    const student = await (db as any).student.update({ where: { id }, data });

    // Disabling/enabling a student must also gate their login account —
    // Smart School blocks sign-in on students.is_active, we mirror via User.isActive.
    if (typeof data.isActive === "boolean") {
      await (db as any).user.update({
        where: { id: student.userId },
        data: { isActive: data.isActive },
      }).catch(() => {});
    }

    return NextResponse.json(student);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const sessions = await (db as any).studentSession.count({ where: { studentId: id, isActive: true } });
  if (sessions > 0)
    return NextResponse.json({ error: "Cannot delete student with active enrollments" }, { status: 409 });
  await deleteStudentCascade(db, id);
  return NextResponse.json({ ok: true });
}
