import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Ghana GES default SBA structure: components' weights double as max marks.
export const GES_DEFAULTS = [
  { name: "Class Work / Home Work", weight: 20, isExam: false, sortOrder: 0 },
  { name: "Project / Practical",    weight: 15, isExam: false, sortOrder: 1 },
  { name: "Group Work / Quizzes",   weight: 15, isExam: false, sortOrder: 2 },
  { name: "End-of-Term Exam",       weight: 50, isExam: true,  sortOrder: 3 },
];

// GET — active assessment components (empty array = single-mark mode)
export async function GET() {
  const components = await ((await getDb()) as any).assessmentComponent.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ components });
}

// POST — replace the component set. Body: { components: [{id?, name, weight, isExam, sortOrder}] }
// or { seed: "ges" } to load the GES defaults. Weights must sum to 100.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = (await getDb()) as any;

    // Turn SBA off entirely → marks entry reverts to single-mark mode.
    if (body.disable === true) {
      await db.assessmentComponent.updateMany({ where: {}, data: { isActive: false } });
      return NextResponse.json({ ok: true, components: [] });
    }

    const incoming = body.seed === "ges" ? GES_DEFAULTS : body.components;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json({ error: "components required" }, { status: 422 });
    }

    const cleaned = incoming.map((c: any, i: number) => ({
      id: c.id || undefined,
      name: String(c.name ?? "").trim(),
      weight: parseFloat(c.weight),
      isExam: !!c.isExam,
      sortOrder: Number.isFinite(c.sortOrder) ? c.sortOrder : i,
    }));

    if (cleaned.some((c: any) => !c.name)) {
      return NextResponse.json({ error: "Every component needs a name" }, { status: 422 });
    }
    if (cleaned.some((c: any) => !Number.isFinite(c.weight) || c.weight <= 0)) {
      return NextResponse.json({ error: "Every component needs a weight above 0" }, { status: 422 });
    }
    const totalWeight = cleaned.reduce((a: number, c: any) => a + c.weight, 0);
    if (Math.round(totalWeight * 100) / 100 !== 100) {
      return NextResponse.json({ error: `Weights must sum to 100 (currently ${totalWeight})` }, { status: 422 });
    }
    if (cleaned.filter((c: any) => c.isExam).length > 1) {
      return NextResponse.json({ error: "Only one component can be the end-of-term exam" }, { status: 422 });
    }

    const keptIds = cleaned.filter((c: any) => c.id).map((c: any) => c.id);
    const result = await db.$transaction(async (tx: any) => {
      // Deactivate removed components (never hard-delete: ComponentMark rows may
      // reference them from past terms).
      await tx.assessmentComponent.updateMany({
        where: keptIds.length ? { id: { notIn: keptIds } } : {},
        data: { isActive: false },
      });
      const saved = [];
      for (const c of cleaned) {
        saved.push(
          c.id
            ? await tx.assessmentComponent.update({
                where: { id: c.id },
                data: { name: c.name, weight: c.weight, isExam: c.isExam, sortOrder: c.sortOrder, isActive: true },
              })
            : await tx.assessmentComponent.create({
                data: { name: c.name, weight: c.weight, isExam: c.isExam, sortOrder: c.sortOrder },
              })
        );
      }
      return saved;
    });

    return NextResponse.json({ ok: true, components: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
