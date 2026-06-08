import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { studentIds, toSessionId, toClassSectionId } = await req.json();
    if (!studentIds?.length || !toSessionId || !toClassSectionId)
      return NextResponse.json({ error: "studentIds, toSessionId and toClassSectionId required" }, { status: 422 });

    const db = await getDb();
    let promoted = 0;
    let skipped = 0;

    for (const studentId of studentIds) {
      const existing = await (db as any).studentSession.findFirst({
        where: { studentId, sessionId: toSessionId, classSectionId: toClassSectionId },
      });
      if (existing) { skipped++; continue; }

      await (db as any).studentSession.create({
        data: { studentId, sessionId: toSessionId, classSectionId: toClassSectionId, isActive: true },
      });
      promoted++;
    }

    return NextResponse.json({ promoted, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
