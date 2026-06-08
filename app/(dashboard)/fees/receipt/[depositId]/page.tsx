import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { ReceiptClient } from "./ReceiptClient";

export default async function ReceiptPage({ params }: { params: Promise<{ depositId: string }> }) {
  const { depositId } = await params;
  const db = await getDb();

  const deposit = await (db as any).feeDeposit.findUnique({
    where: { id: depositId },
    include: {
      studentFeesMaster: {
        include: {
          student: {
            select: {
              id: true, firstName: true, middleName: true, lastName: true,
              admissionNo: true, bloodGroup: true, gender: true,
            },
          },
          studentSession: {
            include: {
              session: { select: { session: true } },
              classSection: { include: { class: true, section: true } },
            },
          },
          feeSessionGroup: {
            include: {
              feeGroup: { select: { name: true } },
              items: { include: { feeType: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!deposit) notFound();

  return <ReceiptClient deposit={deposit} />;
}
