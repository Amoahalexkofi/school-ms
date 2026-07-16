import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const db = await getDb();
    if (body.setCurrent) {
      const term = await (db as any).term.findUnique({ where: { id }, select: { sessionId: true } });
      if (term) {
        await (db as any).term.updateMany({ where: { sessionId: term.sessionId }, data: { isCurrent: false } });
      }
    }
    const data: any = {};
    for (const k of ["name", "termNumber", "isCurrent"]) if (k in body) data[k] = k === "termNumber" ? Number(body[k]) : body[k];
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    if (body.setCurrent) data.isCurrent = true;
    const updated = await (db as any).term.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update term" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    await (db as any).term.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete term" }, { status: 500 });
  }
}
