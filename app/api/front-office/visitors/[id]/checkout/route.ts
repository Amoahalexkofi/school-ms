import { NextRequest, NextResponse } from "next/server";
import { checkOutVisitor } from "@/lib/services/front-office";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const visitor = await checkOutVisitor(id);
    return NextResponse.json(visitor);
  } catch (err: any) {
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to check out" }, { status: 500 });
  }
}
