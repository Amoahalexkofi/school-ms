import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await (prisma as any).examGroup.findUnique({
    where: { id },
    include: {
      schedules: {
        include: {
          subject:      { select: { name: true, code: true } },
          session:      { select: { session: true } },
          classSection: { include: { class: true, section: true } },
          _count:       { select: { markEntries: true } },
        },
        orderBy: { dateOfExam: "asc" },
      },
    },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(group);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const group = await (prisma as any).examGroup.update({ where: { id }, data: body });
  return NextResponse.json(group);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).markEntry.count({ where: { examSchedule: { examGroupId: id } } });
  if (count > 0) return NextResponse.json({ error: `Has ${count} mark entries — unpublish and delete schedules first` }, { status: 409 });
  await (prisma as any).examGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
