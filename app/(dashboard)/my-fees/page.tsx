import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CreditCard, CheckCircle2, AlertCircle, Receipt } from "lucide-react";
import Link from "next/link";

function NoProfile() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Fees" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <CreditCard className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No student profile linked</p>
          <p className="text-sm text-slate-400 mt-1">This demo account is not connected to a student record.</p>
        </div>
      </main>
    </div>
  );
}

export default async function MyFeesPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;

  let student: any = null;
  let feeMasters: any[] = [];

  try {
    const db = await getDb();
    student = await (db as any).student.findUnique({
      where: { userId },
      include: {
        studentSessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }).catch(() => null);

    if (!student) return <NoProfile />;

    feeMasters = await (db as any).studentFeesMaster.findMany({
      where: { studentId: student.id, isSystem: false },
      include: {
        feeGroupItem: {
          include: {
            feeType: { include: { feeCategory: true } },
            feeSessionGroup: { include: { session: true } },
          },
        },
        feeDeposits: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    }).catch(() => []);
  } catch {
    return <NoProfile />;
  }

  if (!student) return <NoProfile />;

  let totalInvoiced = 0, totalPaid = 0;
  for (const fm of feeMasters) {
    totalInvoiced += fm.amount ?? 0;
    totalPaid += fm.feeDeposits.reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
  }
  const totalDue = totalInvoiced - totalPaid;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Fees" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-[17px] text-slate-900">{student.firstName} {student.lastName}</p>
              <p className="text-slate-500 text-sm mt-0.5">Admission No: {student.admissionNo}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-slate-900 tabular-nums">₵{totalInvoiced.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total invoiced</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-semibold text-emerald-600 tabular-nums">₵{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Total paid</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-semibold tabular-nums ${totalDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>₵{totalDue.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Outstanding</p>
            </div>
          </div>
        </div>

        {feeMasters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <CreditCard className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No fee invoices found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feeMasters.map((fm: any) => {
              const paid = fm.feeDeposits.reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
              const due  = (fm.amount ?? 0) - paid;
              const fullyPaid = due <= 0;
              const sess = fm.feeGroupItem?.feeSessionGroup?.session?.session ?? "—";
              return (
                <div key={fm.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fullyPaid ? "bg-emerald-50" : "bg-rose-50"}`}>
                        {fullyPaid ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-rose-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{fm.feeGroupItem?.feeType?.name ?? "Fee Invoice"}</p>
                        <p className="text-xs text-slate-400">{fm.feeGroupItem?.feeType?.feeCategory?.name ?? ""} · {sess}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-slate-900 tabular-nums">₵{(fm.amount ?? 0).toLocaleString()}</p>
                      {fullyPaid
                        ? <p className="text-xs text-emerald-600 font-semibold">Fully Paid</p>
                        : <p className="text-xs text-rose-600 font-semibold">Due: ₵{due.toLocaleString()}</p>}
                    </div>
                  </div>
                  {fm.feeDeposits.length > 0 && (
                    <div className="border-t border-slate-200 bg-slate-50 divide-y divide-slate-100">
                      {fm.feeDeposits.map((dep: any) => {
                        const detail = Array.isArray(dep.amountDetail) ? dep.amountDetail : [];
                        return detail.map((d: any, i: number) => (
                          <div key={`${dep.id}-${i}`} className="flex items-center justify-between px-5 py-2.5 text-xs">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Receipt className="h-3.5 w-3.5 shrink-0" />
                              <span>{new Date(dep.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}{dep.paymentMode ? ` · ${dep.paymentMode}` : ""}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-emerald-700">₵{(d.amount ?? dep.amount ?? 0).toLocaleString()}</span>
                              <Link href={`/fees/receipt/${dep.id}/${d.subId ?? i}`} className="text-indigo-600 hover:underline text-[10px] font-semibold">Receipt</Link>
                            </div>
                          </div>
                        ));
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
