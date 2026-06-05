import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateAdmissionNumber } from "@/lib/domain/students";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const search         = searchParams.get("search");
  const isActive       = searchParams.get("isActive");

  const where: any = {};
  if (isActive !== null) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { firstName:   { contains: search, mode: "insensitive" } },
      { lastName:    { contains: search, mode: "insensitive" } },
      { admissionNo: { contains: search, mode: "insensitive" } },
      { mobileNo:    { contains: search, mode: "insensitive" } },
    ];
  }

  const sessionFilter: any = {};
  if (sessionId)      sessionFilter.sessionId      = sessionId;
  if (classSectionId) sessionFilter.classSectionId = classSectionId;

  const students = await ((await getDb()) as any).student.findMany({
    where: {
      ...where,
      ...(Object.keys(sessionFilter).length > 0
        ? { sessions: { some: sessionFilter } }
        : {}),
    },
    include: {
      sessions: {
        where: Object.keys(sessionFilter).length > 0 ? sessionFilter : undefined,
        include: {
          session: true,
          classSection: { include: { class: true, section: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      schoolHouse: true,
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(students);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["firstName", "lastName", "dateOfBirth", "gender"];
    for (const f of required) {
      if (!body[f]) return NextResponse.json({ error: `${f} is required` }, { status: 422 });
    }

    if (body.email) {
      const exists = await ((await getDb()) as any).user.findUnique({ where: { email: body.email } });
      if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const count  = await ((await getDb()) as any).student.count();
    const year   = new Date().getFullYear();
    const admissionNo = generateAdmissionNumber({ sessionYear: year, sequenceNumber: count + 1 });
    const email    = body.email || `${admissionNo.toLowerCase().replace(/\//g, ".")}@school.local`;
    const username = `stu_${admissionNo.toLowerCase().replace(/\//g, "_")}`;
    const password = await bcrypt.hash("Student@1234", 12);

    const student = await ((await getDb()) as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { email, username, password, role: "STUDENT" } });

      const s = await tx.student.create({
        data: {
          userId:             user.id,
          admissionNo,
          firstName:          body.firstName?.trim(),
          middleName:         body.middleName?.trim()     || null,
          lastName:           body.lastName?.trim(),
          admissionDate:      body.admissionDate          ? new Date(body.admissionDate)  : new Date(),
          dateOfBirth:        body.dateOfBirth            ? new Date(body.dateOfBirth)     : null,
          gender:             body.gender,
          bloodGroup:         body.bloodGroup             || null,
          religion:           body.religion               || null,
          caste:              body.caste                  || null,
          category:           body.category               || null,
          nationality:        body.nationality            || null,
          rte:                body.rte === true || body.rte === "true",
          mobileNo:           body.mobileNo               || null,
          currentAddress:     body.currentAddress         || null,
          permanentAddress:   body.permanentAddress       || null,
          city:               body.city                   || null,
          state:              body.state                  || null,
          country:            body.country                || null,
          pincode:            body.pincode                || null,
          guardianIs:         body.guardianIs             || null,
          fatherName:         body.fatherName             || null,
          fatherPhone:        body.fatherPhone            || null,
          fatherOccupation:   body.fatherOccupation       || null,
          motherName:         body.motherName             || null,
          motherPhone:        body.motherPhone            || null,
          motherOccupation:   body.motherOccupation       || null,
          guardianName:       body.guardianName           || null,
          guardianRelation:   body.guardianRelation       || null,
          guardianPhone:      body.guardianPhone          || null,
          guardianEmail:      body.guardianEmail          || null,
          guardianOccupation: body.guardianOccupation     || null,
          guardianAddress:    body.guardianAddress        || null,
          previousSchool:     body.previousSchool         || null,
          schoolHouseId:      body.schoolHouseId          || null,
          height:             body.height                 || null,
          weight:             body.weight                 || null,
          bankAccountNo:      body.bankAccountNo          || null,
          bankName:           body.bankName               || null,
          ifscCode:           body.ifscCode               || null,
          aadharNo:           body.aadharNo               || null,
          note:               body.note                   || null,
          about:              body.about                  || null,
        },
      });

      if (body.sessionId && body.classSectionId) {
        await tx.studentSession.create({
          data: {
            studentId:      s.id,
            sessionId:      body.sessionId,
            classSectionId: body.classSectionId,
            rollNo:         body.rollNo || null,
            defaultLogin:   true,
          },
        });
      }
      return s;
    });

    return NextResponse.json(student, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}
