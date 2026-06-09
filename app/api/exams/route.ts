import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const groups = await ((await getDb()) as any).examGroup.findMany({
    include: { _count: { select: { schedules: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  try {
    const { name, examType, description, passingPercentage } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const group = await ((await getDb()) as any).examGroup.create({
      data: {
        name: name.trim(),
        examType: examType || null,
        description: description || null,
        passingPercentage: passingPercentage ? parseFloat(passingPercentage) : 33,
      },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
