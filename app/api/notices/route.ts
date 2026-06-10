import { NextRequest, NextResponse } from "next/server";
import { createNotice, listNotices, deleteNotice } from "@/lib/services/notices";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await listNotices());
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    // Resolve staff id from session user
    const staff = session?.user?.id
      ? await ((await getDb()) as any).staff.findUnique({ where: { userId: session.user.id } })
      : null;
    if (!staff) return NextResponse.json({ error: "Only staff can post notices" }, { status: 403 });
    const { title, content, audience, attachment, isPublished } = body;
    const notice = await createNotice({ title, content, audience, attachment, isPublished, postedById: staff.id });
    return NextResponse.json(notice, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to post notice" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await deleteNotice(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
