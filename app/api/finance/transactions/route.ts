import { NextRequest, NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/lib/services/finance";

export async function GET() {
  return NextResponse.json(await listTransactions());
}

export async function POST(req: NextRequest) {
  try {
    const { type, amount, date, headId, note } = await req.json();
    const tx = await createTransaction({ type, amount: Number(amount), date: new Date(date), headId, note });
    return NextResponse.json(tx, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
