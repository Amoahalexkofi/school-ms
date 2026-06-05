import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date");
  const where: any = {};
  if (date) { const d = new Date(date); const end = new Date(date); end.setDate(end.getDate() + 1); where.inTime = { gte: d, lt: end }; }
  const visitors = await ((await getDb()) as any).visitor.findMany({
    where, include: { purpose: { select: { name: true } } }, orderBy: { inTime: "desc" }, take: 200,
  });
  return NextResponse.json(visitors);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Visitor name required" }, { status: 422 });
    const v = await ((await getDb()) as any).visitor.create({ data: { name: body.name.trim(), phone: body.phone || null, email: body.email || null, purposeId: body.purposeId || null, host: body.host || null, idProof: body.idProof || null, numVisitors: parseInt(body.numVisitors) || 1, note: body.note || null } });
    return NextResponse.json(v, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
