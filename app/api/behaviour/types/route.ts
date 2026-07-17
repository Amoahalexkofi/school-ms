import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";

export async function GET() {
  const db = await getDb();
  const types = await (db as any).incidentType.findMany({
    where: { isActive: true },
    orderBy: [{ points: "asc" }, { title: "asc" }],
    include: { _count: { select: { incidents: true } } },
  });
  return NextResponse.json(types);
}

export async function POST(req: NextRequest) {
  try {
    const { title, points, description, seed } = await req.json();
    const db = await getDb();

    // One-click starter set for fresh schools — Ghanaian-school shaped.
    if (seed) {
      const defaults = [
        { title: "Lateness", points: -2 },
        { title: "Homework not done", points: -3 },
        { title: "Classroom disruption", points: -5 },
        { title: "Fighting", points: -10 },
        { title: "Bullying", points: -10 },
        { title: "Damage to school property", points: -8 },
        { title: "Helpfulness", points: 5 },
        { title: "Academic excellence", points: 5 },
        { title: "Leadership", points: 5 },
        { title: "Punctuality streak", points: 3 },
      ];
      const existing = await (db as any).incidentType.count();
      if (existing > 0) return NextResponse.json({ error: "Types already exist" }, { status: 409 });
      await (db as any).incidentType.createMany({ data: defaults });
      await audit("behaviour.seed_types", "IncidentType");
      return NextResponse.json({ ok: true, created: defaults.length }, { status: 201 });
    }

    if (!title?.trim() || points === undefined || points === null || isNaN(Number(points))) {
      return NextResponse.json({ error: "Title and points are required" }, { status: 422 });
    }
    const type = await (db as any).incidentType.create({
      data: { title: title.trim(), points: Number(points), description: description || null },
    });
    await audit("behaviour.create_type", "IncidentType", type.id, { title, points });
    return NextResponse.json(type, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
