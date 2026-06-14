import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendSms, feeReceiptSms } from "@/lib/services/sms";
import { sendEmail, feeReceiptEmail } from "@/lib/email";

// Mirrors Smart School's fee_deposit() / fee_deposit_bulk():
// ONE deposit row per (studentFeesMasterId, feeGroupItemId).
// If a row already exists, append the new payment as the next JSON key.
// Returns { id, subInvoiceId } so the receipt can reference the exact payment.
export async function POST(req: NextRequest) {
  try {
    const {
      studentFeesMasterId,
      feeGroupItemId,
      amount,
      paymentMode,
      description,
      discountIds,   // optional: string[]
    } = await req.json();

    if (!studentFeesMasterId) return NextResponse.json({ error: "studentFeesMasterId required" }, { status: 422 });
    if (!amount || Number(amount) <= 0) return NextResponse.json({ error: "Amount must be positive" }, { status: 422 });

    const db = await getDb();
    const date = new Date().toISOString().slice(0, 10);

    // Resolve discount amount from discountIds (mirrors $fee_discounts loop in Smart School)
    let totalDiscount = 0;
    const resolvedDiscounts: Array<{ id: string; discountAmount: number }> = [];

    if (Array.isArray(discountIds) && discountIds.length > 0) {
      const feeDiscounts = await (db as any).feeDiscount.findMany({
        where: { id: { in: discountIds }, isActive: true },
      });
      for (const d of feeDiscounts) {
        let disc = 0;
        if (d.type === "percentage") {
          disc = (Number(amount) * Number(d.percentage)) / 100;
        } else {
          disc = Number(d.amount);
        }
        totalDiscount += disc;
        resolvedDiscounts.push({ id: d.id, discountAmount: disc });
      }
    }

    // Fetch master to get studentId + contact info for SMS/email receipt
    const master = await (db as any).studentFeesMaster.findUnique({
      where: { id: studentFeesMasterId },
      select: {
        studentSessionId: true,
        studentSession: {
          select: {
            studentId: true,
            student: { select: { firstName: true, lastName: true, phone: true, parentMobile: true, email: true, guardianEmail: true } },
          },
        },
      },
    });

    const newEntry = {
      amount:       Number(amount),
      discount:     totalDiscount,
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

    const result = await (db as any).$transaction(async (tx: any) => {
      if (existing) {
        const detail = existing.amountDetail as Record<string, any>;
        const keys = Object.keys(detail).map(Number);
        subInvoiceId = Math.max(...keys) + 1;
        const updated = { ...detail, [subInvoiceId]: { ...newEntry, inv_no: subInvoiceId } };
        deposit = await tx.feeDeposit.update({
          where: { id: existing.id },
          data: { amountDetail: updated },
        });
      } else {
        subInvoiceId = 1;
        deposit = await tx.feeDeposit.create({
          data: {
            studentFeesMasterId,
            feeGroupItemId: feeGroupItemId || null,
            amountDetail: { "1": { ...newEntry, inv_no: 1 } },
          },
        });
      }

      // Create StudentAppliedDiscount records for each discount applied
      if (resolvedDiscounts.length > 0 && master?.studentSession?.studentId) {
        await tx.studentAppliedDiscount.createMany({
          data: resolvedDiscounts.map((d) => ({
            studentId:    master.studentSession.studentId,
            feeDepositId: deposit.id,
            invoiceId:    null,
            subInvoiceId,
          })),
          skipDuplicates: true,
        });
      }

      return { id: deposit.id, subInvoiceId };
    });

    // Fire-and-forget SMS + email receipt
    const student = master?.studentSession?.student;
    if (student) {
      const profile = await (db as any).schoolProfile.findFirst({ select: { name: true, currency: true } });
      const studentName = `${student.firstName} ${student.lastName}`;
      const receiptNo   = `${result.id.slice(-6).toUpperCase()}-${result.subInvoiceId}`;
      const amountStr   = Number(amount).toFixed(2);
      const currency    = profile?.currency ?? "";
      const schoolName  = profile?.name ?? "School";

      // SMS
      const phones = [student.phone, student.parentMobile].filter(Boolean) as string[];
      if (phones.length) {
        sendSms(phones, feeReceiptSms({ studentName, amount: amountStr, currency, receiptNo, schoolName })).catch(() => null);
      }

      // Email
      const emails = [student.email, student.guardianEmail].filter(Boolean) as string[];
      if (emails.length) {
        sendEmail(db, {
          to: emails,
          subject: `Fee Receipt ${receiptNo} — ${schoolName}`,
          html: feeReceiptEmail({
            studentName,
            amount: amountStr,
            currency,
            receiptNo,
            schoolName,
            paymentMode: paymentMode || "CASH",
            date: date,
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
