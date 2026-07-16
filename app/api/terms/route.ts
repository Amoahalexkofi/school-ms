import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/terms?sessionId=  → terms for a session (ordered)
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const db = await getDb();
  const terms = await (db as any).term.findMany({
    where: sessionId ? { sessionId } : {},
    orderBy: [{ session: { startDate: "desc" } }, { termNumber: "asc" }],
    include: { session: { select: { session: true } } },
  });
  return NextResponse.json(terms);
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, termNumber, name, startDate, endDate, setCurrent } = await req.json();
    if (!sessionId || !termNumber || !name || !startDate || !endDate) {
      return NextResponse.json({ error: "sessionId, termNumber, name, startDate and endDate are required" }, { status: 422 });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json({ error: "End date cannot be before start date" }, { status: 422 });
    }
    const db = await getDb();
    const term = await (db as any).term.create({
      data: {
        sessionId, termNumber: Number(termNumber), name,
        startDate: new Date(startDate), endDate: new Date(endDate),
        isCurrent: !!setCurrent,
      },
    });
    // Only one current term per session.
    if (setCurrent) {
      await (db as any).term.updateMany({
        where: { sessionId, id: { not: term.id } }, data: { isCurrent: false },
      });
    }
    return NextResponse.json(term, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "That term number already exists for this session" }, { status: 409 });
    return NextResponse.json({ error: err.message || "Failed to create term" }, { status: 500 });
  }
}
