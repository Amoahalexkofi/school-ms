import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alumni = await ((await getDb()) as any).alumni.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          sessions: {
            include: {
              session: true,
              classSection: { include: { class: true, section: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });
  if (!alumni) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(alumni);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const alumni = await ((await getDb()) as any).alumni.update({ where: { id }, data: body });
    return NextResponse.json(alumni);
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const a = await ((await getDb()) as any).alumni.findUnique({ where: { id } });
    if (a) {
      await ((await getDb()) as any).student.update({ where: { id: a.studentId }, data: { isAlumni: false } });
      await ((await getDb()) as any).alumni.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
