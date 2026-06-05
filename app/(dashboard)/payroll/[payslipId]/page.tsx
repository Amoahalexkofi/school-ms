import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { PayslipDetailClient } from "./PayslipDetailClient";

export default async function PayslipDetailPage({ params }: { params: Promise<{ payslipId: string }> }) {
  const { payslipId } = await params;

  const payslip = await ((await getDb()) as any).staffPayslip.findUnique({
    where: { id: payslipId },
    include: {
      staff: {
        include: {
          department:  { select: { name: true } },
          designation: { select: { name: true } },
          user:        { select: { email: true } },
        },
      },
      allowances: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!payslip) notFound();
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payslip" />
      <PayslipDetailClient payslip={payslip} />
    </div>
  );
}
