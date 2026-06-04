import { NextRequest, NextResponse } from "next/server";
import { addItem, listItems } from "@/lib/services/inventory";

export async function GET() {
  return NextResponse.json(await listItems());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await addItem({ ...body, quantity: Number(body.quantity ?? 0), lowStockAlert: Number(body.lowStockAlert ?? 5) });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
