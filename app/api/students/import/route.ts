import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateAdmissionNumber } from "@/lib/domain/students";
import { getActiveBranchId } from "@/lib/branch";
import { resolveBranchForCreate } from "@/lib/services/branches";
import { generateTempPassword } from "@/lib/auth/passwords";
import bcrypt from "bcryptjs";

// Bulk student import (mirrors Smart School Student::import). Accepts parsed CSV
// rows + a target session/classSection; creates a user + student + enrollment
// per row. Returns per-row results so the admin sees which rows failed and the
// temp passwords generated.
export async function POST(req: NextRequest) {
  try {
    const { sessionId, classSectionId, rows } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0)
      return NextResponse.json({ error: "No rows to import" }, { status: 422 });
    if (rows.length > 500)
      return NextResponse.json({ error: "Import is limited to 500 rows at a time" }, { status: 422 });

    const db = await getDb();
    const branchId = await resolveBranchForCreate(await getActiveBranchId());
    const year = new Date().getFullYear();
    let count = await (db as any).student.count();

    const results: { row: number; ok: boolean; name?: string; admissionNo?: string; tempPassword?: string; error?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i] ?? {};
      const firstName = (r.first_name ?? r.firstName ?? "").trim();
      const lastName  = (r.last_name ?? r.lastName ?? "").trim();
      const gender    = (r.gender ?? "").trim();
      const dob       = (r.date_of_birth ?? r.dob ?? "").trim();

      if (!firstName || !lastName || !gender) {
        results.push({ row: i + 1, ok: false, error: "first_name, last_name and gender are required" });
        continue;
      }

      try {
        count += 1;
        const admissionNo = (r.admission_no ?? r.admissionNo ?? "").trim()
          || generateAdmissionNumber({ sessionYear: year, sequenceNumber: count });
        const email    = (r.email ?? "").trim() || `${admissionNo.toLowerCase().replace(/\//g, ".")}@school.local`;
        const username = `stu_${admissionNo.toLowerCase().replace(/\//g, "_")}`;
        const tempPassword = generateTempPassword();
        const password = await bcrypt.hash(tempPassword, 12);

        await (db as any).$transaction(async (tx: any) => {
          const user = await tx.user.create({ data: { email, username, password, role: "STUDENT" } });
          const s = await tx.student.create({
            data: {
              userId: user.id,
              admissionNo,
              firstName, middleName: (r.middle_name ?? "").trim() || null, lastName,
              admissionDate: new Date(),
              dateOfBirth: dob ? new Date(dob) : null,
              gender,
              mobileNo:      (r.mobile ?? r.mobileNo ?? "").trim() || null,
              guardianName:  (r.guardian_name ?? "").trim() || null,
              guardianPhone: (r.guardian_phone ?? "").trim() || null,
              fatherName:    (r.father_name ?? "").trim() || null,
              motherName:    (r.mother_name ?? "").trim() || null,
              branchId,
            },
          });
          if (sessionId && classSectionId) {
            await tx.studentSession.create({
              data: { studentId: s.id, sessionId, classSectionId, rollNo: (r.roll_no ?? "").trim() || null, defaultLogin: true },
            });
          }
        });

        results.push({ row: i + 1, ok: true, name: `${firstName} ${lastName}`, admissionNo, tempPassword });
      } catch (err: any) {
        results.push({ row: i + 1, ok: false, error: err.message ?? "Failed" });
      }
    }

    const created = results.filter((r) => r.ok).length;
    return NextResponse.json({ created, failed: results.length - created, results }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Import failed" }, { status: 500 });
  }
}
