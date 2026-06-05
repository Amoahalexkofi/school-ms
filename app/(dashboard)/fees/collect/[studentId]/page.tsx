import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeCollectClient } from "./FeeCollectClient";

async function getData(studentId: string) {
  const student = await ((await getDb()) as any).student.findUnique({
    where: { id: studentId },
    select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true },
  });
  if (!student) return null;

  const masters = await ((await getDb()) as any).studentFeesMaster.findMany({
    where: { studentId, isActive: true },
    include: {
      feeSessionGroup: {
        include: {
          feeGroup:  { select: { name: true } },
          session:   { select: { session: true } },
          items: { include: { feeType: { select: { name: true, code: true } } }, orderBy: { createdAt: "asc" } },
        },
      },
      deposits: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return { student, masters };
}

export default async function FeeCollectPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await getData(studentId);
  if (!data) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Collect Fees" />
      <FeeCollectClient student={data.student} masters={data.masters} />
    </div>
  );
}
