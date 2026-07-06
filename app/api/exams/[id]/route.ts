import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { audit } from "@/lib/services/audit";
import { announceExamResults } from "@/lib/services/exams";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await ((await getDb()) as any).examGroup.findUnique({
    where: { id },
    include: {
      schedules: {
        include: {
          subject:      { select: { name: true, code: true } },
          session:      { select: { session: true } },
          classSection: { include: { class: true, section: true } },
          _count:       { select: { markEntries: true } },
        },
        orderBy: { dateOfExam: "asc" },
      },
    },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(group);
}

// Only real ExamGroup columns (sessionId/dateFrom/dateTo were dead keys that
// would throw at the Prisma layer if ever sent).
const EG_ALLOWED = ["name","examType","description","isPublished","passingPercentage"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  for (const key of EG_ALLOWED) {
    if (key in body) {
      if (key === "passingPercentage" && body[key] !== undefined) data[key] = body[key] ? parseFloat(body[key]) : null;
      else data[key] = body[key] ?? null;
    }
  }
  const db = await getDb();
  const before = await (db as any).examGroup.findUnique({ where: { id }, select: { isPublished: true } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const group = await (db as any).examGroup.update({ where: { id }, data });

  // Smart School announces results (mail/SMS) when an exam is saved with the
  // publish flag on. Fire-and-forget on the false→true transition.
  if (data.isPublished === true && !before.isPublished) {
    announceExamResults(db, id).catch(() => null);
  }

  await audit(
    data.isPublished === true && !before.isPublished ? "publish"
      : data.isPublished === false && before.isPublished ? "unpublish" : "update",
    "exam", id, { name: group.name }
  );

  return NextResponse.json(group);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).markEntry.count({ where: { examSchedule: { examGroupId: id } } });
  if (count > 0) return NextResponse.json({ error: `Has ${count} mark entries — unpublish and delete schedules first` }, { status: 409 });
  await ((await getDb()) as any).examGroup.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
