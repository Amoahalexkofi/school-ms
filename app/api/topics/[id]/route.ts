import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// PATCH /api/topics/[id]  { name?, status?, completeDate? }
// Smart School: changeTopicStatus / topic_completedate — toggle complete/incomplete + complete date.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, status, completeDate } = await req.json();
    const data: any = {};

    if (name !== undefined) {
      if (!name?.trim()) return NextResponse.json({ error: "Topic name is required" }, { status: 422 });
      data.name = name.trim();
    }

    if (status !== undefined) {
      data.status = !!status;
      if (status) {
        // Marking complete: set the completion date (provided or today).
        data.completeDate = completeDate ? new Date(completeDate) : new Date();
      } else {
        // Marking incomplete: clear the completion date.
        data.completeDate = null;
      }
    } else if (completeDate !== undefined) {
      data.completeDate = completeDate ? new Date(completeDate) : null;
    }

    const db = await getDb();
    const topic = await (db as any).topic.update({ where: { id }, data });
    return NextResponse.json(topic);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/topics/[id]
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = await getDb();
    await (db as any).topic.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
