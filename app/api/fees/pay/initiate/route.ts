import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { studentFeesMasterId, feeGroupItemId, amount, studentEmail } = await req.json();
    if (!studentFeesMasterId || !amount || Number(amount) <= 0)
      return NextResponse.json({ error: "studentFeesMasterId and amount required" }, { status: 422 });

    const db = await getDb();
    const gateway = await (db as any).paymentGateway.findFirst({ where: { isActive: true } });
    if (!gateway) return NextResponse.json({ error: "No active payment gateway configured" }, { status: 400 });

    const reference = randomBytes(16).toString("hex");
    const amountInCents = Math.round(Number(amount) * 100);
    const baseUrl = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host")}`;
    const callbackUrl = `${baseUrl}/api/fees/pay/verify?reference=${reference}&gateway=${gateway.paymentType}`;
    const email = studentEmail ?? "student@school.edu";

    let checkoutUrl = "";

    if (gateway.paymentType === "paystack") {
      const secretKey = gateway.apiSecretKey;
      if (!secretKey) return NextResponse.json({ error: "Paystack secret key not configured" }, { status: 400 });

      const resp = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amountInCents,
          reference,
          callback_url: callbackUrl,
          metadata: { studentFeesMasterId, feeGroupItemId: feeGroupItemId ?? null },
        }),
      });
      const json = await resp.json();
      if (!json.status) return NextResponse.json({ error: json.message ?? "Paystack init failed" }, { status: 400 });
      checkoutUrl = json.data.authorization_url;

    } else if (gateway.paymentType === "flutterwave") {
      const secretKey = gateway.apiSecretKey;
      if (!secretKey) return NextResponse.json({ error: "Flutterwave secret key not configured" }, { status: 400 });

      const resp = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount: Number(amount),
          currency: "GHS",
          redirect_url: callbackUrl,
          customer: { email, name: "Student" },
          customizations: { title: "School Fee Payment" },
          meta: { studentFeesMasterId, feeGroupItemId: feeGroupItemId ?? null },
        }),
      });
      const json = await resp.json();
      if (json.status !== "success") return NextResponse.json({ error: json.message ?? "Flutterwave init failed" }, { status: 400 });
      checkoutUrl = json.data.link;

    } else {
      return NextResponse.json({ error: `Gateway "${gateway.paymentType}" not supported` }, { status: 400 });
    }

    // Persist the pending transaction (mirrors gateway_ins insert)
    await (db as any).gatewayTransaction.create({
      data: {
        reference,
        gateway:             gateway.paymentType,
        status:              "PENDING",
        amount:              Number(amount),
        studentFeesMasterId,
        feeGroupItemId:      feeGroupItemId ?? null,
        studentEmail:        email,
      },
    });

    return NextResponse.json({ checkoutUrl, reference });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
