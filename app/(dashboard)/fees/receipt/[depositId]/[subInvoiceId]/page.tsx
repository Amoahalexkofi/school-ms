import { getDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReceiptClient } from "../../ReceiptClient";
import { assertCanViewReceipt } from "../../ownership";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ depositId: string; subInvoiceId: string }>;
}) {
  const { depositId, subInvoiceId } = await params;
  const db = await getDb();

  const [deposit, profile] = await Promise.all([
    (db as any).feeDeposit.findUnique({
      where: { id: depositId },
      include: {
        studentFeesMaster: {
          include: {
            student: {
              select: {
                id: true, firstName: true, middleName: true, lastName: true,
                admissionNo: true, fatherPhone: true, motherPhone: true, guardianPhone: true,
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
    }),
    (db as any).schoolProfile.findFirst({ select: { name: true, whatsappNumber: true } }),
  ]);

  if (!deposit) notFound();

  // Students/parents may only view their own (or their child's) receipt.
  const session = await auth();
  const ok = await assertCanViewReceipt(db, session, deposit.studentFeesMaster.student.id);
  if (!ok) notFound();

  const allDetail = deposit.amountDetail as Record<string, any>;
  const entry = allDetail[subInvoiceId];
  if (!entry) notFound();

  const student = deposit.studentFeesMaster.student;
  const parentPhone: string =
    student.fatherPhone || student.motherPhone || student.guardianPhone || "";

  return (
    <ReceiptClient
      deposit={deposit}
      entry={entry}
      subInvoiceId={Number(subInvoiceId)}
      parentPhone={parentPhone}
      schoolName={profile?.name ?? ""}
    />
  );
}
