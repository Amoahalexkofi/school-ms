import { NextRequest, NextResponse } from "next/server";
import { registry } from "@/lib/registry";

export const maxDuration = 60;

/**
 * Daily demo reset — removes ONLY entries created by demo visitors (anything
 * created after the curated baseline cutoff), leaving the seeded baseline
 * intact. Operates exclusively on the PUBLIC schema (the getskula.com demo)
 * via the registry client — it can never touch real tenant schemas.
 *
 * Secured by CRON_SECRET (Vercel cron sends `Authorization: Bearer <secret>`).
 * Baseline cutoff comes from DEMO_RESET_CUTOFF (ISO timestamp).
 */
const FALLBACK_CUTOFF = "2026-06-20T18:30:00Z"; // just after the baseline seed

// Ordered children → parents so foreign keys never block a delete.
const STEPS: [string, string][] = [
  // Visitor actions on baseline records (leaf tables)
  ["StudentSubjectAttendance", `DELETE FROM public."StudentSubjectAttendance" WHERE "createdAt" > $1::timestamptz`],
  ["StudentAttendance",        `DELETE FROM public."StudentAttendance" WHERE "createdAt" > $1::timestamptz`],
  ["MarkEntry",                `DELETE FROM public."MarkEntry" WHERE "createdAt" > $1::timestamptz`],
  ["FeeDeposit",               `DELETE FROM public."FeeDeposit" WHERE "createdAt" > $1::timestamptz`],
  ["HomeworkAcknowledgement",  `DELETE FROM public."HomeworkAcknowledgement" WHERE "createdAt" > $1::timestamptz`],
  ["BookIssue",                `DELETE FROM public."BookIssue" WHERE "issuedAt" > $1::timestamptz`],
  // Exam structures
  ["ExamSchedule",             `DELETE FROM public."ExamSchedule" WHERE "createdAt" > $1::timestamptz`],
  ["ExamGroup",                `DELETE FROM public."ExamGroup" WHERE "createdAt" > $1::timestamptz`],
  // Homework / attendance days
  ["Homework",                 `DELETE FROM public."Homework" WHERE "createdAt" > $1::timestamptz`],
  ["AttendanceDay",            `DELETE FROM public."AttendanceDay" WHERE "createdAt" > $1::timestamptz`],
  // Fee structures
  ["CumulativeFine",           `DELETE FROM public."CumulativeFine" WHERE "createdAt" > $1::timestamptz`],
  ["StudentAppliedDiscount",   `DELETE FROM public."StudentAppliedDiscount" WHERE "date" > $1::timestamptz`],
  ["StudentFeeDiscount",       `DELETE FROM public."StudentFeeDiscount" WHERE "createdAt" > $1::timestamptz`],
  ["FeeGroupItem",             `DELETE FROM public."FeeGroupItem" WHERE "createdAt" > $1::timestamptz`],
  ["StudentFeesMaster",        `DELETE FROM public."StudentFeesMaster" WHERE "createdAt" > $1::timestamptz`],
  ["FeeSessionGroup",          `DELETE FROM public."FeeSessionGroup" WHERE "createdAt" > $1::timestamptz`],
  ["FeeGroup",                 `DELETE FROM public."FeeGroup" WHERE "createdAt" > $1::timestamptz`],
  ["FeeType",                  `DELETE FROM public."FeeType" WHERE "createdAt" > $1::timestamptz`],
  ["FeeCategory",              `DELETE FROM public."FeeCategory" WHERE "createdAt" > $1::timestamptz`],
  ["FeeDiscount",              `DELETE FROM public."FeeDiscount" WHERE "createdAt" > $1::timestamptz`],
  // Library
  ["Book",                     `DELETE FROM public."Book" WHERE "createdAt" > $1::timestamptz`],
  ["LibraryMember",            `DELETE FROM public."LibraryMember" WHERE "createdAt" > $1::timestamptz`],
  // Student dependents
  ["StudentLeaveRequest",      `DELETE FROM public."StudentLeaveRequest" WHERE "createdAt" > $1::timestamptz`],
  ["StudentTimeline",          `DELETE FROM public."StudentTimeline" WHERE "createdAt" > $1::timestamptz`],
  ["Alumni",                   `DELETE FROM public."Alumni" WHERE "createdAt" > $1::timestamptz`],
  ["StudentSession",           `DELETE FROM public."StudentSession" WHERE "createdAt" > $1::timestamptz`],
  // Staff dependents (null the class-teacher FK first)
  ["ClassSection.teacher null", `UPDATE public."ClassSection" SET "teacherId" = NULL WHERE "teacherId" IN (SELECT id FROM public."Staff" WHERE "createdAt" > $1::timestamptz)`],
  ["TeacherSubject",           `DELETE FROM public."TeacherSubject" WHERE "staffId" IN (SELECT id FROM public."Staff" WHERE "createdAt" > $1::timestamptz)`],
  ["StaffAttendance",          `DELETE FROM public."StaffAttendance" WHERE "createdAt" > $1::timestamptz`],
  ["StaffLeaveRequest",        `DELETE FROM public."StaffLeaveRequest" WHERE "createdAt" > $1::timestamptz`],
  ["StaffLeaveBalance",        `DELETE FROM public."StaffLeaveBalance" WHERE "createdAt" > $1::timestamptz`],
  ["StaffTimeline",            `DELETE FROM public."StaffTimeline" WHERE "createdAt" > $1::timestamptz`],
  ["TimetableSlot",            `DELETE FROM public."TimetableSlot" WHERE "createdAt" > $1::timestamptz`],
  ["Notice",                   `DELETE FROM public."Notice" WHERE "createdAt" > $1::timestamptz`],
  ["Question",                 `DELETE FROM public."Question" WHERE "createdAt" > $1::timestamptz`],
  // People
  ["Student",                  `DELETE FROM public."Student" WHERE "createdAt" > $1::timestamptz`],
  ["Staff",                    `DELETE FROM public."Staff" WHERE "createdAt" > $1::timestamptz`],
  // Extra branches (keep the main branch)
  ["Branch",                   `DELETE FROM public."Branch" WHERE "createdAt" > $1::timestamptz AND "isMain" = false`],
  // Comms
  ["Notification",             `DELETE FROM public."Notification" WHERE "createdAt" > $1::timestamptz`],
  // Visitor user accounts (keep demo + seed accounts)
  ["User",                     `DELETE FROM public."User" WHERE "createdAt" > $1::timestamptz AND email NOT LIKE '%@getskula.com' AND email NOT LIKE '%@school.edu'`],
];

async function runReset() {
  const cutoff = process.env.DEMO_RESET_CUTOFF || FALLBACK_CUTOFF;
  const results: Record<string, number | string> = {};
  for (const [label, sql] of STEPS) {
    try {
      results[label] = await (registry as any).$executeRawUnsafe(sql, cutoff);
    } catch (e: any) {
      results[label] = `skipped: ${e?.message?.split("\n")[0] ?? "error"}`;
    }
  }
  return { cutoff, results };
}

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const out = await runReset();
  return NextResponse.json({ ok: true, ...out });
}

export const POST = GET;
