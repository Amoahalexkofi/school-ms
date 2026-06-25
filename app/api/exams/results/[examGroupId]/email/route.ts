import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// Email the report card to each student's guardian (Smart School emails results
// on publish). Builds a simple HTML report card per student and sends it.
export async function POST(req: NextRequest, { params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;
  try {
    const { classSectionId } = await req.json();
    const db = await getDb();

    const group = await (db as any).examGroup.findUnique({ where: { id: examGroupId }, select: { name: true } });
    const profile = await (db as any).schoolProfile.findFirst({ select: { name: true } });
    const schoolName = profile?.name ?? "School";

    const schedules = await (db as any).examSchedule.findMany({
      where: { examGroupId, isActive: true, ...(classSectionId ? { classSectionId } : {}) },
      include: {
        subject: { select: { name: true } },
        markEntries: { include: { student: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });

    // Pivot studentId → rows
    const map: Record<string, any> = {};
    for (const sch of schedules) {
      for (const m of sch.markEntries) {
        if (!map[m.studentId]) map[m.studentId] = { student: m.student, rows: [] };
        map[m.studentId].rows.push({
          subject: sch.subject.name, full: sch.fullMarks,
          marks: m.attendance === "A" ? null : Number(m.marksObtained ?? 0),
          grade: m.grade, passing: m.isPassing,
        });
      }
    }
    const studentIds = Object.keys(map);
    if (!studentIds.length) return NextResponse.json({ sent: 0, error: "No results to email" });

    const students = await (db as any).student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, guardianEmail: true, fatherEmail: true, motherEmail: true, email: true },
    });
    const emailById = new Map<string, string>(
      students.map((s: any) => [s.id, (s.guardianEmail || s.fatherEmail || s.motherEmail || s.email || "") as string])
    );

    let sent = 0;
    for (const sid of studentIds) {
      const to = emailById.get(sid);
      if (!to) continue;
      const r = map[sid];
      const totalFull = r.rows.reduce((s: number, x: any) => s + x.full, 0);
      const totalObt  = r.rows.reduce((s: number, x: any) => s + (x.marks ?? 0), 0);
      const pct = totalFull ? Math.round((totalObt / totalFull) * 100) : 0;
      const passed = r.rows.every((x: any) => x.marks !== null && x.passing);

      const rowsHtml = r.rows.map((x: any) =>
        `<tr><td style="padding:6px;border:1px solid #ddd">${x.subject}</td><td style="padding:6px;border:1px solid #ddd;text-align:center">${x.marks ?? "ABS"}/${x.full}</td><td style="padding:6px;border:1px solid #ddd;text-align:center">${x.grade ?? "—"}</td></tr>`
      ).join("");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
          <div style="background:#1d4ed8;color:#fff;padding:16px;text-align:center;border-radius:8px 8px 0 0">
            <h2 style="margin:0">${schoolName}</h2>
            <p style="margin:4px 0 0">Report Card — ${group?.name ?? ""}</p>
          </div>
          <div style="border:1px solid #ddd;border-top:0;padding:16px;border-radius:0 0 8px 8px">
            <p><strong>${r.student.firstName} ${r.student.lastName}</strong></p>
            <table style="border-collapse:collapse;width:100%;font-size:14px">
              <tr style="background:#f3f4f6"><th style="padding:6px;border:1px solid #ddd;text-align:left">Subject</th><th style="padding:6px;border:1px solid #ddd">Marks</th><th style="padding:6px;border:1px solid #ddd">Grade</th></tr>
              ${rowsHtml}
              <tr style="font-weight:bold;background:#f9fafb"><td style="padding:6px;border:1px solid #ddd">TOTAL</td><td style="padding:6px;border:1px solid #ddd;text-align:center">${totalObt}/${totalFull}</td><td style="padding:6px;border:1px solid #ddd;text-align:center">${pct}%</td></tr>
            </table>
            <p style="margin-top:12px">Overall result: <strong style="color:${passed ? "#16a34a" : "#dc2626"}">${passed ? "PASSED" : "FAILED"}</strong></p>
            <p style="color:#888;font-size:12px">This is an automated report card from ${schoolName}.</p>
          </div>
        </div>`;

      await sendEmail(db, { to, subject: `Report Card — ${r.student.firstName} ${r.student.lastName} (${group?.name ?? ""})`, html })
        .then(() => sent++).catch(() => null);
    }

    return NextResponse.json({ sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
