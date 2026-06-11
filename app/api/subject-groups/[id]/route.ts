import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const group = await (db as any).subjectGroup.findUnique({
    where: { id },
    include: {
      subjects: { include: { subject: { select: { id: true, name: true, code: true, type: true } } } },
      sections: { include: { classSection: { include: { class: { select: { id: true, name: true } }, section: { select: { id: true, name: true } } } } } },
    },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(group);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, description, isActive, addSubjectIds, removeSubjectIds, addClassSectionIds, removeClassSectionIds } = await req.json();
    const db = await getDb();

    const data: any = {};
    if (name        !== undefined) data.name        = name?.trim() || null;
    if (description !== undefined) data.description = description || null;
    if (isActive    !== undefined) data.isActive    = Boolean(isActive);

    if (Object.keys(data).length > 0) {
      await (db as any).subjectGroup.update({ where: { id }, data });
    }

    if (removeSubjectIds?.length) {
      await (db as any).subjectGroupSubject.deleteMany({
        where: { subjectGroupId: id, subjectId: { in: removeSubjectIds } },
      });
    }
    if (addSubjectIds?.length) {
      await (db as any).subjectGroupSubject.createMany({
        data: (addSubjectIds as string[]).map((subjectId: string) => ({ subjectGroupId: id, subjectId })),
        skipDuplicates: true,
      });
    }
    if (removeClassSectionIds?.length) {
      await (db as any).subjectGroupSection.deleteMany({
        where: { subjectGroupId: id, classSectionId: { in: removeClassSectionIds } },
      });
    }
    if (addClassSectionIds?.length) {
      await (db as any).subjectGroupSection.createMany({
        data: (addClassSectionIds as string[]).map((classSectionId: string) => ({ subjectGroupId: id, classSectionId })),
        skipDuplicates: true,
      });
    }

    const updated = await (db as any).subjectGroup.findUnique({
      where: { id },
      include: {
        subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
        sections: { include: { classSection: { include: { class: { select: { id: true, name: true } }, section: { select: { id: true, name: true } } } } } },
      },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Section already in another group" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    await (db as any).subjectGroup.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
