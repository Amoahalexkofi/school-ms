import { NextResponse } from "next/server";
import { recordPayment } from "@/lib/services/fee-invoices";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of ["invoiceId", "amount", "method"] as const) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const invoice = await recordPayment({
      invoiceId: body.invoiceId as string,
      amount: Number(body.amount),
      method: body.method as string,
      reference: body.reference as string | undefined,
    });
    return NextResponse.json(invoice, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("already paid")) return NextResponse.json({ error: message }, { status: 409 });
    if (message.includes("greater than 0")) return NextResponse.json({ error: message }, { status: 422 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
