import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { generateAdmissionNumber } from "@/lib/domain/students";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";
import { generateTempPassword } from "@/lib/auth/passwords";
import { getApplication, markApplicationEnrolled } from "@/lib/services/admissions";
import { notifyParentCredentials } from "@/lib/services/parent-onboarding";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const classId        = searchParams.get("classId");
  const sectionId      = searchParams.get("sectionId");
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
  // Fee collection "by class": filter via the classSection relation so a whole
  // class (optionally a specific section) roster can be loaded — mirrors Smart
  // School's class_search.
  if (classId) sessionFilter.classSection = { classId, ...(sectionId ? { sectionId } : {}) };

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

    // Enrolling from an online application: block double-enrollment.
    if (body.applicationId) {
      const app = await getApplication(body.applicationId);
      if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
      if (app.enrolledStudentId) return NextResponse.json({ error: "This application has already been enrolled" }, { status: 409 });
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

    const created = await (db as any).$transaction(async (tx: any) => {
      const user = await tx.user.create({ data: { email, username, password, role: "STUDENT", mustChangePassword: true } });

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
          applicationId:      body.applicationId            || null,
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
      // Auto-create / link the parent account (optional — only if a parent email is given).
      let parentInfo: any = null;
      const parentEmail = body.parentEmail?.trim()?.toLowerCase();
      if (parentEmail) {
        const existingParent = await tx.user.findUnique({ where: { email: parentEmail } });
        if (existingParent && existingParent.role !== "PARENT") {
          parentInfo = { conflict: true, email: parentEmail };
        } else if (existingParent) {
          // Sibling: add this student to the existing parent (keep their password).
          const childs = (existingParent.childs ?? "").split(",").map((x: string) => x.trim()).filter(Boolean);
          if (!childs.includes(s.id)) childs.push(s.id);
          await tx.user.update({
            where: { id: existingParent.id },
            data: { childs: childs.join(","), phone: existingParent.phone ?? (body.parentPhone || null) },
          });
          parentInfo = { email: parentEmail, username: existingParent.username, tempPassword: null, existing: true };
        } else {
          const pTemp = generateTempPassword();
          const pHash = await bcrypt.hash(pTemp, 12);
          const pUsername = `par_${parentEmail.split("@")[0]}_${Math.random().toString(36).slice(2, 6)}`;
          const np = await tx.user.create({
            data: { email: parentEmail, username: pUsername, password: pHash, role: "PARENT", childs: s.id, phone: body.parentPhone || null, mustChangePassword: true },
          });
          parentInfo = { email: parentEmail, username: np.username, tempPassword: pTemp, existing: false };
        }
      }
      // Custom fields (Settings → Custom Fields, tableName "students"): { [customFieldId]: value }
      if (body.customFieldValues && typeof body.customFieldValues === "object") {
        const entries = Object.entries(body.customFieldValues as Record<string, string>)
          .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
        if (entries.length > 0) {
          await tx.customFieldValue.createMany({
            data: entries.map(([customFieldId, fieldValue]) => ({
              customFieldId, belongTableId: s.id, fieldValue: String(fieldValue),
            })),
            skipDuplicates: true,
          });
        }
      }

      return { student: s, parentInfo };
    });

    const { student, parentInfo } = created;

    // Link the online application to the new student and flip it to enrolled.
    if (body.applicationId) {
      await markApplicationEnrolled(body.applicationId, student.id).catch(() => null);
    }

    // Notify the parent (best-effort) with login details. Email fires when a
    // parent email was given; WhatsApp fires when a phone was given — either
    // alone is enough (phone-only parents still get the student credentials).
    let delivery: any = null;
    const hasParentAccount = parentInfo && !parentInfo.conflict;
    if (hasParentAccount || body.parentPhone) {
      const profile = await (db as any).schoolProfile.findFirst({ select: { name: true } }).catch(() => null);
      const schoolName = profile?.name ?? "Your School";
      const loginUrl = `${req.nextUrl.origin}/sign-in`;
      const credentials = [
        { label: "Student", name: `${body.firstName ?? ""} ${body.lastName ?? ""}`.trim(), username, email, tempPassword },
        ...(hasParentAccount && !parentInfo.existing
          ? [{ label: "Parent", name: body.parentName || parentInfo.email, username: parentInfo.username, email: parentInfo.email, tempPassword: parentInfo.tempPassword }]
          : []),
      ];
      delivery = await notifyParentCredentials(db, {
        schoolName, loginUrl,
        parentEmail: hasParentAccount ? parentInfo.email : null,
        parentPhone: body.parentPhone || null,
        parentExisting: !!parentInfo?.existing,
        credentials,
      }).catch(() => null);
    }

    await audit("create", "student", student.id, { admissionNo: student.admissionNo });

    return NextResponse.json({
      ...student,
      tempPassword,
      parent: parentInfo
        ? { email: parentInfo.email, tempPassword: parentInfo.tempPassword ?? null, existing: !!parentInfo.existing, conflict: !!parentInfo.conflict }
        : null,
      delivery,
    }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Failed to create student" }, { status: 500 });
  }
}
