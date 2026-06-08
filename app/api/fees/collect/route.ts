import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's fee_deposit() / fee_deposit_bulk():
// ONE deposit row per (studentFeesMasterId, feeGroupItemId).
// If a row already exists, append the new payment as the next JSON key.
// Returns { id, subInvoiceId } so the receipt can reference the exact payment.
export async function POST(req: NextRequest) {
  try {
    const { studentFeesMasterId, feeGroupItemId, amount, paymentMode, description } = await req.json();

    if (!studentFeesMasterId) return NextResponse.json({ error: "studentFeesMasterId required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });

    const db = await getDb();
    const date = new Date().toISOString().slice(0, 10);

    const newEntry = {
      amount:       Number(amount),
      discount:     0,
      fine:         0,
      date,
      payment_mode: paymentMode || "CASH",
      description:  description || "",
      received_by:  "Admin",
    };

    // Look for existing deposit row for this fee item (Smart School upsert logic)
    const existing = await (db as any).feeDeposit.findFirst({
      where: {
        studentFeesMasterId,
        feeGroupItemId: feeGroupItemId ?? null,
      },
    });

    let deposit: any;
    let subInvoiceId: number;

    if (existing) {
      // Append to existing JSON (inv_no = max key + 1)
      const detail = existing.amountDetail as Record<string, any>;
      const keys = Object.keys(detail).map(Number);
      subInvoiceId = Math.max(...keys) + 1;
      const updated = { ...detail, [subInvoiceId]: { ...newEntry, inv_no: subInvoiceId } };
      deposit = await (db as any).feeDeposit.update({
        where: { id: existing.id },
        data: { amountDetail: updated },
      });
    } else {
      // New deposit row
      subInvoiceId = 1;
      deposit = await (db as any).feeDeposit.create({
        data: {
          studentFeesMasterId,
          feeGroupItemId: feeGroupItemId || null,
          amountDetail: { "1": { ...newEntry, inv_no: 1 } },
        },
      });
    }

    return NextResponse.json({ id: deposit.id, subInvoiceId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
