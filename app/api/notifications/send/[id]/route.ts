import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).sendNotification.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
