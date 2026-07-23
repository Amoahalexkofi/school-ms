import { NextRequest, NextResponse } from "next/server";
import { updateSubject, deleteSubject } from "@/lib/services/settings";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, code } = await req.json();
    const subject = await updateSubject(id, { name, code });
    return NextResponse.json(subject);
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteSubject(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
