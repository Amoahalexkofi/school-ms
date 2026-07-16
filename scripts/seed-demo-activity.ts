// One-off: give the demo school living activity so the analytics features
// (sparklines, month deltas, monthly revenue curve, attendance trend, last
// payment) actually render for prospects. Public schema = the demo tenant.
import { PrismaClient } from "./app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }) as any;

function daysAgo(n: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 50), 0, 0);
  return d;
}

async function main() {
  // ── 1. Spread fee deposits across the last 6 months + this week ──────────
  const masters = await prisma.studentFeesMaster.findMany({
    where: { isActive: true },
    select: { id: true },
    take: 40,
  });
  if (!masters.length) throw new Error("no fee masters found — is this the demo schema?");

  // (offsetDays, amount) — a rising curve over 6 months, activity this week,
  // and two payments today so "Today's payments" + "Last payment" show life.
  const plan: [number, number][] = [
    [160, 250], [155, 300], [150, 200],                     // ~5 months ago
    [125, 350], [120, 300], [118, 250],                     // ~4 months ago
    [95, 400], [90, 350], [88, 300], [85, 250],             // ~3 months ago
    [65, 450], [60, 400], [58, 350], [55, 300],             // ~2 months ago
    [35, 500], [30, 450], [28, 400], [25, 350], [22, 300],  // last month
    [6, 450], [4, 380], [3, 300], [2, 420],                 // this week
    [0, 450], [0, 250],                                     // today
  ];

  let i = 0;
  for (const [offset, amount] of plan) {
    const master = masters[i % masters.length];
    const when = daysAgo(offset, 9 + (i % 6));
    await prisma.feeDeposit.create({
      data: {
        studentFeesMasterId: master.id,
        amountDetail: { "1": { amount, discount: 0, fine: 0, date: when.toISOString().slice(0, 10), payment_mode: i % 3 === 0 ? "MOBILE_MONEY" : "CASH", description: "Demo activity", inv_no: 100 + i } },
        isActive: true,
        createdAt: when,
      },
    });
    i++;
  }
  console.log(`✓ ${plan.length} deposits spread across 6 months (incl. 2 today)`);

  // ── 2. Mark attendance for the last 10 weekdays ───────────────────────────
  const presentType = await prisma.attendanceType.findUnique({ where: { keyValue: "P" } });
  const absentType  = await prisma.attendanceType.findUnique({ where: { keyValue: "A" } });
  const session = await prisma.academicSession.findFirst({ orderBy: [{ isActive: "desc" }, { startDate: "desc" }] });
  const enrollments = await prisma.studentSession.findMany({
    where: { sessionId: session.id, isActive: true },
    select: { id: true, studentId: true, classSectionId: true },
  });
  if (!presentType || !enrollments.length) throw new Error("missing attendance types or enrollments");

  const byCs: Record<string, any[]> = {};
  for (const e of enrollments) (byCs[e.classSectionId] ??= []).push(e);

  let dayCount = 0;
  for (let off = 15; off >= 0 && dayCount < 11; off--) {
    const d = daysAgo(off, 0);
    d.setHours(0, 0, 0, 0);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // school days only
    dayCount++;
    for (const [csId, list] of Object.entries(byCs)) {
      const day = await prisma.attendanceDay.upsert({
        where: { date_classSectionId: { date: d, classSectionId: csId } },
        create: { date: d, classSectionId: csId, sessionId: session.id },
        update: {},
      });
      for (let k = 0; k < list.length; k++) {
        const e = list[k];
        // ~92% present, deterministic per student/day so re-runs are stable
        const absent = (k + dayCount) % 12 === 0;
        await prisma.studentAttendance.upsert({
          where: { studentSessionId_attendanceDayId: { studentSessionId: e.id, attendanceDayId: day.id } },
          create: {
            studentId: e.studentId, studentSessionId: e.id, attendanceDayId: day.id,
            attendanceTypeId: absent && absentType ? absentType.id : presentType.id,
          },
          update: {},
        });
      }
    }
  }
  console.log(`✓ attendance marked for ${dayCount} school days across ${Object.keys(byCs).length} class sections`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
