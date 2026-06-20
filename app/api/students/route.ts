import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateAdmissionNumber } from "@/lib/domain/students";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";
import { generateTempPassword } from "@/lib/auth/passwords";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const search         = searchParams.get("search");
  const isActive       = searchParams.get("isActive");
  const limitParam     = parseInt(searchParams.get("limit") ?? "");
  const take           = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : undefined;

  const where: any = {};
  if (isActive !== null) where.isActive = isActive === "true";
  const activeBranchId = await getActiveBranchId();
  if (activeBranchId) where.branchId = activeBranchId;
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
    ...(take ? { take } : {}),
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

    const db = await getDb();

    if (body.email) {
      const exists = await (db as any).user.findUnique({ where: { email: body.email } });
      if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const count  = await (db as any).student.count();
    const year   = new Date().getFullYear();
    const admissionNo = body.admissionNo?.trim() || generateAdmissionNumber({ sessionYear: year, sequenceNumber: count + 1 });
    const email    = body.email || `${admissionNo.toLowerCase().replace(/\//g, ".")}@school.local`;
    const username = `stu_${admissionNo.toLowerCase().replace(/\//g, "_")}`;
    // Unique random password per account (no shared default like "Student@1234").
    // Returned once as tempPassword so the admin can hand it over.
    const tempPassword = generateTempPassword();
    const password = await bcrypt.hash(tempPassword, 12);

    // Multi Branch: tag new student to the chosen branch (body) or active branch.
    const branchId = body.branchId || (await resolveBranchForCreate(await getActiveBranchId()));

    const student = await (db as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { email, username, password, role: "STUDENT" } });

      const s = await tx.student.create({
        data: {
          userId:             user.id,
          admissionNo,
          firstName:          body.firstName?.trim(),
          middleName:         body.middleName?.trim()       || null,
          lastName:           body.lastName?.trim(),
          admissionDate:      body.admissionDate            ? new Date(body.admissionDate)  : new Date(),
          dateOfBirth:        body.dateOfBirth              ? new Date(body.dateOfBirth)     : null,
          gender:             body.gender,
          bloodGroup:         body.bloodGroup               || null,
          religion:           body.religion                 || null,
          caste:              body.caste                    || null,
          category:           body.category                 || null,
          nationality:        body.nationality              || null,
          rte:                body.rte === true || body.rte === "true",
          mobileNo:           body.mobileNo                 || null,
          currentAddress:     body.currentAddress           || null,
          permanentAddress:   body.permanentAddress         || null,
          city:               body.city                     || null,
          state:              body.state                    || null,
          country:            body.country                  || null,
          pincode:            body.pincode                  || null,
          guardianIs:         body.guardianIs               || null,
          fatherName:         body.fatherName               || null,
          fatherPhone:        body.fatherPhone              || null,
          fatherEmail:        body.fatherEmail              || null,
          fatherOccupation:   body.fatherOccupation         || null,
          motherName:         body.motherName               || null,
          motherPhone:        body.motherPhone              || null,
          motherEmail:        body.motherEmail              || null,
          motherOccupation:   body.motherOccupation         || null,
          guardianName:       body.guardianName             || null,
          guardianRelation:   body.guardianRelation         || null,
          guardianPhone:      body.guardianPhone            || null,
          guardianEmail:      body.guardianEmail            || null,
          guardianOccupation: body.guardianOccupation       || null,
          guardianAddress:    body.guardianAddress          || null,
          previousSchool:     body.previousSchool           || null,
          previousClass:      body.previousClass            || null,
          previousPercent:    body.previousPercent          || null,
          previousTcNo:       body.previousTcNo || body.previousTc || null,
          samagraId:          body.samagraId                || null,
          schoolHouseId:      body.schoolHouseId            || null,
          height:             body.height                   || null,
          weight:             body.weight                   || null,
          bankAccountNo:      body.bankAccountNo            || null,
          bankName:           body.bankName                 || null,
          bankBranch:         body.bankBranch               || null,
          ifscCode:           body.ifscCode                 || null,
          aadharNo:           body.aadharNo                 || null,
          note:               body.note                     || null,
          about:              body.about                    || null,
          branchId,
        },
      });

      // Smart School add_student_session(): upsert by (sessionId, studentId)
      if (body.sessionId && body.classSectionId) {
        const existing = await tx.studentSession.findFirst({
          where: { studentId: s.id, sessionId: body.sessionId },
        });
        if (existing) {
          await tx.studentSession.update({
            where: { id: existing.id },
            data: { classSectionId: body.classSectionId, rollNo: body.rollNo || null },
          });
        } else {
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
      }
      return s;
    });

    return NextResponse.json({ ...student, tempPassword }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}
