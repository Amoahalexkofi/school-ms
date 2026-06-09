import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const types = await ((await getDb()) as any).holidayType.findMany({
    where: { isActive: true },
    include: { _count: { select: { holidays: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  try {
    const { name, isDefault } = await req.json();
    const t = await ((await getDb()) as any).holidayType.create({ data: { name: name?.trim(), isDefault: Boolean(isDefault) } });
    return NextResponse.json(t, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Type already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
