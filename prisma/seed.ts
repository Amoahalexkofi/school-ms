import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Super Admin ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@1234", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@school.edu" },
    update: {},
    create: {
      email: "admin@school.edu",
      password: adminPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✓ Super admin:", adminUser.email);

  // ─── Academic Session ─────────────────────────────────────────────────────
  const session = await prisma.academicSession.upsert({
    where: { id: "session-2026" },
    update: { isActive: true },
    create: {
      id: "session-2026",
      name: "2025/2026",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      isActive: true,
    },
  });
  console.log("✓ Session:", session.name);

  // ─── Classes ──────────────────────────────────────────────────────────────
  const classNames = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"];
  const classes = await Promise.all(
    classNames.map((name) =>
      prisma.class.upsert({
        where: { id: `class-${name.replace(" ", "-").toLowerCase()}` },
        update: {},
        create: {
          id: `class-${name.replace(" ", "-").toLowerCase()}`,
          name,
          sessionId: session.id,
        },
      })
    )
  );
  console.log("✓ Classes:", classes.map((c) => c.name).join(", "));

  // ─── Sections ─────────────────────────────────────────────────────────────
  const grade1 = classes[0];
  const sectionA = await prisma.section.upsert({
    where: { id: "section-g1-a" },
    update: {},
    create: { id: "section-g1-a", name: "A", classId: grade1.id },
  });
  const sectionB = await prisma.section.upsert({
    where: { id: "section-g1-b" },
    update: {},
    create: { id: "section-g1-b", name: "B", classId: grade1.id },
  });
  console.log("✓ Sections: A, B (Grade 1)");

  // ─── Subjects ─────────────────────────────────────────────────────────────
  const subjectData = [
    { id: "subj-math", name: "Mathematics", code: "MATH" },
    { id: "subj-eng", name: "English Language", code: "ENG" },
    { id: "subj-sci", name: "Integrated Science", code: "SCI" },
    { id: "subj-soc", name: "Social Studies", code: "SOC" },
  ];
  const subjects = await Promise.all(
    subjectData.map((s) =>
      prisma.subject.upsert({
        where: { id: s.id },
        update: {},
        create: { ...s, classId: grade1.id },
      })
    )
  );
  console.log("✓ Subjects:", subjects.map((s) => s.code).join(", "));

  // ─── Teacher ──────────────────────────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("Teacher@1234", 12);
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@school.edu" },
    update: {},
    create: {
      email: "teacher@school.edu",
      password: teacherPassword,
      role: "TEACHER",
    },
  });
  const teacher = await prisma.staff.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      firstName: "Sarah",
      lastName: "Mensah",
      employeeCode: "TCH-001",
      department: "Academic",
      designation: "Class Teacher",
      joinDate: new Date("2024-09-01"),
    },
  });
  // Assign teacher to Section A
  await prisma.section.update({
    where: { id: sectionA.id },
    data: { teacherId: teacher.id },
  });
  console.log("✓ Teacher:", `${teacher.firstName} ${teacher.lastName}`);

  // ─── Grading Scale ────────────────────────────────────────────────────────
  const existingScale = await prisma.gradingScale.findFirst({
    where: { isDefault: true },
  });
  if (!existingScale) {
    const scale = await prisma.gradingScale.create({
      data: {
        name: "Standard",
        isDefault: true,
        grades: {
          create: [
            { gradeLetter: "A+", minPercentage: 90, maxPercentage: 100, gradePoint: 4.0 },
            { gradeLetter: "A",  minPercentage: 80, maxPercentage: 89.99, gradePoint: 3.7 },
            { gradeLetter: "B+", minPercentage: 70, maxPercentage: 79.99, gradePoint: 3.3 },
            { gradeLetter: "B",  minPercentage: 60, maxPercentage: 69.99, gradePoint: 3.0 },
            { gradeLetter: "C",  minPercentage: 50, maxPercentage: 59.99, gradePoint: 2.0 },
            { gradeLetter: "D",  minPercentage: 40, maxPercentage: 49.99, gradePoint: 1.0 },
            { gradeLetter: "F",  minPercentage: 0,  maxPercentage: 39.99, gradePoint: 0.0 },
          ],
        },
      },
    });
    console.log("✓ Grading scale:", scale.name);
  }

  // ─── Fee Types & Group ────────────────────────────────────────────────────
  const tuition = await prisma.feeType.upsert({
    where: { id: "fee-tuition" },
    update: {},
    create: { id: "fee-tuition", name: "Tuition", category: "QUARTERLY", amount: 500 },
  });
  const sports = await prisma.feeType.upsert({
    where: { id: "fee-sports" },
    update: {},
    create: { id: "fee-sports", name: "Sports", category: "ANNUAL", amount: 100 },
  });
  const library = await prisma.feeType.upsert({
    where: { id: "fee-library" },
    update: {},
    create: { id: "fee-library", name: "Library", category: "ANNUAL", amount: 50 },
  });

  const feeGroup = await prisma.feeGroup.upsert({
    where: { id: "fg-term1-2026" },
    update: {},
    create: {
      id: "fg-term1-2026",
      name: "Term 1 Fees 2026",
      sessionId: session.id,
      items: {
        create: [
          { feeTypeId: tuition.id },
          { feeTypeId: sports.id },
          { feeTypeId: library.id },
        ],
      },
    },
  });
  console.log("✓ Fee group:", feeGroup.name, "(total: 650)");

  // ─── Sample Student ───────────────────────────────────────────────────────
  const studentPassword = await bcrypt.hash("Student@1234", 12);
  const studentUser = await prisma.user.upsert({
    where: { email: "student@school.edu" },
    update: {},
    create: {
      email: "student@school.edu",
      password: studentPassword,
      role: "STUDENT",
    },
  });
  const student = await prisma.student.upsert({
    where: { admissionNumber: "ADM-2026-0001" },
    update: {},
    create: {
      userId: studentUser.id,
      firstName: "Kwame",
      lastName: "Asante",
      admissionNumber: "ADM-2026-0001",
      dateOfBirth: new Date("2015-03-10"),
      gender: "MALE",
      enrollments: {
        create: { sectionId: sectionA.id },
      },
    },
  });
  console.log("✓ Student:", `${student.firstName} ${student.lastName}`, `(${student.admissionNumber})`);

  // ─── Discount Type ────────────────────────────────────────────────────────
  await prisma.discountType.upsert({
    where: { id: "disc-sibling" },
    update: {},
    create: { id: "disc-sibling", name: "Sibling Discount" },
  });
  await prisma.discountType.upsert({
    where: { id: "disc-merit" },
    update: {},
    create: { id: "disc-merit", name: "Merit Scholarship" },
  });
  console.log("✓ Discount types: Sibling, Merit");

  console.log("\nDatabase seeded successfully.");
  console.log("\nLogin credentials:");
  console.log("  Super Admin — admin@school.edu / Admin@1234");
  console.log("  Teacher     — teacher@school.edu / Teacher@1234");
  console.log("  Student     — student@school.edu / Student@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
