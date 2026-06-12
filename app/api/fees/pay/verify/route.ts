import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Called by Paystack/Flutterwave after payment (redirect callback)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const reference = searchParams.get("reference");
  const gateway   = searchParams.get("gateway");
  // Flutterwave passes transaction_id on redirect
  const flwTxId   = searchParams.get("transaction_id");
  const status    = searchParams.get("status"); // flutterwave: "successful" | "cancelled"

  if (!reference) return NextResponse.redirect(new URL("/fees?error=missing_reference", req.url));

  const db = await getDb();
  const txn = await (db as any).gatewayTransaction.findUnique({ where: { reference } });
  if (!txn) return NextResponse.redirect(new URL("/fees?error=transaction_not_found", req.url));

  // Already processed
  if (txn.status === "SUCCESS" && txn.depositId) {
    return NextResponse.redirect(new URL(`/fees/receipt/${txn.depositId}/${txn.subInvoiceId ?? 1}`, req.url));
  }

  const gwConfig = await (db as any).paymentGateway.findFirst({ where: { paymentType: txn.gateway, isActive: true } });
  if (!gwConfig) return NextResponse.redirect(new URL("/fees?error=gateway_disabled", req.url));

  let verified = false;

  if (txn.gateway === "paystack") {
    const resp = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${gwConfig.apiSecretKey}` },
    });
    const json = await resp.json();
    verified = json.status && json.data?.status === "success";

  } else if (txn.gateway === "flutterwave") {
    if (status === "cancelled") {
      await (db as any).gatewayTransaction.update({ where: { reference }, data: { status: "FAILED" } });
      return NextResponse.redirect(new URL("/fees?error=payment_cancelled", req.url));
    }
    const id = flwTxId ?? txn.metadata?.flwTxId;
    if (!id) return NextResponse.redirect(new URL("/fees?error=missing_txid", req.url));
    const resp = await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
      headers: { Authorization: `Bearer ${gwConfig.apiSecretKey}` },
    });
    const json = await resp.json();
    verified = json.status === "success" && json.data?.status === "successful";
  }

  if (!verified) {
    await (db as any).gatewayTransaction.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.redirect(new URL("/fees?error=payment_failed", req.url));
  }

  // Payment verified — run fee_deposit (same logic as /api/fees/collect)
  const date = new Date().toISOString().slice(0, 10);
  const newEntry = {
    amount:       txn.amount,
    discount:     0,
    fine:         0,
    date,
    payment_mode: "ONLINE",
    description:  `Online payment via ${txn.gateway} (ref: ${reference})`,
    received_by:  "Online",
  };

  const existing = await (db as any).feeDeposit.findFirst({
    where: {
      studentFeesMasterId: txn.studentFeesMasterId,
      feeGroupItemId:      txn.feeGroupItemId ?? null,
    },
  });

  let depositId: string;
  let subInvoiceId: number;

  await (db as any).$transaction(async (tx: any) => {
    if (existing) {
      const detail = existing.amountDetail as Record<string, any>;
      const keys = Object.keys(detail).map(Number);
      subInvoiceId = Math.max(...keys) + 1;
      const updated = { ...detail, [subInvoiceId]: { ...newEntry, inv_no: subInvoiceId } };
      const dep = await tx.feeDeposit.update({
        where: { id: existing.id },
        data: { amountDetail: updated },
      });
      depositId = dep.id;
    } else {
      subInvoiceId = 1;
      const dep = await tx.feeDeposit.create({
        data: {
          studentFeesMasterId: txn.studentFeesMasterId,
          feeGroupItemId:      txn.feeGroupItemId ?? null,
          amountDetail:        { "1": { ...newEntry, inv_no: 1 } },
        },
      });
      depositId = dep.id;
    }

    await tx.gatewayTransaction.update({
      where: { reference },
      data: { status: "SUCCESS", depositId, subInvoiceId },
    });
  });

  return NextResponse.redirect(new URL(`/fees/receipt/${depositId!}/${subInvoiceId!}`, req.url));
}
