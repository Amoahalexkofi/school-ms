import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await ((await getDb()) as any).feeGroup.findUnique({
    where: { id },
    include: {
      sessionGroups: {
        include: {
          session: true,
          items: {
            include: { feeType: { select: { name: true, code: true } } },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { studentFeesMasters: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(group);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, nature, description, isActive } = await req.json();
  const data: any = {};
  if (name        !== undefined) data.name        = name?.trim() || null;
  if (nature      !== undefined) data.nature      = nature      || null;
  if (description !== undefined) data.description = description || null;
  if (isActive    !== undefined) data.isActive    = Boolean(isActive);
  const group = await ((await getDb()) as any).feeGroup.update({ where: { id }, data });
  return NextResponse.json(group);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).feeSessionGroup.count({ where: { feeGroupId: id } });
  if (count > 0) return NextResponse.json({ error: `Has ${count} session group(s) — remove them first` }, { status: 409 });
  await ((await getDb()) as any).feeGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
