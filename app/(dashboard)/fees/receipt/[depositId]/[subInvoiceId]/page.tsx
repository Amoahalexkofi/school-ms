import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReceiptClient } from "../../ReceiptClient";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ depositId: string; subInvoiceId: string }>;
}) {
  const { depositId, subInvoiceId } = await params;
  const db = await getDb();

  const deposit = await (db as any).feeDeposit.findUnique({
    where: { id: depositId },
    include: {
      studentFeesMaster: {
        include: {
          student: {
            select: {
              id: true, firstName: true, middleName: true, lastName: true,
              admissionNo: true,
            },
          },
          studentSession: {
            include: {
              session: { select: { session: true } },
              classSection: { include: { class: true, section: true } },
            },
          },
          feeSessionGroup: {
            include: { feeGroup: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!deposit) notFound();

  // Pick the specific sub-invoice entry from the JSON
  const allDetail = deposit.amountDetail as Record<string, any>;
  const entry = allDetail[subInvoiceId];
  if (!entry) notFound();

  return <ReceiptClient deposit={deposit} entry={entry} subInvoiceId={Number(subInvoiceId)} />;
}
