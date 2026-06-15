"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/utils";

type Props = { deposit: any; entry: any; subInvoiceId: number; parentPhone?: string; schoolName?: string };

export function ReceiptClient({ deposit, entry, subInvoiceId, parentPhone, schoolName }: Props) {
  const master  = deposit.studentFeesMaster;
  const student = master.student;
  const sess    = master.studentSession;
  const fg      = master.feeSessionGroup;

  const amount  = Number(entry?.amount ?? 0);
  const mode    = (entry?.payment_mode ?? "CASH").replace(/_/g, " ");
  const dateStr = entry?.date ?? new Date().toISOString().slice(0, 10);
  const ref     = entry?.description ?? "";

  // Receipt number = depositId suffix + sub-invoice (matches Smart School invoice_id/sub_invoice_id)
  const receiptNo = `${deposit.id.slice(-8).toUpperCase()}-${subInvoiceId}`;

  const studentName = `${student.firstName}${student.middleName ? " " + student.middleName : ""} ${student.lastName}`;
  const whatsAppHref = parentPhone
    ? buildWhatsAppLink(
        parentPhone,
        `Dear Parent, payment of ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been received for ${studentName}. Receipt No: ${receiptNo}. Thank you.${schoolName ? ` — ${schoolName}` : ""}`
      )
    : null;

  useEffect(() => {
    const t = setTimeout(() => window.print(), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 flex items-start justify-center py-8 print:bg-white print:p-0">
      {/* Controls — hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        {whatsAppHref && (
          <a href={whatsAppHref} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </Button>
          </a>
        )}
        <Button onClick={() => window.print()} size="sm">
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.close()}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="w-[420px] bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none print:w-full">
        {/* Header */}
        <div className="bg-blue-700 text-white text-center py-5 px-4">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Skula</p>
          <h1 className="text-lg font-bold">Fee Payment Receipt</h1>
        </div>

        {/* Receipt number + date */}
        <div className="flex justify-between items-center px-6 py-3 bg-blue-50 border-b text-xs text-gray-600">
          <span>Receipt No: <span className="font-mono font-semibold text-gray-800">{receiptNo}</span></span>
          <span>Date: <span className="font-semibold text-gray-800">
            {new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span></span>
        </div>

        {/* Student info */}
        <div className="px-6 py-4 border-b space-y-1.5">
          <Row label="Student" value={studentName} />
          <Row label="Admission No." value={student.admissionNo} mono />
          <Row label="Class" value={sess?.classSection ? `${sess.classSection.class.name} — ${sess.classSection.section.name}` : "—"} />
          <Row label="Session" value={sess?.session?.session ?? "—"} />
        </div>

        {/* Fee info */}
        <div className="px-6 py-4 border-b space-y-1.5">
          <Row label="Fee Group" value={fg?.feeGroup?.name ?? "—"} />
          <Row label="Payment Mode" value={mode} />
          {ref && <Row label="Reference" value={ref} />}
        </div>

        {/* Amount */}
        <div className="px-6 py-5 bg-green-50 text-center">
          <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-green-700">
            ₵{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 text-center text-xs text-gray-400 border-t">
          This is a computer-generated receipt and requires no signature.
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className={`text-xs font-medium text-gray-900 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
