import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).roomType.findMany({ orderBy: { name: "asc" } }));
}
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    return NextResponse.json(await ((await getDb()) as any).roomType.create({ data: { name: name.trim() } }), { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
