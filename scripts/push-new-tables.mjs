// Creates only the new tables added this session via Neon's HTTP driver
// Run: node scripts/push-new-tables.mjs

import { neon } from "@neondatabase/serverless";

const sql = neon(
  "postgresql://neondb_owner:npg_HvzCTw4m6FDd@ep-mute-bonus-aprnasgs.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
);

const statements = [
  // AdmitCardTemplate
  `CREATE TABLE IF NOT EXISTS "AdmitCardTemplate" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "template" TEXT,
    "heading" TEXT,
    "title" TEXT,
    "leftLogo" TEXT,
    "rightLogo" TEXT,
    "examName" TEXT,
    "schoolName" TEXT,
    "examCenter" TEXT,
    "sign" TEXT,
    "backgroundImg" TEXT,
    "isName" BOOLEAN NOT NULL DEFAULT true,
    "isFatherName" BOOLEAN NOT NULL DEFAULT true,
    "isMotherName" BOOLEAN NOT NULL DEFAULT true,
    "isDob" BOOLEAN NOT NULL DEFAULT true,
    "isAdmissionNo" BOOLEAN NOT NULL DEFAULT true,
    "isRollNo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdmitCardTemplate_pkey" PRIMARY KEY ("id")
  )`,

  // Certificate
  `CREATE TABLE IF NOT EXISTS "Certificate" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "certificateName" TEXT NOT NULL,
    "certificateText" TEXT NOT NULL,
    "leftHeader" TEXT NOT NULL DEFAULT '',
    "centerHeader" TEXT NOT NULL DEFAULT '',
    "rightHeader" TEXT NOT NULL DEFAULT '',
    "leftFooter" TEXT NOT NULL DEFAULT '',
    "rightFooter" TEXT NOT NULL DEFAULT '',
    "centerFooter" TEXT NOT NULL DEFAULT '',
    "backgroundImage" TEXT,
    "createdFor" INTEGER NOT NULL DEFAULT 2,
    "status" INTEGER NOT NULL DEFAULT 1,
    "headerHeight" INTEGER NOT NULL DEFAULT 0,
    "contentHeight" INTEGER NOT NULL DEFAULT 0,
    "footerHeight" INTEGER NOT NULL DEFAULT 0,
    "contentWidth" INTEGER NOT NULL DEFAULT 0,
    "enableStudentImage" BOOLEAN NOT NULL DEFAULT false,
    "enableImageHeight" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
  )`,

  // TemplateMarksheet
  `CREATE TABLE IF NOT EXISTS "TemplateMarksheet" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "headerImage" TEXT,
    "template" TEXT,
    "heading" TEXT,
    "title" TEXT,
    "leftLogo" TEXT,
    "rightLogo" TEXT,
    "examName" TEXT,
    "schoolName" TEXT,
    "examCenter" TEXT,
    "leftSign" TEXT,
    "middleSign" TEXT,
    "rightSign" TEXT,
    "examSession" INTEGER NOT NULL DEFAULT 1,
    "isName" BOOLEAN NOT NULL DEFAULT true,
    "isFatherName" BOOLEAN NOT NULL DEFAULT true,
    "isMotherName" BOOLEAN NOT NULL DEFAULT true,
    "isDob" BOOLEAN NOT NULL DEFAULT true,
    "isAdmissionNo" BOOLEAN NOT NULL DEFAULT true,
    "isRollNo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TemplateMarksheet_pkey" PRIMARY KEY ("id")
  )`,

  // StaffIdCard
  `CREATE TABLE IF NOT EXISTS "StaffIdCard" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "schoolAddress" TEXT NOT NULL DEFAULT '',
    "background" TEXT,
    "logo" TEXT,
    "signImage" TEXT,
    "headerColor" TEXT,
    "enableVerticalCard" BOOLEAN NOT NULL DEFAULT false,
    "enableStaffRole" BOOLEAN NOT NULL DEFAULT true,
    "enableStaffId" BOOLEAN NOT NULL DEFAULT true,
    "enableStaffDepartment" BOOLEAN NOT NULL DEFAULT true,
    "enableDesignation" BOOLEAN NOT NULL DEFAULT true,
    "enableName" BOOLEAN NOT NULL DEFAULT true,
    "enableFathersName" BOOLEAN NOT NULL DEFAULT false,
    "enableMothersName" BOOLEAN NOT NULL DEFAULT false,
    "enableDateOfJoining" BOOLEAN NOT NULL DEFAULT true,
    "enablePermanentAddress" BOOLEAN NOT NULL DEFAULT false,
    "enableStaffDob" BOOLEAN NOT NULL DEFAULT false,
    "enableStaffPhone" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffIdCard_pkey" PRIMARY KEY ("id")
  )`,

  // StudentTimeline
  `CREATE TABLE IF NOT EXISTS "StudentTimeline" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timelineDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "document" TEXT,
    "status" TEXT NOT NULL DEFAULT 'yes',
    "createdStudentId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentTimeline_pkey" PRIMARY KEY ("id")
  )`,

  // StaffTimeline
  `CREATE TABLE IF NOT EXISTS "StaffTimeline" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "staffId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timelineDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "document" TEXT,
    "status" TEXT NOT NULL DEFAULT 'yes',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StaffTimeline_pkey" PRIMARY KEY ("id")
  )`,

  // StudentSubjectAttendance
  `CREATE TABLE IF NOT EXISTS "StudentSubjectAttendance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "studentSessionId" TEXT NOT NULL,
    "timetableSlotId" TEXT NOT NULL,
    "attendanceTypeId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentSubjectAttendance_pkey" PRIMARY KEY ("id")
  )`,

  `CREATE UNIQUE INDEX IF NOT EXISTS "StudentSubjectAttendance_studentSessionId_timetableSlotId_date_key"
    ON "StudentSubjectAttendance"("studentSessionId","timetableSlotId","date")`,

  // ShareContent
  `CREATE TABLE IF NOT EXISTS "ShareContent" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "sendTo" TEXT,
    "title" TEXT,
    "shareDate" TIMESTAMP(3),
    "validUpto" TIMESTAMP(3),
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShareContent_pkey" PRIMARY KEY ("id")
  )`,

  // ClassSectionTime
  `CREATE TABLE IF NOT EXISTS "ClassSectionTime" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "classSectionId" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassSectionTime_pkey" PRIMARY KEY ("id")
  )`,

  // Foreign keys
  `ALTER TABLE "StudentTimeline"
    ADD CONSTRAINT "StudentTimeline_studentId_fkey"
    FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "StaffTimeline"
    ADD CONSTRAINT "StaffTimeline_staffId_fkey"
    FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "StudentSubjectAttendance"
    ADD CONSTRAINT "StudentSubjectAttendance_studentSessionId_fkey"
    FOREIGN KEY ("studentSessionId") REFERENCES "StudentSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "StudentSubjectAttendance"
    ADD CONSTRAINT "StudentSubjectAttendance_timetableSlotId_fkey"
    FOREIGN KEY ("timetableSlotId") REFERENCES "TimetableSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "StudentSubjectAttendance"
    ADD CONSTRAINT "StudentSubjectAttendance_attendanceTypeId_fkey"
    FOREIGN KEY ("attendanceTypeId") REFERENCES "AttendanceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "ClassSectionTime"
    ADD CONSTRAINT "ClassSectionTime_classSectionId_fkey"
    FOREIGN KEY ("classSectionId") REFERENCES "ClassSection"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
];

let ok = 0;
let fail = 0;
for (const stmt of statements) {
  const name = stmt.trim().split("\n")[0].slice(0, 80);
  try {
    await sql.query(stmt);
    console.log("✓", name);
    ok++;
  } catch (e) {
    console.error("✗", name);
    console.error("  ", e.message);
    fail++;
  }
}

console.log(`\nDone: ${ok} succeeded, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
