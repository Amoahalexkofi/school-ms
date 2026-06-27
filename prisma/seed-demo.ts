/**
 * Demo data seeder — populates the demo school (public schema) with rich,
 * realistic data so every role's dashboard/portal looks alive.
 * Idempotent: safe to re-run (uses deterministic keys + find-or-create).
 *
 *   DATABASE_URL="..." npx tsx prisma/seed-demo.ts
 */
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as any;

const FIRST = ["Kofi","Ama","Yaw","Akua","Kwabena","Abena","Kojo","Adwoa","Kwaku","Afua","Kwame","Akosua","Yaa","Fiifi","Esi","Nana","Efua","Kwesi","Kobina","Adjoa"];
const LAST  = ["Mensah","Owusu","Boateng","Asante","Adjei","Annan","Darko","Appiah","Osei","Frimpong","Agyeman","Bediako","Acheampong","Gyasi","Ofori","Sarpong","Nkrumah","Quaye","Tetteh","Amponsah"];

function pad(n: number) { return String(n).padStart(3, "0"); }
function rand<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }

async function main() {
  console.log("→ Seeding demo data…");

  // ── Core entities ────────────────────────────────────────────────────────
  const session = await prisma.academicSession.findFirst({ where: { isActive: true } });
  if (!session) throw new Error("No active session");
  const basic1 = await prisma.class.findUnique({ where: { name: "Basic 1" } });
  const secA = await prisma.section.findUnique({ where: { name: "A" } });
  const secB = await prisma.section.findUnique({ where: { name: "B" } });
  const csA = await prisma.classSection.findFirst({ where: { classId: basic1.id, sectionId: secA.id } });
  const csB = await prisma.classSection.findFirst({ where: { classId: basic1.id, sectionId: secB.id } });
  const subjects = await prisma.subject.findMany({ where: { classId: basic1.id, sessionId: session.id } });
  const [pType, aType, lType] = await Promise.all([
    prisma.attendanceType.findUnique({ where: { keyValue: "P" } }),
    prisma.attendanceType.findUnique({ where: { keyValue: "A" } }),
    prisma.attendanceType.findUnique({ where: { keyValue: "L" } }),
  ]);

  // Main branch (Multi Branch add-on)
  let mainBranch = await prisma.branch.findFirst({ where: { isMain: true } });
  if (!mainBranch) mainBranch = await prisma.branch.create({ data: { name: "Main Branch", isMain: true } });
  const branchId = mainBranch.id;

  const stuPassword = await bcrypt.hash("Student@1234", 12);

  // ── Helper: find-or-create an enrolled student ─────────────────────────────
  async function ensureStudent(opts: {
    seq: number; firstName: string; lastName: string; gender: string; cs: any;
    userId?: string; admissionNo?: string;
  }) {
    const admissionNo = opts.admissionNo ?? `DEMO/2026/${pad(opts.seq)}`;
    let student = await prisma.student.findUnique({ where: { admissionNo } });
    if (!student) {
      let userId = opts.userId;
      if (!userId) {
        const email = `demostu${pad(opts.seq)}@demo.local`;
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, username: `demostu_${pad(opts.seq)}`, password: stuPassword, role: "STUDENT" },
        });
        userId = user.id;
      }
      const year = 2013 + (opts.seq % 3);
      student = await prisma.student.create({
        data: {
          userId, admissionNo, branchId,
          firstName: opts.firstName, lastName: opts.lastName, gender: opts.gender,
          dateOfBirth: new Date(`${year}-0${(opts.seq % 9) + 1}-15`),
          admissionDate: new Date("2025-09-01"),
          bloodGroup: rand(["A+","B+","O+","AB+","O-"]),
          mobileNo: `+23320${pad(opts.seq)}4567`,
          fatherName: `${rand(FIRST)} ${opts.lastName}`,
          fatherPhone: `+23324${pad(opts.seq)}1122`,
          guardianName: `${rand(FIRST)} ${opts.lastName}`,
          guardianPhone: `+23324${pad(opts.seq)}1122`,
          currentAddress: `${opts.seq} Independence Ave, Accra`,
        },
      });
    } else if (opts.userId && student.userId !== opts.userId) {
      // already exists
    }
    // Enrollment
    const enrolled = await prisma.studentSession.findFirst({
      where: { studentId: student.id, sessionId: session.id, classSectionId: opts.cs.id },
    });
    if (!enrolled) {
      await prisma.studentSession.create({
        data: { studentId: student.id, sessionId: session.id, classSectionId: opts.cs.id, rollNo: String(opts.seq), isActive: true },
      });
    }
    return student;
  }

  // ── Students: link demo student + bulk class ───────────────────────────────
  const studentDemoUser = await prisma.user.findUnique({ where: { email: "student.demo@getskula.com" } });
  const demoStudent = await ensureStudent({
    seq: 1, firstName: "Ama", lastName: "Boateng", gender: "Female", cs: csA,
    userId: studentDemoUser?.id, admissionNo: "DEMO/2026/001",
  });

  const created: any[] = [demoStudent];
  for (let i = 2; i <= 20; i++) {
    const cs = i % 2 === 0 ? csA : csB;
    const s = await ensureStudent({
      seq: i, firstName: rand(FIRST), lastName: rand(LAST), gender: i % 2 === 0 ? "Male" : "Female", cs,
    });
    created.push(s);
  }
  console.log(`✓ Students: ${created.length} enrolled (Basic 1 A/B)`);

  // Link parent.demo → demo student
  const parentUser = await prisma.user.findUnique({ where: { email: "parent.demo@getskula.com" } });
  if (parentUser) {
    await prisma.user.update({ where: { id: parentUser.id }, data: { childs: demoStudent.id } });
    console.log("✓ Parent linked to Ama Boateng");
  }

  // ── Teachers (incl. demo teacher) ──────────────────────────────────────────
  const staffPassword = await bcrypt.hash("Staff@1234", 12);
  async function ensureTeacher(seq: number, firstName: string, lastName: string, userId?: string) {
    const employeeId = `EMPDEMO${pad(seq)}`;
    let staff = await prisma.staff.findUnique({ where: { employeeId } });
    if (!staff) {
      let uid = userId;
      if (!uid) {
        const email = `demoteach${pad(seq)}@demo.local`;
        const u = await prisma.user.upsert({ where: { email }, update: {}, create: { email, username: `demoteach_${pad(seq)}`, password: staffPassword, role: "TEACHER" } });
        uid = u.id;
      }
      staff = await prisma.staff.create({
        data: {
          userId: uid, employeeId, branchId, firstName, lastName, gender: seq % 2 ? "Male" : "Female",
          contactNo: `+23327${pad(seq)}8899`, dateOfJoining: new Date("2024-09-01"),
          qualification: "B.Ed", basicSalary: 2500 + seq * 100,
        },
      });
    }
    return staff;
  }
  const teacherDemoUser = await prisma.user.findUnique({ where: { email: "teacher.demo@getskula.com" } });
  const demoTeacher = await ensureTeacher(1, "Kojo", "Annan", teacherDemoUser?.id);
  await ensureTeacher(2, "Esi", "Owusu");
  await ensureTeacher(3, "Yaw", "Darko");
  // Assign subjects to the demo teacher
  for (const subj of subjects.slice(0, 3)) {
    const has = await prisma.teacherSubject.findFirst({ where: { staffId: demoTeacher.id, subjectId: subj.id } });
    if (!has) await prisma.teacherSubject.create({ data: { staffId: demoTeacher.id, subjectId: subj.id } });
  }
  console.log("✓ Teachers seeded + demo teacher linked");

  // ── Fees ───────────────────────────────────────────────────────────────────
  const cat = await prisma.feeCategory.upsert({
    where: { branchId_name: { branchId, name: "Academic" } },
    update: {}, create: { name: "Academic", branchId },
  }).catch(async () => prisma.feeCategory.findFirst({ where: { name: "Academic" } }));
  const feeType = await prisma.feeType.upsert({
    where: { branchId_code: { branchId, code: "TUI1" } },
    update: {}, create: { name: "Term 1 Tuition", code: "TUI1", feeCategoryId: cat.id, branchId },
  }).catch(async () => prisma.feeType.findFirst({ where: { code: "TUI1" } }));
  const feeGroup = await prisma.feeGroup.upsert({
    where: { branchId_name: { branchId, name: "Term 1 Fees" } },
    update: {}, create: { name: "Term 1 Fees", branchId },
  }).catch(async () => prisma.feeGroup.findFirst({ where: { name: "Term 1 Fees" } }));
  let fsg = await prisma.feeSessionGroup.findFirst({ where: { feeGroupId: feeGroup.id, sessionId: session.id } });
  if (!fsg) fsg = await prisma.feeSessionGroup.create({ data: { feeGroupId: feeGroup.id, sessionId: session.id } });
  let item = await prisma.feeGroupItem.findFirst({ where: { feeSessionGroupId: fsg.id, feeTypeId: feeType.id } });
  if (!item) item = await prisma.feeGroupItem.create({
    data: { feeSessionGroupId: fsg.id, feeTypeId: feeType.id, amount: 600, dueDate: new Date("2026-07-15"), fineType: "NONE" },
  });

  let collected = 0, paidCount = 0;
  for (let i = 0; i < created.length; i++) {
    const s = created[i];
    const ss = await prisma.studentSession.findFirst({ where: { studentId: s.id, sessionId: session.id } });
    if (!ss) continue;
    let master = await prisma.studentFeesMaster.findFirst({ where: { studentSessionId: ss.id, feeSessionGroupId: fsg.id } });
    if (!master) master = await prisma.studentFeesMaster.create({
      data: { studentId: s.id, studentSessionId: ss.id, feeSessionGroupId: fsg.id, amount: 600 },
    });
    // ~65% paid (full or partial)
    const existingDep = await prisma.feeDeposit.findFirst({ where: { studentFeesMasterId: master.id } });
    if (!existingDep && i % 3 !== 2) {
      const amt = i % 4 === 0 ? 300 : 600; // some partial
      await prisma.feeDeposit.create({
        data: {
          studentFeesMasterId: master.id, feeGroupItemId: item.id,
          amountDetail: { "1": { amount: amt, discount: 0, fine: 0, date: "2026-06-05", payment_mode: rand(["Cash","Mobile Money","Bank"]), description: "Term 1", received_by: "Accounts", inv_no: 1000 + i } },
        },
      });
      collected += amt; paidCount++;
    }
  }
  console.log(`✓ Fees: assigned to all, ${paidCount} paid, ₵${collected} collected`);

  // ── Attendance: last ~12 weekdays (incl today) ─────────────────────────────
  const enrollments = await prisma.studentSession.findMany({
    where: { sessionId: session.id, classSectionId: { in: [csA.id, csB.id] }, isActive: true },
  });
  const byCs: Record<string, any[]> = { [csA.id]: [], [csB.id]: [] };
  for (const e of enrollments) (byCs[e.classSectionId] ??= []).push(e);

  const days: Date[] = [];
  const cur = new Date(); cur.setHours(0, 0, 0, 0);
  while (days.length < 12) {
    if (cur.getDay() !== 0 && cur.getDay() !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() - 1);
  }
  let attRecords = 0;
  for (const csId of [csA.id, csB.id]) {
    for (const day of days) {
      let ad = await prisma.attendanceDay.findFirst({ where: { date: day, classSectionId: csId } });
      if (!ad) ad = await prisma.attendanceDay.create({ data: { date: day, classSectionId: csId, sessionId: session.id, markedBy: "Demo" } });
      for (const e of byCs[csId]) {
        const exists = await prisma.studentAttendance.findFirst({ where: { studentSessionId: e.id, attendanceDayId: ad.id } });
        if (exists) continue;
        const r = Math.random();
        const type = r < 0.88 ? pType : r < 0.96 ? aType : lType;
        await prisma.studentAttendance.create({
          data: { studentId: e.studentId, studentSessionId: e.id, attendanceDayId: ad.id, attendanceTypeId: type.id },
        });
        attRecords++;
      }
    }
  }
  console.log(`✓ Attendance: ${attRecords} records across ${days.length} days`);

  // ── Grading scale ──────────────────────────────────────────────────────────
  let scale = await prisma.gradingScale.findFirst({ where: { name: "Default Scale" } });
  if (!scale) {
    scale = await prisma.gradingScale.create({ data: { name: "Default Scale" } });
    const ranges = [
      ["A", 4.0, 80, 100], ["B", 3.0, 70, 79], ["C", 2.0, 60, 69],
      ["D", 1.0, 50, 59], ["E", 0.5, 40, 49], ["F", 0.0, 0, 39],
    ] as const;
    for (const [grade, gp, from, to] of ranges) {
      await prisma.gradeRange.create({ data: { gradingScaleId: scale.id, grade, gradePoint: gp, markFrom: from, markTo: to } });
    }
  }
  function gradeFor(pct: number) {
    return pct >= 80 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : pct >= 40 ? "E" : "F";
  }

  // ── Exams + marks ──────────────────────────────────────────────────────────
  let examGroup = await prisma.examGroup.findFirst({ where: { name: "Mid-Term Exams" } });
  if (!examGroup) examGroup = await prisma.examGroup.create({ data: { name: "Mid-Term Exams", examType: "Mid Term", isPublished: true, passingPercentage: 40 } });
  let markCount = 0;
  for (const subj of subjects) {
    let sched = await prisma.examSchedule.findFirst({ where: { examGroupId: examGroup.id, subjectId: subj.id } });
    if (!sched) sched = await prisma.examSchedule.create({
      data: { examGroupId: examGroup.id, sessionId: session.id, subjectId: subj.id, classSectionId: csA.id, fullMarks: 100, passingMarks: 40, dateOfExam: new Date("2026-06-10"), isPublished: true },
    });
    for (const s of created) {
      const exists = await prisma.markEntry.findFirst({ where: { examScheduleId: sched.id, studentId: s.id } });
      if (exists) continue;
      const marks = 40 + Math.floor(Math.random() * 56); // 40–95
      await prisma.markEntry.create({
        data: { examScheduleId: sched.id, studentId: s.id, subjectId: subj.id, marksObtained: marks, grade: gradeFor(marks), isPassing: marks >= 40, attendance: "P" },
      });
      markCount++;
    }
  }
  console.log(`✓ Exams: Mid-Term published, ${markCount} marks entered`);

  // ── Homework ───────────────────────────────────────────────────────────────
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const hwDefs = [
    { subj: 0, title: "Addition & subtraction worksheet", days: 3 },
    { subj: 1, title: "Read chapter 2 and summarise", days: 5 },
    { subj: 2, title: "Draw the water cycle", days: -2 },     // overdue
    { subj: 3, title: "Map of Ghana — label regions", days: 1 },
  ];
  let hwCount = 0;
  for (const csId of [csA.id, csB.id]) {
    for (const def of hwDefs) {
      const subj = subjects[def.subj];
      if (!subj) continue;
      const due = new Date(today0); due.setDate(due.getDate() + def.days);
      const existing = await prisma.homework.findFirst({ where: { classSectionId: csId, subjectId: subj.id, title: def.title } });
      if (existing) continue;
      const hw = await prisma.homework.create({
        data: {
          classSectionId: csId, subjectId: subj.id, staffId: demoTeacher.id, sessionId: session.id,
          title: def.title, description: `${subj.name} assignment.`,
          homeworkDate: today0, dueDate: due,
        },
      });
      hwCount++;
      // Mark the demo student's first homework (csA, math) as submitted
      if (csId === csA.id && def.subj === 0) {
        await prisma.homeworkAcknowledgement.create({ data: { homeworkId: hw.id, studentId: demoStudent.id, acknowledged: true } }).catch(() => {});
      }
    }
  }
  console.log(`✓ Homework: ${hwCount} items`);

  // ── Lesson Plan (Smart School: lesson → topics with complete/incomplete) ──────
  const lessonDefs = [
    { subj: 0, name: "Numbers & Place Value", topics: [
      { name: "Place value to 1000", done: true }, { name: "Comparing & ordering numbers", done: true },
      { name: "Rounding to nearest 10/100", done: false },
    ] },
    { subj: 0, name: "Addition & Subtraction", topics: [
      { name: "Addition with regrouping", done: true }, { name: "Subtraction with borrowing", done: false },
      { name: "Word problems", done: false },
    ] },
    { subj: 1, name: "Reading Comprehension", topics: [
      { name: "Comprehension: short stories", done: true }, { name: "Main idea & details", done: false },
    ] },
    { subj: 1, name: "Grammar Basics", topics: [
      { name: "Parts of speech — nouns & verbs", done: false }, { name: "Sentence construction", done: false },
    ] },
    { subj: 2, name: "Matter & Materials", topics: [
      { name: "States of matter", done: true }, { name: "Changes of state", done: false },
    ] },
    { subj: 3, name: "Our Country Ghana", topics: [
      { name: "Regions of Ghana", done: false }, { name: "Major rivers & lakes", done: false },
    ] },
  ];
  let lpCount = 0, topicCount = 0;
  for (const def of lessonDefs) {
    const subj = subjects[def.subj];
    if (!subj) continue;
    const exists = await prisma.lesson.findFirst({ where: { classSectionId: csA.id, subjectId: subj.id, name: def.name } });
    if (exists) continue;
    const lesson = await prisma.lesson.create({
      data: { name: def.name, subjectId: subj.id, classSectionId: csA.id, sessionId: session.id },
    });
    lpCount++;
    for (const t of def.topics) {
      const cd = new Date(today0); cd.setDate(cd.getDate() - 3);
      await prisma.topic.create({
        data: { name: t.name, lessonId: lesson.id, sessionId: session.id, status: t.done, completeDate: t.done ? cd : null },
      });
      topicCount++;
    }
  }
  console.log(`✓ Lesson Plan: ${lpCount} lessons, ${topicCount} topics`);

  // ── Weekly Syllabus (subject_syllabus scheduler) ─────────────────────────────
  // Schedule topics across the current week for Mathematics, English & Science
  // so each subject's Weekly Plan grid looks populated.
  const monday = new Date(today0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); // Monday of this week
  let sylCount = 0;
  const schedule = async (t: any, off: number, from: string, to: string, video: boolean) => {
    const date = new Date(monday); date.setDate(date.getDate() + off);
    const exists = await prisma.subjectSyllabus.findFirst({ where: { topicId: t.id, date, timeFrom: from } });
    if (exists) return;
    await prisma.subjectSyllabus.create({
      data: {
        topicId: t.id, sessionId: session.id, date, timeFrom: from, timeTo: to,
        createdForId: demoTeacher.id, createdById: demoTeacher.id,
        subTopic: t.name,
        generalObjectives: `By the end of the lesson, pupils should understand "${t.name}".`,
        previousKnowledge: "Pupils have covered the preceding topics in this lesson.",
        teachingMethod: "Discussion, demonstration and group work.",
        presentation: "Introduce the concept, work examples, then guided practice.",
        comprehensiveQuestions: `What did we learn about ${t.name}? Give one example.`,
        lectureYoutubeUrl: video ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : null,
      },
    });
    sylCount++;
  };
  // Per-subject plan: [subject index, [day-offset, from, to, withVideo] ...]
  const weeklyPlan: { subj: number; slots: [number, string, string, boolean][] }[] = [
    { subj: 0, slots: [[0, "08:00", "09:00", true], [1, "09:00", "10:00", false], [2, "10:30", "11:30", false], [3, "08:00", "09:00", false]] }, // Mathematics
    { subj: 1, slots: [[1, "11:00", "12:00", true], [3, "10:00", "11:00", false]] }, // English Language
    { subj: 2, slots: [[0, "11:30", "12:30", true], [4, "09:00", "10:00", false]] }, // Integrated Science
  ];
  for (const p of weeklyPlan) {
    const subj = subjects[p.subj];
    if (!subj) continue;
    const tps = await prisma.topic.findMany({
      where: { lesson: { classSectionId: csA.id, subjectId: subj.id } },
      orderBy: { createdAt: "asc" }, take: p.slots.length,
    });
    for (let i = 0; i < tps.length; i++) {
      const [off, from, to, video] = p.slots[i];
      await schedule(tps[i], off, from, to, video);
    }
  }
  console.log(`✓ Weekly Syllabus: ${sylCount} new scheduled entries`);

  // ── Front Office: phone call log ─────────────────────────────────────────────
  const callDefs = [
    { name: "Ama Owusu (parent)", phone: "0244000111", callType: "incoming", days: -1, description: "Asked about Term 2 fees deadline", callDuration: "4 min", follow: 2 },
    { name: "GES District Office", phone: "0302000222", callType: "incoming", days: -2, description: "BECE registration reminder", callDuration: "8 min", follow: 0 },
    { name: "Kwame Mensah (supplier)", phone: "0208000333", callType: "outgoing", days: -3, description: "Followed up on textbook delivery", callDuration: "6 min", follow: 5 },
  ];
  let callCount = 0;
  for (const c of callDefs) {
    const exists = await prisma.phoneCallLog.findFirst({ where: { name: c.name, description: c.description } });
    if (exists) continue;
    const date = new Date(today0); date.setDate(date.getDate() + c.days);
    const nf = c.follow ? new Date(Date.now() + c.follow * 86400000) : null;
    await prisma.phoneCallLog.create({ data: { name: c.name, phone: c.phone, callType: c.callType, date, description: c.description, callDuration: c.callDuration, nextFollowUp: nf } });
    callCount++;
  }
  console.log(`✓ Phone Calls: ${callCount} logged`);

  // ── Library ────────────────────────────────────────────────────────────────
  const books = [
    ["The Very Hungry Caterpillar", "Eric Carle", "978-0241003008"],
    ["Charlotte's Web", "E.B. White", "978-0061124952"],
    ["Things Fall Apart", "Chinua Achebe", "978-0385474542"],
    ["Matilda", "Roald Dahl", "978-0142410370"],
    ["The Cat in the Hat", "Dr. Seuss", "978-0007158447"],
    ["Anansi the Spider", "Gerald McDermott", "978-0805003116"],
    ["Oxford Primary Dictionary", "Oxford", "978-0192767189"],
    ["Basic Mathematics for JHS", "Aki-Ola", "978-9988260101"],
  ];
  let bookCount = 0;
  for (let i = 0; i < books.length; i++) {
    const [title, author, isbn] = books[i];
    const bookNo = `BK${pad(i + 1)}`;
    const exists = await prisma.book.findFirst({ where: { bookNo } });
    if (!exists) {
      await prisma.book.create({
        data: { title, author, isbn, bookNo, subject: "General", publisher: "—", rackNo: `R${(i % 4) + 1}`, quantity: 5, available: 5, perUnitCost: 25 + i },
      });
      bookCount++;
    }
  }
  console.log(`✓ Library: ${bookCount} books added`);

  console.log("✅ Demo data seeded.");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
