import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const [income, expense] = await Promise.all([
    ((await getDb()) as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    ((await getDb()) as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ income, expense });
}

export async function POST(req: NextRequest) {
  try {
    const { name, type, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const model = type === "INCOME" ? ((await getDb()) as any).incomeHead : ((await getDb()) as any).expenseHead;
    const head = await model.create({ data: { name: name.trim(), description } });
    return NextResponse.json(head, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Head already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create head" }, { status: 500 });
  }
}
