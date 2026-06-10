import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Teachersubject_model: assign subjects to a teacher

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const subjects = await (db as any).teacherSubject.findMany({
    where: { staffId: id },
    include: { subject: { select: { id: true, name: true, code: true, type: true } } },
  });
  return NextResponse.json(subjects);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  try {
    const { subjectIds } = await req.json();
    if (!Array.isArray(subjectIds)) return NextResponse.json({ error: "subjectIds must be an array" }, { status: 422 });

    const db = await getDb();
    await (db as any).$transaction(async (tx: any) => {
      await tx.teacherSubject.deleteMany({ where: { staffId } });
      if (subjectIds.length > 0) {
        await tx.teacherSubject.createMany({
          data: (subjectIds as string[]).map((subjectId) => ({ staffId, subjectId })),
          skipDuplicates: true,
        });
      }
    });

    const updated = await (db as any).teacherSubject.findMany({
      where: { staffId },
      include: { subject: { select: { id: true, name: true, code: true } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  try {
    const { subjectId } = await req.json();
    if (!subjectId) return NextResponse.json({ error: "subjectId is required" }, { status: 422 });

    const db = await getDb();
    const ts = await (db as any).teacherSubject.create({
      data: { staffId, subjectId },
      include: { subject: { select: { id: true, name: true, code: true } } },
    });
    return NextResponse.json(ts, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Subject already assigned to this teacher" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: staffId } = await params;
  try {
    const { subjectId } = await req.json();
    if (!subjectId) return NextResponse.json({ error: "subjectId is required" }, { status: 422 });

    const db = await getDb();
    await (db as any).teacherSubject.deleteMany({ where: { staffId, subjectId } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
