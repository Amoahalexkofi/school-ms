import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Feereminder_model: pre-seeded rows (before/after × 2/5 days)

export async function GET() {
  const db = await getDb();
  const reminders = await (db as any).feeReminder.findMany({ orderBy: [{ reminderType: "asc" }, { day: "asc" }] });
  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  try {
    const { reminderType, day, isActive } = await req.json();
    if (!reminderType || day === undefined) return NextResponse.json({ error: "reminderType and day are required" }, { status: 422 });
    const db = await getDb();
    const r = await (db as any).feeReminder.create({
      data: { reminderType, day: parseInt(day), isActive: isActive ?? false },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
