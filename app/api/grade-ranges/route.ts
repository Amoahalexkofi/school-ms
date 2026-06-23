import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Grade ranges for the canonical grading scale (the one mark computation uses:
// GradingScale → GradeRange). The legacy /api/grades targets a separate `Grade`
// model that nothing reads, so this is the correct CRUD surface.

async function canonicalScale(db: any) {
  let scale = await db.gradingScale.findFirst({ orderBy: { createdAt: "asc" } });
  if (!scale) scale = await db.gradingScale.create({ data: { name: "Default Grading" } });
  return scale;
}

export async function GET() {
  const db = await getDb();
  const scale = await db.gradingScale.findFirst({
    orderBy: { createdAt: "asc" },
    include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
  });
  return NextResponse.json({ scaleName: scale?.name ?? "Default Grading", ranges: scale?.ranges ?? [] });
}

export async function POST(req: NextRequest) {
  try {
    const { grade, gradePoint, markFrom, markTo } = await req.json();
    if (!grade?.trim() || markFrom === undefined || markTo === undefined)
      return NextResponse.json({ error: "grade, markFrom and markTo are required" }, { status: 422 });

    const db = await getDb();
    const scale = await canonicalScale(db);
    const r = await db.gradeRange.create({
      data: {
        gradingScaleId: scale.id,
        grade:          grade.trim(),
        gradePoint:     gradePoint !== undefined && gradePoint !== "" ? parseFloat(gradePoint) : 0,
        markFrom:       parseFloat(markFrom),
        markTo:         parseFloat(markTo),
      },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
