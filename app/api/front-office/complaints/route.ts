import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  return NextResponse.json(await ((await getDb()) as any).complaint.findMany({
    include: { complaintType: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  }));
}
export async function POST(req: NextRequest) {
  try {
    const { title, raisedBy, phone, complaintTypeId, description } = await req.json();
    if (!title?.trim() || !raisedBy?.trim() || !description?.trim())
      return NextResponse.json({ error: "Title, raised by, and description required" }, { status: 422 });
    const c = await ((await getDb()) as any).complaint.create({ data: { title: title.trim(), raisedBy: raisedBy.trim(), phone: phone || null, complaintTypeId: complaintTypeId || null, description: description.trim() } });
    return NextResponse.json(c, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
