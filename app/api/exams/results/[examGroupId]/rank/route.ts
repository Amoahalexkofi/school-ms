import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Persist / override exam ranks for an exam group (Smart School updaterank).
// Body: { ranks: [{ studentId, rank, classSectionId? }] }
export async function POST(req: NextRequest, { params }: { params: Promise<{ examGroupId: string }> }) {
  const { examGroupId } = await params;
  try {
    const { ranks } = await req.json();
    if (!Array.isArray(ranks)) return NextResponse.json({ error: "ranks array required" }, { status: 422 });
    const db = await getDb();

    for (const r of ranks) {
      if (!r.studentId || r.rank == null) continue;
      await (db as any).studentExamRank.upsert({
        where:  { examGroupId_studentId: { examGroupId, studentId: r.studentId } },
        create: { examGroupId, studentId: r.studentId, classSectionId: r.classSectionId ?? null, rank: parseInt(r.rank) },
        update: { rank: parseInt(r.rank), classSectionId: r.classSectionId ?? null },
      });
    }
    return NextResponse.json({ ok: true, saved: ranks.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
