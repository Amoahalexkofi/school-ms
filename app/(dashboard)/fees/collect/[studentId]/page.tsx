import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { FeeCollectClient } from "./FeeCollectClient";

async function getData(studentId: string) {
  const db = await getDb();
  const [student, masters, gateway] = await Promise.all([
    (db as any).student.findUnique({
      where: { id: studentId },
      select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true, email: true },
    }),
    (db as any).studentFeesMaster.findMany({
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
    }),
    (db as any).paymentGateway.findFirst({
      where: { isActive: true },
      select: { paymentType: true, isSandbox: true },
    }),
  ]);
  if (!student) return null;

  // Discounts assigned to this student (via their sessions) and not yet used —
  // selectable at collection time (Smart School shows applicable discounts).
  const sessionIds = (await (db as any).studentSession
    .findMany({ where: { studentId }, select: { id: true } })
    .catch(() => [])).map((s: any) => s.id);
  const assigned = sessionIds.length
    ? await (db as any).studentFeeDiscount.findMany({
        where: { studentSessionId: { in: sessionIds }, isActive: true, status: { not: "used" } },
        include: { feeDiscount: true },
      }).catch(() => [])
    : [];
  const seen = new Set<string>();
  const discounts = assigned
    .map((a: any) => a.feeDiscount)
    .filter((d: any) => d && d.isActive && !seen.has(d.id) && seen.add(d.id))
    .map((d: any) => ({
      id: d.id, name: d.name, type: d.type,
      percentage: Number(d.percentage), amount: Number(d.amount),
    }));

  return { student, masters, gateway: gateway ?? null, discounts };
}

export default async function FeeCollectPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await getData(studentId);
  if (!data) notFound();

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Collect Fees" />
      <FeeCollectClient student={data.student} masters={data.masters} gateway={data.gateway} discounts={data.discounts} />
    </div>
  );
}
