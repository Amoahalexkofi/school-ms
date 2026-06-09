import { NextRequest, NextResponse } from "next/server";
import { createTransaction, listTransactions } from "@/lib/services/finance";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") as "INCOME" | "EXPENSE" | null;
  const from = searchParams.get("from");
  const to   = searchParams.get("to");
  return NextResponse.json(await listTransactions({
    type: type ?? undefined,
    from: from ? new Date(from) : undefined,
    to:   to   ? new Date(to)   : undefined,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { type, amount, date, headId, name, invoiceNo, note, attachment } = await req.json();
    const tx = await createTransaction({
      type,
      amount:     Number(amount),
      date:       new Date(date),
      headId,
      name:       name       || undefined,
      invoiceNo:  invoiceNo  || undefined,
      note:       note       || undefined,
      attachment: attachment || undefined,
    });
    return NextResponse.json(tx, { status: 201 });
  } catch (err: any) {
    if (err.code === "VALIDATION") return NextResponse.json({ error: err.message }, { status: 422 });
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
