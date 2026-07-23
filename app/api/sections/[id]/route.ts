import { NextRequest, NextResponse } from "next/server";
import { updateSection, deleteSection } from "@/lib/services/settings";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name } = await req.json();
    const section = await updateSection(id, { name });
    return NextResponse.json(section);
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "P2002") return NextResponse.json({ error: "A section with this name already exists" }, { status: 422 });
    return NextResponse.json({ error: "Failed to update section" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await deleteSection(id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete section" }, { status: 500 });
  }
}
