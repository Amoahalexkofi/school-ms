import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await ((await getDb()) as any).question.findUnique({
    where: { id },
    include: { subject: true, class: true },
  });
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(question);
}

const Q_ALLOWED = [
  "staffId","subjectId","classId","sectionId","questionType","level",
  "question","optionA","optionB","optionC","optionD","optionE",
  "correctAnswer","wordLimit","image","isActive",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: any = {};
    for (const key of Q_ALLOWED) {
      if (key in body) {
        if (key === "wordLimit" && body[key] !== undefined) data[key] = body[key] ? parseInt(body[key]) : null;
        else data[key] = body[key] ?? null;
      }
    }
    const q = await ((await getDb()) as any).question.update({ where: { id }, data });
    return NextResponse.json(q);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).question.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
