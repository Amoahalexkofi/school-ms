import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generateTempPassword } from "@/lib/auth/passwords";
import bcrypt from "bcryptjs";

// Link a parent login to a student. Find-or-create a PARENT user by email and
// add the student to its `childs` (CSV). This is what makes the parent portal
// work for real schools (previously only the demo seeder set `childs`).
export async function POST(req: NextRequest) {
  try {
    const { studentId, email } = await req.json();
    if (!studentId || !email?.trim()) return NextResponse.json({ error: "studentId and parent email are required" }, { status: 422 });
    const db = await getDb();

    const student = await (db as any).student.findUnique({ where: { id: studentId }, select: { id: true } });
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const cleanEmail = email.trim().toLowerCase();
    let parent = await (db as any).user.findUnique({ where: { email: cleanEmail } });
    let tempPassword: string | null = null;

    if (parent) {
      if (parent.role !== "PARENT")
        return NextResponse.json({ error: "That email already belongs to a non-parent account" }, { status: 409 });
      const childs = (parent.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
      if (!childs.includes(studentId)) childs.push(studentId);
      parent = await (db as any).user.update({ where: { id: parent.id }, data: { childs: childs.join(",") } });
    } else {
      tempPassword = generateTempPassword();
      const password = await bcrypt.hash(tempPassword, 12);
      const username = `par_${cleanEmail.split("@")[0]}_${Math.random().toString(36).slice(2, 6)}`;
      parent = await (db as any).user.create({
        data: { email: cleanEmail, username, password, role: "PARENT", childs: studentId },
      });
    }

    return NextResponse.json({ ok: true, email: cleanEmail, tempPassword });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Unlink: remove the student from the parent's childs (and delete the parent
// account if it has no children left).
export async function DELETE(req: NextRequest) {
  try {
    const { studentId, parentEmail } = await req.json();
    if (!studentId || !parentEmail) return NextResponse.json({ error: "studentId and parentEmail required" }, { status: 422 });
    const db = await getDb();
    const parent = await (db as any).user.findUnique({ where: { email: parentEmail.toLowerCase() } });
    if (!parent) return NextResponse.json({ ok: true });

    const childs = (parent.childs ?? "").split(",").map((s: string) => s.trim()).filter((s: string) => s && s !== studentId);
    if (childs.length === 0) {
      await (db as any).user.delete({ where: { id: parent.id } }).catch(() => null);
    } else {
      await (db as any).user.update({ where: { id: parent.id }, data: { childs: childs.join(",") } });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
