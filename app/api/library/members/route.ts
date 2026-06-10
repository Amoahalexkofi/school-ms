import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Librarymember_model — libarary_members table

export async function GET() {
  const db = await getDb();
  const members = await (db as any).libraryMember.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(members);
}

export async function POST(req: NextRequest) {
  try {
    const { memberType, memberId, libraryCardNo } = await req.json();
    if (!memberType || !memberId)
      return NextResponse.json({ error: "memberType and memberId are required" }, { status: 422 });

    const db = await getDb();
    const existing = await (db as any).libraryMember.findUnique({
      where: { memberType_memberId: { memberType, memberId } },
    });
    if (existing)
      return NextResponse.json({ error: "Member already registered" }, { status: 409 });

    const cardNo = libraryCardNo || `LIB-${Date.now()}`;
    const member = await (db as any).libraryMember.create({
      data: { memberType, memberId, libraryCardNo: cardNo },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 422 });
    const db = await getDb();
    await (db as any).libraryMember.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
