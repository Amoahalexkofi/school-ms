import { notFound, redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/services/permissions";
import { Topbar } from "@/components/Topbar";
import { PayslipDetailClient } from "./PayslipDetailClient";

export default async function PayslipDetailPage({ params }: { params: Promise<{ payslipId: string }> }) {
  const { payslipId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const db = await getDb();
  const payslip = await (db as any).staffPayslip.findUnique({
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

  // /payroll is coarsely open to Teacher/Librarian/Receptionist too (so
  // they can see their OWN payslip), but the granular permission gate that
  // narrows /api/payroll never runs for a plain page route — without this,
  // any of those roles could open any *other* staff member's payslip just
  // by changing the id in the URL. Allow: the payslip's own staff member,
  // or anyone with real HR view rights (Super Admin/Admin bypass entirely).
  const viewerStaff = await (db as any).staff.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (viewerStaff?.id !== payslip.staffId) {
    const perms = await getUserPermissions(session.user.id);
    const canViewHr = perms === null || perms.human_resource?.canView === true;
    if (!canViewHr) notFound();
  }
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Payslip" />
      <PayslipDetailClient payslip={payslip} />
    </div>
  );
}
