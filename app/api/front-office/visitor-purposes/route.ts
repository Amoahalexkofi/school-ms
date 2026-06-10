import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Visitors_purpose_model
export async function GET() {
  const purposes = await ((await getDb()) as any).visitorPurpose.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(purposes);
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const p = await ((await getDb()) as any).visitorPurpose.create({ data: { name: name.trim() } });
    return NextResponse.json(p, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Purpose already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
