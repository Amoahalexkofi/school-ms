import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const adminUser = await (prisma as any).user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      email: "admin@school.edu",
      username: "admin",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Super admin:", adminUser.email);

  // ─── Demo Accounts (one per role) ────────────────────────────────────────
  const demoPassword = await bcrypt.hash("Demo@Skula2026", 12);
  const demoAccounts = [
    { email: "demo@getskula.com",             username: "demo",              role: "SUPER_ADMIN" },
    { email: "admin.demo@getskula.com",        username: "demo-admin",        role: "ADMIN"       },
    { email: "teacher.demo@getskula.com",      username: "demo-teacher",      role: "TEACHER"     },
    { email: "accountant.demo@getskula.com",   username: "demo-accountant",   role: "ACCOUNTANT"  },
    { email: "librarian.demo@getskula.com",    username: "demo-librarian",    role: "LIBRARIAN"   },
    { email: "student.demo@getskula.com",      username: "demo-student",      role: "STUDENT"     },
    { email: "parent.demo@getskula.com",       username: "demo-parent",       role: "PARENT"      },
  ];
  for (const acc of demoAccounts) {
    await (prisma as any).user.upsert({
      where: { email: acc.email },
      update: {},
      create: { ...acc, password: demoPassword },
    });
    console.log("✓ Demo account:", acc.email, `(${acc.role})`);
  }

  // ─── School Profile ───────────────────────────────────────────────────────
  const existingProfile = await (prisma as any).schoolProfile.findFirst();
  if (!existingProfile) {
    await (prisma as any).schoolProfile.create({
      data: {
        name: "Nova School",
        phone: "+233 20 000 0000",
        email: "info@novaschool.edu.gh",
        currency: "GHS",
        dateFormat: "DD/MM/YYYY",
        country: "Ghana",
        feeDueDays: 30,
      },
    });
    console.log("✓ School profile created");
  }

  // ─── Academic Session ─────────────────────────────────────────────────────
  const session = await (prisma as any).academicSession.upsert({
    where: { session: "2025/2026" },
    update: { isActive: true },
    create: {
      session: "2025/2026",
      startDate: new Date("2025-09-01"),
      endDate: new Date("2026-07-31"),
      isActive: true,
    },
  });
  console.log("✓ Session:", session.session);

  // ─── Classes (independent masters) ───────────────────────────────────────
  const classNames = ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6", "JHS 1", "JHS 2", "JHS 3"];
  const classes: any[] = [];
  for (const name of classNames) {
    const cls = await (prisma as any).class.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    classes.push(cls);
  }
  console.log("✓ Classes:", classes.map((c: any) => c.name).join(", "));

  // ─── Sections (independent masters) ──────────────────────────────────────
  const sectionNames = ["A", "B", "C"];
  const sections: any[] = [];
  for (const name of sectionNames) {
    const sec = await (prisma as any).section.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    sections.push(sec);
  }
  console.log("✓ Sections:", sections.map((s: any) => s.name).join(", "));

  // ─── Class Sections ───────────────────────────────────────────────────────
  const basic1 = classes[0];
  const secA = sections[0];
  const secB = sections[1];

  const classSection1A = await (prisma as any).classSection.upsert({
    where: { classId_sectionId: { classId: basic1.id, sectionId: secA.id } },
    update: {},
    create: { classId: basic1.id, sectionId: secA.id },
  });
  const classSection1B = await (prisma as any).classSection.upsert({
    where: { classId_sectionId: { classId: basic1.id, sectionId: secB.id } },
    update: {},
    create: { classId: basic1.id, sectionId: secB.id },
  });
  console.log("✓ Class sections: Basic 1 A, Basic 1 B");

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjectData = [
    { name: "Mathematics", code: "MATH" },
    { name: "English Language", code: "ENG" },
    { name: "Integrated Science", code: "SCI" },
    { name: "Social Studies", code: "SOC" },
    { name: "Computing", code: "COMP" },
  ];
  const subjects: any[] = [];
  for (const s of subjectData) {
    const existing = await (prisma as any).subject.findFirst({
      where: { code: s.code, classId: basic1.id, sessionId: session.id },
    });
    const sub = existing ?? await (prisma as any).subject.create({
      data: { ...s, classId: basic1.id, sessionId: session.id },
    });
    subjects.push(sub);
  }
  console.log("✓ Subjects:", subjects.map((s: any) => s.code).join(", "));

  // ─── Departments & Designations ───────────────────────────────────────────
  const deptNames = ["Academic", "Administration", "Finance", "Maintenance"];
  const depts: any[] = [];
  for (const name of deptNames) {
    const dept = await (prisma as any).department.upsert({ where: { name }, update: {}, create: { name } });
    depts.push(dept);
  }
  const desigNames = ["Principal", "Vice Principal", "Class Teacher", "Subject Teacher", "Accountant", "Librarian"];
  const desigs: any[] = [];
  for (const name of desigNames) {
    const desig = await (prisma as any).designation.upsert({ where: { name }, update: {}, create: { name } });
    desigs.push(desig);
  }
  console.log("✓ Departments & Designations created");

  // ─── Teacher ──────────────────────────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("Teacher@1234", 12);
  const teacherUser = await (prisma as any).user.upsert({
    where: { email: "teacher@school.edu" },
    update: {},
    create: { email: "teacher@school.edu", username: "teacher", password: teacherPassword, role: "TEACHER" },
  });
  const teacher = await (prisma as any).staff.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      employeeId: "EMP-001",
      firstName: "Sarah",
      lastName: "Mensah",
      departmentId: depts[0].id,
      designationId: desigs[2].id,
      dateOfJoining: new Date("2024-09-01"),
      gender: "Female",
      contractType: "PERMANENT",
      basicSalary: 2500,
    },
  });
  // Assign teacher to Basic 1A
  await (prisma as any).classSection.update({
    where: { id: classSection1A.id },
    data: { teacherId: teacher.id },
  });
  console.log("✓ Teacher:", `${teacher.firstName} ${teacher.lastName}`);

  // ─── Attendance Types ─────────────────────────────────────────────────────
  const attendanceTypes = [
    { type: "Present", keyValue: "P", nameStyle: "bg-green-100 text-green-700", isActive: true },
    { type: "Absent", keyValue: "A", nameStyle: "bg-red-100 text-red-700", isActive: true },
    { type: "Late", keyValue: "L", nameStyle: "bg-yellow-100 text-yellow-700", isActive: true },
    { type: "Holiday", keyValue: "H", nameStyle: "bg-blue-100 text-blue-700", isActive: true },
    { type: "Half Day", keyValue: "F", nameStyle: "bg-orange-100 text-orange-700", isActive: true },
  ];
  for (const at of attendanceTypes) {
    await (prisma as any).attendanceType.upsert({ where: { keyValue: at.keyValue }, update: {}, create: at });
  }
  const staffAttTypes = [
    { type: "Present", keyValue: "P", isActive: true },
    { type: "Absent", keyValue: "A", isActive: true },
    { type: "Late", keyValue: "L", isActive: true },
    { type: "Half Day", keyValue: "F", isActive: true },
    { type: "Leave", keyValue: "LE", isActive: true },
  ];
  for (const at of staffAttTypes) {
    await (prisma as any).staffAttendanceType.upsert({ where: { keyValue: at.keyValue }, update: {}, create: at });
  }
  console.log("✓ Attendance types seeded");

  // ─── Leave Types ──────────────────────────────────────────────────────────
  const leaveTypes = [
    { name: "Casual Leave", daysAllowed: 12 },
    { name: "Sick Leave", daysAllowed: 12 },
    { name: "Earned Leave", daysAllowed: 15 },
    { name: "Maternity Leave", daysAllowed: 90 },
  ];
  for (const lt of leaveTypes) {
    await (prisma as any).leaveType.upsert({ where: { name: lt.name }, update: {}, create: lt });
  }
  console.log("✓ Leave types seeded");

  // ─── Grading Scale ────────────────────────────────────────────────────────
  const existingScale = await (prisma as any).gradingScale.findFirst();
  if (!existingScale) {
    await (prisma as any).gradingScale.create({
      data: {
        name: "Standard Grading",
        ranges: {
          create: [
            { grade: "A+", gradePoint: 4.0, markFrom: 90, markTo: 100 },
            { grade: "A",  gradePoint: 3.7, markFrom: 80, markTo: 89.99 },
            { grade: "B+", gradePoint: 3.3, markFrom: 70, markTo: 79.99 },
            { grade: "B",  gradePoint: 3.0, markFrom: 60, markTo: 69.99 },
            { grade: "C",  gradePoint: 2.0, markFrom: 50, markTo: 59.99 },
            { grade: "D",  gradePoint: 1.0, markFrom: 40, markTo: 49.99 },
            { grade: "F",  gradePoint: 0.0, markFrom: 0,  markTo: 39.99 },
          ],
        },
      },
    });
  }
  // Mark Divisions
  const markDivisions = [
    { name: "Distinction", percentageFrom: 80, percentageTo: 100 },
    { name: "First Class", percentageFrom: 60, percentageTo: 79.99 },
    { name: "Second Class", percentageFrom: 45, percentageTo: 59.99 },
    { name: "Pass", percentageFrom: 40, percentageTo: 44.99 },
    { name: "Fail", percentageFrom: 0, percentageTo: 39.99 },
  ];
  for (const md of markDivisions) {
    const existing = await (prisma as any).markDivision.findFirst({ where: { name: md.name } });
    if (!existing) await (prisma as any).markDivision.create({ data: md });
  }
  console.log("✓ Grading scale & mark divisions seeded");

  // ─── Fee Categories & Types ───────────────────────────────────────────────
  const feeCat = await (prisma as any).feeCategory.upsert({
    where: { name: "Academic Fees" },
    update: {},
    create: { name: "Academic Fees" },
  });
  const feeTypeData = [
    { name: "Tuition Fee", code: "TF001", feeCategoryId: feeCat.id },
    { name: "Sports Fee", code: "SF001", feeCategoryId: feeCat.id },
    { name: "Library Fee", code: "LF001", feeCategoryId: feeCat.id },
    { name: "Computer Lab Fee", code: "CLF001", feeCategoryId: feeCat.id },
  ];
  const feeTypes: any[] = [];
  for (const ft of feeTypeData) {
    const existing = await (prisma as any).feeType.findUnique({ where: { code: ft.code } });
    const feeType = existing ?? await (prisma as any).feeType.create({ data: ft });
    feeTypes.push(feeType);
  }

  // ─── Fee Group → Session Group → Group Items ──────────────────────────────
  const feeGroup = await (prisma as any).feeGroup.upsert({
    where: { name: "Term 1 Fees 2025/2026" },
    update: {},
    create: { name: "Term 1 Fees 2025/2026" },
  });
  let feeSessionGroup = await (prisma as any).feeSessionGroup.findFirst({
    where: { feeGroupId: feeGroup.id, sessionId: session.id },
  });
  if (!feeSessionGroup) {
    feeSessionGroup = await (prisma as any).feeSessionGroup.create({
      data: { feeGroupId: feeGroup.id, sessionId: session.id },
    });
    // Add items
    const amounts = [500, 100, 50, 80];
    for (let i = 0; i < feeTypes.length; i++) {
      await (prisma as any).feeGroupItem.create({
        data: {
          feeSessionGroupId: feeSessionGroup.id,
          feeTypeId: feeTypes[i].id,
          amount: amounts[i],
          dueDate: new Date("2025-10-31"),
        },
      });
    }
  }
  console.log("✓ Fee structure: Term 1 Fees 2025/2026 (₵730 total)");

  // ─── Sample Student ───────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@1234", 12);
  const studentUser = await (prisma as any).user.upsert({
    where: { email: "student@school.edu" },
    update: {},
    create: { email: "student@school.edu", username: "student001", password: studentPassword, role: "STUDENT" },
  });
  const existingStudent = await (prisma as any).student.findUnique({ where: { admissionNo: "ADM/2026/001" } });
  const student = existingStudent ?? await (prisma as any).student.create({
    data: {
      userId: studentUser.id,
      firstName: "Kwame",
      lastName: "Asante",
      admissionNo: "ADM/2026/001",
      admissionDate: new Date("2025-09-01"),
      dateOfBirth: new Date("2015-03-10"),
      gender: "Male",
      bloodGroup: "O+",
      fatherName: "Kofi Asante",
      fatherPhone: "+233 24 000 0001",
      motherName: "Akua Asante",
    },
  });

  // Enroll in session
  const existingSession = await (prisma as any).studentSession.findFirst({
    where: { studentId: student.id, sessionId: session.id },
  });
  if (!existingSession) {
    await (prisma as any).studentSession.create({
      data: {
        studentId: student.id,
        sessionId: session.id,
        classSectionId: classSection1A.id,
        rollNo: "001",
        defaultLogin: true,
      },
    });
  }
  console.log("✓ Student:", `${student.firstName} ${student.lastName}`, `(${student.admissionNo})`);

  // ─── School House ─────────────────────────────────────────────────────────
  const houses = ["Red House", "Blue House", "Green House", "Yellow House"];
  for (const name of houses) {
    await (prisma as any).schoolHouse.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("✓ School houses seeded");

  // ─── Visitor Purposes ─────────────────────────────────────────────────────
  const purposes = ["Parent Meeting", "Official Visit", "Maintenance", "Job Application", "Delivery", "Other"];
  for (const name of purposes) {
    await (prisma as any).visitorPurpose.upsert({ where: { name }, update: {}, create: { name } });
  }

  // ─── Complaint Types ──────────────────────────────────────────────────────
  const complaintTypes = ["Academic", "Financial", "Behavioral", "Infrastructure", "Staff Conduct", "Other"];
  for (const name of complaintTypes) {
    await (prisma as any).complaintType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("✓ Front office lookup data seeded");

  // ─── Room Types ───────────────────────────────────────────────────────────
  const roomTypes = ["Single", "Double", "4-Bed", "6-Bed", "Dormitory"];
  for (const name of roomTypes) {
    await (prisma as any).roomType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("✓ Room types seeded");

  console.log("\n✅ Database seeded successfully.");
  console.log("\nLogin credentials:");
  console.log("  Super Admin — admin@school.edu      / Admin@1234");
  console.log("  Teacher     — teacher@school.edu    / Teacher@1234");
  console.log("  Student     — student@school.edu    / Student@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
