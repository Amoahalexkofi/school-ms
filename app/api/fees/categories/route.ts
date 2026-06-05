import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const cats = await ((await getDb()) as any).feeCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { feeTypes: true } } },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const cat = await ((await getDb()) as any).feeCategory.create({ data: { name: name.trim(), description: description || null } });
    return NextResponse.json(cat, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
