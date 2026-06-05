import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST — record a payment against a StudentFeesMaster
export async function POST(req: NextRequest) {
  try {
    const { studentFeesMasterId, amount, paymentMode, description, feeGroupItemId } = await req.json();

    if (!studentFeesMasterId) return NextResponse.json({ error: "studentFeesMasterId required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });

    // Build amountDetail JSON (Smart School format)
    const amountDetail = {
      "1": {
        amount:       Number(amount),
        discount:     0,
        fine:         0,
        date:         new Date().toISOString().slice(0, 10),
        payment_mode: paymentMode || "CASH",
        description:  description || "",
        received_by:  "Admin",
      },
    };

    const deposit = await ((await getDb()) as any).feeDeposit.create({
      data: {
        studentFeesMasterId,
        feeGroupItemId: feeGroupItemId || null,
        amountDetail,
      },
    });

    return NextResponse.json(deposit, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
