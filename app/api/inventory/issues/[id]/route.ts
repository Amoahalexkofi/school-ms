import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { isReturned, returnDate, note } = await req.json();
    const data: any = {};
    if (note       !== undefined) data.note       = note       || null;
    if (returnDate !== undefined && returnDate) data.returnDate = new Date(returnDate);
    if (isReturned !== undefined) {
      data.isReturned = Boolean(isReturned);
      if (Boolean(isReturned) && !data.returnDate) data.returnDate = new Date();
    }

    const db = await getDb();
    const existing = await (db as any).itemIssue.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const issue = await (db as any).itemIssue.update({ where: { id }, data });

    // Restore item availability when returned
    if (data.isReturned === true && !existing.isReturned) {
      await (db as any).item.update({
        where: { id: existing.itemId },
        data: { available: { increment: existing.quantity } },
      });
    }
    return NextResponse.json(issue);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    const existing = await (db as any).itemIssue.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await (db as any).$transaction([
      (db as any).itemIssue.delete({ where: { id } }),
      // Restore availability if not already returned
      ...(existing.isReturned ? [] : [(db as any).item.update({
        where: { id: existing.itemId },
        data: { available: { increment: existing.quantity } },
      })]),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
