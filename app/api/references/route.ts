import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).reference.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }));
}
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const r = await ((await getDb()) as any).reference.create({ data: { name: name?.trim() } });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Reference already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
