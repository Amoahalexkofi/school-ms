import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Homework_model::add() update path + delete
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { title, description, dueDate, homeworkDate, marks, evaluationDate, evaluatedBy, attachment, isActive } = await req.json();
    const data: any = {};
    if (title           !== undefined) data.title          = title?.trim()        || null;
    if (description     !== undefined) data.description    = description           || null;
    if (dueDate         !== undefined) data.dueDate        = new Date(dueDate);
    if (homeworkDate    !== undefined) data.homeworkDate   = homeworkDate ? new Date(homeworkDate) : null;
    if (marks           !== undefined) data.marks          = marks !== null ? parseFloat(marks) : null;
    if (evaluationDate  !== undefined) data.evaluationDate = evaluationDate ? new Date(evaluationDate) : null;
    if (evaluatedBy     !== undefined) data.evaluatedBy    = evaluatedBy  || null;
    if (attachment      !== undefined) data.attachment     = attachment   || null;
    if (isActive        !== undefined) data.isActive       = Boolean(isActive);
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 422 });
    const hw = await ((await getDb()) as any).homework.update({ where: { id }, data });
    return NextResponse.json(hw);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).homework.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
