import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail, bulkMessageEmail } from "@/lib/email";
import { deleteStudentCascade } from "@/lib/services/students";

// Bulk student actions (Smart School bulkdelete / sendbulkmail).
//  action "delete": hard-delete each student that has NO active enrollment
//    (mirrors the single DELETE safety guard); enrolled students are skipped.
//  action "email": email each selected student and/or guardian.
export async function POST(req: NextRequest) {
  try {
    const { action, ids, subject, message, target } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0)
      return NextResponse.json({ error: "No students selected" }, { status: 422 });

    const db = await getDb();

    if (action === "delete") {
      let deleted = 0;
      const skipped: string[] = [];
      for (const id of ids) {
        const active = await (db as any).studentSession.count({ where: { studentId: id, isActive: true } });
        if (active > 0) { skipped.push(id); continue; }
        await deleteStudentCascade(db, id).then(() => deleted++).catch(() => skipped.push(id));
      }
      return NextResponse.json({ deleted, skipped: skipped.length });
    }

    if (action === "email") {
      if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 422 });
      const profile = await (db as any).schoolProfile.findFirst({ select: { name: true } });
      const schoolName = profile?.name ?? "School";
      const subj = subject?.trim() || `Message from ${schoolName}`;

      const students = await (db as any).student.findMany({
        where: { id: { in: ids } },
        select: { firstName: true, lastName: true, email: true, guardianEmail: true, fatherEmail: true, motherEmail: true },
      });

      let sent = 0;
      for (const s of students) {
        const recips: string[] = [];
        if (target !== "guardian" && s.email) recips.push(s.email);
        if (target !== "student") {
          const g = s.guardianEmail || s.fatherEmail || s.motherEmail;
          if (g) recips.push(g);
        }
        if (!recips.length) continue;
        await sendEmail(db, {
          to: recips,
          subject: subj,
          html: bulkMessageEmail({ recipientName: `${s.firstName} ${s.lastName}`, message: message.trim(), schoolName, subject: subj }),
        }).then(() => sent++).catch(() => null);
      }
      return NextResponse.json({ sent });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 422 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bulk action failed" }, { status: 500 });
  }
}
