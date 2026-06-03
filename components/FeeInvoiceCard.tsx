"use client";

import { useState } from "react";

type InvoiceStatus = "UNPAID" | "PARTIAL" | "PAID";

interface Invoice {
  id: string;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  dueDate: Date;
  feeGroup: { name: string };
}

interface Props {
  invoice: Invoice;
  onPay: (invoiceId: string) => Promise<void>;
}

export function FeeInvoiceCard({ invoice, onPay }: Props) {
  const [processing, setProcessing] = useState(false);

  const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const isOverdue =
    invoice.status !== "PAID" && new Date(invoice.dueDate) < new Date();

  async function handlePay() {
    setProcessing(true);
    try {
      await onPay(invoice.id);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div>
      <h3>{invoice.feeGroup.name}</h3>

      <span>{invoice.status}</span>
      {isOverdue && <span>Overdue</span>}

      <dl>
        <dt>Total</dt>
        <dd>{invoice.totalAmount}</dd>

        <dt>Paid</dt>
        <dd>{invoice.paidAmount}</dd>

        <dt>Balance Due</dt>
        <dd>{balance}</dd>
      </dl>

      {invoice.status !== "PAID" && (
        <button onClick={handlePay} disabled={processing}>
          {processing ? "Processing…" : "Pay Now"}
        </button>
      )}
    </div>
  );
}
