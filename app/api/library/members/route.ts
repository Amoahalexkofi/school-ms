import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Librarymember_model — libarary_members table

export async function GET() {
  const db = await getDb();
  const members = await (db as any).libraryMember.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  // Enrich with student/staff name data (polymorphic relation — manual lookup)
  const studentIds = members.filter((m: any) => m.memberType === "student").map((m: any) => m.memberId);
  const staffIds   = members.filter((m: any) => m.memberType === "teacher").map((m: any) => m.memberId);

  const [students, staffList] = await Promise.all([
    studentIds.length > 0
      ? (db as any).student.findMany({
          where: { id: { in: studentIds } },
          select: { id: true, firstName: true, lastName: true, admissionNo: true },
        })
      : [],
    staffIds.length > 0
      ? (db as any).staff.findMany({
          where: { id: { in: staffIds } },
          select: { id: true, firstName: true, lastName: true, employeeId: true },
        })
      : [],
  ]);

  const studentMap = new Map((students as any[]).map((s: any) => [s.id, s]));
  const staffMap   = new Map((staffList as any[]).map((s: any) => [s.id, s]));

  const enriched = members.map((m: any) => ({
    ...m,
    person: m.memberType === "student" ? studentMap.get(m.memberId) : staffMap.get(m.memberId),
  }));

  return NextResponse.json(enriched);
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
