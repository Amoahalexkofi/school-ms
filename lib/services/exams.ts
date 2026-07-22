import { sendEmail, bulkMessageEmail } from "@/lib/email";
import { sendSms } from "@/lib/services/sms";
import { sendWhatsApp } from "@/lib/services/whatsapp";

// Exam roster (Smart School exam_group_class_batch_exam_students): when any
// ExamGroupStudent rows exist for this (examGroup, classSection), only those
// students sit the exam; no rows → the whole class (default behavior).
export async function filterToExamRoster<T extends { student: { id: string } }>(
  db: any, examGroupId: string, classSectionId: string | null, enrollments: T[]
): Promise<T[]> {
  if (!classSectionId) return enrollments;
  const roster = await db.examGroupStudent
    .findMany({ where: { examGroupId, classSectionId }, select: { studentId: true } })
    .catch(() => []);
  if (!roster.length) return enrollments;
  const ids = new Set(roster.map((r: any) => r.studentId));
  return enrollments.filter(e => ids.has(e.student.id));
}

// Result announcement on publish (Smart School fires mailsms('exam_result')
// when an exam is saved with is_publish on). The message announces that
// results are available — it does not embed marks.
export async function announceExamResults(db: any, examGroupId: string) {
  const group = await db.examGroup.findUnique({
    where: { id: examGroupId },
    include: { schedules: { select: { classSectionId: true, sessionId: true } } },
  });
  if (!group) return { notified: 0 };

  const pairs = new Map<string, { classSectionId: string; sessionId: string }>();
  for (const s of group.schedules) {
    if (s.classSectionId && s.sessionId)
      pairs.set(`${s.classSectionId}:${s.sessionId}`, { classSectionId: s.classSectionId, sessionId: s.sessionId });
  }
  if (pairs.size === 0) return { notified: 0 };

  const enrollments = await db.studentSession.findMany({
    where: { OR: Array.from(pairs.values()), isActive: true },
    include: {
      student: {
        select: {
          id: true, firstName: true, lastName: true, email: true, mobileNo: true,
          guardianEmail: true, fatherEmail: true, motherEmail: true,
          guardianPhone: true, fatherPhone: true, motherPhone: true,
          isActive: true,
        },
      },
    },
  });

  const profile = await db.schoolProfile.findFirst({ select: { name: true } }).catch(() => null);
  const schoolName = profile?.name ?? "School";
  const subject = `${group.name} results published`;

  const seen = new Set<string>();
  let notified = 0;
  for (const e of enrollments) {
    const s = e.student;
    if (!s || !s.isActive || seen.has(s.id)) continue;
    seen.add(s.id);

    const message = `${schoolName}: Results for ${group.name} have been published for ${s.firstName} ${s.lastName ?? ""}. Log in to view the report.`;

    const emails = [s.email, s.guardianEmail || s.fatherEmail || s.motherEmail].filter(Boolean) as string[];
    const phones = [s.mobileNo, s.guardianPhone || s.fatherPhone || s.motherPhone].filter(Boolean) as string[];

    const who = `${s.firstName} ${s.lastName ?? ""}`.trim();
    if (emails.length) {
      sendEmail(db, {
        to: emails,
        subject,
        html: bulkMessageEmail({
          recipientName: who,
          message, schoolName, subject,
        }),
      })
        .then((r) => { if (!r.ok) console.error("[exams] result email failed for", who, r.error); })
        .catch((err) => console.error("[exams] result email threw for", who, err));
    }
    if (phones.length) {
      sendSms(phones, message, db)
        .then((r) => { if (!r.success) console.error("[exams] result SMS failed for", who, r.error); })
        .catch((err) => console.error("[exams] result SMS threw for", who, err));
      sendWhatsApp(phones, message, db)
        .then((r) => { if (!r.success) console.error("[exams] result WhatsApp failed for", who, r.error); })
        .catch((err) => console.error("[exams] result WhatsApp threw for", who, err));
    }
    if (emails.length || phones.length) notified++;
  }
  return { notified };
}
