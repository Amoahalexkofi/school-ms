import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exam = await ((await getDb()) as any).onlineExam.findUnique({
    where: { id },
    include: {
      class: { select: { id: true, name: true } },
      questions: {
        include: {
          question: {
            include: { subject: { select: { id: true, name: true } } },
          },
        },
        orderBy: { order: "asc" },
      },
      attempts: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
          answers: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(exam);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const exam = await ((await getDb()) as any).onlineExam.update({ where: { id }, data: body });
    return NextResponse.json(exam);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await ((await getDb()) as any).onlineExam.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
