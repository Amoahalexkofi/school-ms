import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { title, timelineDate, description, document, status } = await req.json();
    const data: any = {};
    if (title        !== undefined) data.title        = title.trim();
    if (timelineDate !== undefined) data.timelineDate = new Date(timelineDate);
    if (description  !== undefined) data.description  = description?.trim() || "";
    if (document     !== undefined) data.document     = document || null;
    if (status       !== undefined) data.status       = status;
    const db = await getDb();
    const entry = await (db as any).staffTimeline.update({ where: { id }, data });
    return NextResponse.json(entry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  await (db as any).staffTimeline.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
