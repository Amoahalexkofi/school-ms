import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const examType = req.nextUrl.searchParams.get("examType");
  const where: any = { isActive: true };
  if (examType) where.examType = examType;
  const grades = await ((await getDb()) as any).grade.findMany({
    where,
    orderBy: { percentFrom: "desc" },
  });
  return NextResponse.json(grades);
}

export async function POST(req: NextRequest) {
  try {
    const { examType, gradeName, percentFrom, percentTo, gradePoint, description } = await req.json();
    if (!gradeName?.trim()) return NextResponse.json({ error: "gradeName required" }, { status: 422 });

    const grade = await ((await getDb()) as any).grade.create({
      data: {
        examType:    examType    || null,
        gradeName:   gradeName.trim(),
        percentFrom: parseFloat(percentFrom),
        percentTo:   parseFloat(percentTo),
        gradePoint:  gradePoint  ? parseFloat(gradePoint)  : null,
        description: description || null,
      },
    });
    return NextResponse.json(grade, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
