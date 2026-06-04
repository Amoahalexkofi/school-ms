import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const exams = await (prisma as any).onlineExam.findMany({
    include: {
      class: { select: { id: true, name: true } },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: { startTime: "desc" },
  });
  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const exam = await (prisma as any).onlineExam.create({ data: body });
    return NextResponse.json(exam, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
