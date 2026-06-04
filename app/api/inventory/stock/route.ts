import { NextRequest, NextResponse } from "next/server";
import { stockIn, stockOut } from "@/lib/services/inventory";

export async function POST(req: NextRequest) {
  try {
    const { itemId, quantity, note, direction } = await req.json();
    const result = direction === "OUT"
      ? await stockOut(itemId, Number(quantity), note)
      : await stockIn(itemId, Number(quantity), note);
    return NextResponse.json(result);
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    if (err.code === "NOT_FOUND") return NextResponse.json({ error: err.message }, { status: 404 });
    if (err.code === "CONFLICT") return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
