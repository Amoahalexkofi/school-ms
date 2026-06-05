import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).complaintType.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const type = await ((await getDb()) as any).complaintType.create({ data: { name: name.trim() } });
    return NextResponse.json(type, { status: 201 });
  } catch (e: any) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
