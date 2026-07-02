/**
 * GES SBA showcase seeder — demo school (public schema).
 * Creates: the 4 GES assessment components, an "End of Term 1 Examination"
 * exam group with schedules for every Basic 1 subject, realistic component
 * marks (class work / project / quizzes / exam) for every enrolled student in
 * Basic 1 A, and TermReport wrapper rows (attendance, conduct, remarks…).
 * Idempotent: safe to re-run.
 *
 *   npx dotenv -e .env -- npx tsx scripts/seed-sba-demo.ts
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as any;

// weight doubles as max mark (GES)
const GES = [
  { name: "Class Work / Home Work", weight: 20, isExam: false, sortOrder: 0 },
  { name: "Project / Practical",    weight: 15, isExam: false, sortOrder: 1 },
  { name: "Group Work / Quizzes",   weight: 15, isExam: false, sortOrder: 2 },
  { name: "End-of-Term Exam",       weight: 50, isExam: true,  sortOrder: 3 },
];

const CONDUCTS  = ["Excellent", "Very Good", "Good", "Very Good", "Good"];
const ATTITUDES = ["Positive", "Respectful", "Cooperative", "Attentive", "Diligent"];
const INTERESTS = ["Reading", "Football", "Art & Craft", "Music", "Science Club"];
const REMARKS: [number, string][] = [
  [80, "An excellent result — keep soaring!"],
  [70, "Very good performance; keep it up."],
  [60, "Good work; aim even higher next term."],
  [50, "A fair effort; more room to improve."],
  [0,  "Needs to sit up; capable of much more."],
];

// mid-biased random int in [lo, hi]
function ri(lo: number, hi: number) {
  const r = (Math.random() + Math.random()) / 2;
  return Math.round(lo + r * (hi - lo));
}

async function main() {
  console.log("→ Seeding GES SBA showcase…");

  const session = await prisma.academicSession.findFirst({ where: { isActive: true } });
  if (!session) throw new Error("No active session");
  const basic1 = await prisma.class.findUnique({ where: { name: "Basic 1" } });
  const secA = await prisma.section.findUnique({ where: { name: "A" } });
  const csA = await prisma.classSection.findFirst({ where: { classId: basic1.id, sectionId: secA.id } });
  const subjects = await prisma.subject.findMany({ where: { classId: basic1.id, sessionId: session.id } });
  if (!subjects.length) throw new Error("No Basic 1 subjects — run seed-demo.ts first");

  // Grading scale for grades
  const scale = await prisma.gradingScale.findFirst({
    orderBy: { createdAt: "asc" },
    include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
  });
  const gradeFor = (marks: number): string | null => {
    for (const r of scale?.ranges ?? []) {
      if (marks >= Number(r.markFrom) && marks <= Number(r.markTo)) return r.grade;
    }
    return null;
  };

  // 1. Components (find-or-create by name)
  const components: any[] = [];
  for (const c of GES) {
    let comp = await prisma.assessmentComponent.findFirst({ where: { name: c.name } });
    if (!comp) comp = await prisma.assessmentComponent.create({ data: c });
    else if (!comp.isActive) comp = await prisma.assessmentComponent.update({ where: { id: comp.id }, data: { isActive: true } });
    components.push(comp);
  }
  console.log(`  ✓ ${components.length} assessment components`);

  // 2. Exam group + schedules
  let group = await prisma.examGroup.findFirst({ where: { name: "End of Term 1 Examination" } });
  if (!group) {
    group = await prisma.examGroup.create({
      data: { name: "End of Term 1 Examination", examType: "TERM", isPublished: true, passingPercentage: 40 },
    });
  }
  const schedules: any[] = [];
  for (const subj of subjects) {
    let sched = await prisma.examSchedule.findFirst({ where: { examGroupId: group.id, subjectId: subj.id } });
    if (!sched) {
      sched = await prisma.examSchedule.create({
        data: {
          examGroupId: group.id, sessionId: session.id, subjectId: subj.id, classSectionId: csA.id,
          fullMarks: 100, passingMarks: 40, dateOfExam: new Date("2026-06-25"), isPublished: true,
        },
      });
    }
    schedules.push(sched);
  }
  console.log(`  ✓ exam group "${group.name}" with ${schedules.length} subject schedules`);

  // 3. Component marks + totals for every enrolled Basic 1 A student
  const enrollments = await prisma.studentSession.findMany({
    where: { classSectionId: csA.id, sessionId: session.id, isActive: true },
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
  });
  console.log(`  → ${enrollments.length} students × ${schedules.length} subjects`);

  // Per-student ability level so results look coherent across subjects
  const ability = new Map<string, number>();
  for (const enr of enrollments) ability.set(enr.student.id, 0.45 + Math.random() * 0.5); // 0.45–0.95

  let marksWritten = 0;
  for (const sched of schedules) {
    for (const enr of enrollments) {
      const sid = enr.student.id;
      const a = ability.get(sid)!;
      const jitter = () => Math.max(0.3, Math.min(1, a + (Math.random() - 0.5) * 0.25));
      const scores = components.map((c) => {
        const max = Number(c.weight);
        return { componentId: c.id, val: Math.min(max, ri(Math.round(max * jitter() * 0.75), Math.round(max * jitter()))) };
      });
      for (const s of scores) {
        const existing = await prisma.componentMark.findFirst({
          where: { examScheduleId: sched.id, studentId: sid, componentId: s.componentId },
        });
        if (existing) await prisma.componentMark.update({ where: { id: existing.id }, data: { marksObtained: s.val } });
        else await prisma.componentMark.create({
          data: { examScheduleId: sched.id, studentId: sid, componentId: s.componentId, marksObtained: s.val },
        });
      }
      const total = scores.reduce((x, s) => x + s.val, 0);
      const entry = await prisma.markEntry.findFirst({ where: { examScheduleId: sched.id, studentId: sid } });
      const data = {
        marksObtained: total, attendance: "P", grade: gradeFor(total), isPassing: total >= 40,
        subjectId: sched.subjectId,
      };
      if (entry) await prisma.markEntry.update({ where: { id: entry.id }, data });
      else await prisma.markEntry.create({ data: { examScheduleId: sched.id, studentId: sid, ...data } });
      marksWritten++;
    }
  }
  console.log(`  ✓ ${marksWritten} subject results written (component breakdown + totals)`);

  // 4. Term report wrapper rows
  for (const enr of enrollments) {
    const sid = enr.student.id;
    const a = ability.get(sid)!;
    const present = ri(50, 60);
    const avgPct = Math.round(a * 100);
    const remark = REMARKS.find(([min]) => avgPct >= min)![1];
    const data = {
      attendancePresent: present, attendanceTotal: 60,
      conduct: CONDUCTS[ri(0, CONDUCTS.length - 1)],
      attitude: ATTITUDES[ri(0, ATTITUDES.length - 1)],
      interest: INTERESTS[ri(0, INTERESTS.length - 1)],
      classTeacherRemark: remark,
      headTeacherRemark: avgPct >= 70 ? "Impressive performance." : "There is room to do better.",
      promotedTo: "Basic 2",
      nextTermBegins: new Date("2026-09-08"),
    };
    const existing = await prisma.termReport.findFirst({ where: { examGroupId: group.id, studentId: sid } });
    if (existing) await prisma.termReport.update({ where: { id: existing.id }, data });
    else await prisma.termReport.create({ data: { examGroupId: group.id, studentId: sid, ...data } });
  }
  console.log(`  ✓ ${enrollments.length} term report rows (attendance, conduct, remarks…)`);

  console.log(`\nDone. Show it at:`);
  console.log(`  Marks entry:   /exams/${group.id}  → any schedule → Enter Marks`);
  console.log(`  Term report:   /exams/${group.id}/term-report`);
  console.log(`  PDF:           Exams → Marksheets → "End of Term 1 Examination" → Basic 1 – A`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
