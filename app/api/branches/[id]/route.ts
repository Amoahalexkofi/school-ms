import { NextRequest, NextResponse } from "next/server";
import { updateBranch, deleteBranch } from "@/lib/services/branches";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const branch = await updateBranch(id, body);
    return NextResponse.json(branch);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to update branch" }, { status: 422 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteBranch(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed to delete branch" }, { status: 422 });
  }
}
