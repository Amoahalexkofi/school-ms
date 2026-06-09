import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const divisions = await ((await getDb()) as any).markDivision.findMany({
    where: { isActive: true },
    orderBy: { percentageFrom: "asc" },
  });
  return NextResponse.json(divisions);
}

export async function POST(req: NextRequest) {
  try {
    const { name, percentageFrom, percentageTo } = await req.json();
    if (!name?.trim() || percentageFrom === undefined || percentageTo === undefined) {
      return NextResponse.json({ error: "name, percentageFrom, percentageTo required" }, { status: 422 });
    }
    const d = await ((await getDb()) as any).markDivision.create({
      data: {
        name:           name.trim(),
        percentageFrom: parseFloat(percentageFrom),
        percentageTo:   parseFloat(percentageTo),
      },
    });
    return NextResponse.json(d, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
