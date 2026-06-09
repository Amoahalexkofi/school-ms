import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { topic, description, status, sessionId } = await req.json();
    const data: any = {};
    if (topic       !== undefined) data.topic       = topic?.trim() || null;
    if (description !== undefined) data.description = description   || null;
    if (status      !== undefined) data.status      = status;
    if (sessionId   !== undefined) data.sessionId   = sessionId     || null;
    const s = await ((await getDb()) as any).syllabus.update({ where: { id }, data });
    return NextResponse.json(s);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).syllabus.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
