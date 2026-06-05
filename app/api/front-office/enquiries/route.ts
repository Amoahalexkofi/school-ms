import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).enquiry.findMany({ orderBy: { createdAt: "desc" } }));
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 422 });
    const e = await ((await getDb()) as any).enquiry.create({ data: { name: body.name.trim(), phone: body.phone || null, email: body.email || null, classInterested: body.classInterested || null, note: body.note || null } });
    return NextResponse.json(e, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
