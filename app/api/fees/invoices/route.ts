import { NextResponse } from "next/server";
import { generateInvoice } from "@/lib/services/fee-invoices";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  for (const field of ["studentId", "feeGroupId", "dueDate"] as const) {
    if (!body[field]) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  try {
    const invoice = await generateInvoice({
      studentId: body.studentId as string,
      feeGroupId: body.feeGroupId as string,
      dueDate: new Date(body.dueDate as string),
    });
    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    if (message.includes("not found")) return NextResponse.json({ error: message }, { status: 404 });
    if (message.includes("past") || message.includes("no fee types")) return NextResponse.json({ error: message }, { status: 422 });
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
