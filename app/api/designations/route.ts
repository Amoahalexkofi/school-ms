import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const designations = await ((await getDb()) as any).designation.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(designations);
}

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 422 });
    const desig = await ((await getDb()) as any).designation.create({ data: { name: name.trim() } });
    return NextResponse.json(desig, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Designation already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
