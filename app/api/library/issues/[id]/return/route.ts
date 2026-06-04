import { NextRequest, NextResponse } from "next/server";
import { returnBook } from "@/lib/services/library";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await returnBook(id);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to return book" }, { status: 500 });
  }
}
