import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CreditCard, CheckCircle2, Clock, AlertCircle, Receipt } from "lucide-react";
import Link from "next/link";

export default async function MyFeesPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;
  const db = await getDb();

  const student = await (db as any).student.findUnique({
    where: { userId },
    include: {
      studentSessions: {
        include: { session: true, classSection: { include: { class: true, section: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!student) return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Fees" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500">No student profile linked</p>
          <p className="text-sm text-gray-400 mt-1">This account is not connected to a student record yet.</p>
        </div>
      </main>
    </div>
  );

  // Get all fee masters for this student across all sessions
  const feeMasters = await (db as any).studentFeesMaster.findMany({
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
  });

  // Compute totals
  let totalInvoiced = 0, totalPaid = 0;
  for (const fm of feeMasters) {
    const amount = fm.amount ?? 0;
    totalInvoiced += amount;
    const paid = fm.feeDeposits.reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
    totalPaid += paid;
  }
  const totalDue = totalInvoiced - totalPaid;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Fees" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Summary */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-xl">{student.firstName} {student.lastName}</p>
              <p className="text-violet-200 text-sm">Admission No: {student.admissionNo}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-2xl font-black">₵{totalInvoiced.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Total Invoiced</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-emerald-300">₵{totalPaid.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Total Paid</p>
            </div>
            <div className="bg-white/15 rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${totalDue > 0 ? "text-rose-300" : "text-emerald-300"}`}>₵{totalDue.toLocaleString()}</p>
              <p className="text-xs text-white/70 mt-1">Outstanding</p>
            </div>
          </div>
        </div>

        {/* Fee invoices list */}
        {feeMasters.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <CreditCard className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No fee invoices found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feeMasters.map((fm: any) => {
              const paid = fm.feeDeposits.reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
              const due  = (fm.amount ?? 0) - paid;
              const fullyPaid = due <= 0;
              const session = fm.feeGroupItem?.feeSessionGroup?.session?.session ?? "—";

              return (
                <div key={fm.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${fullyPaid ? "bg-emerald-50" : "bg-rose-50"}`}>
                        {fullyPaid
                          ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          : <AlertCircle className="h-5 w-5 text-rose-500" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">
                          {fm.feeGroupItem?.feeType?.name ?? "Fee Invoice"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {fm.feeGroupItem?.feeType?.feeCategory?.name ?? ""} · {session}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-gray-900">₵{(fm.amount ?? 0).toLocaleString()}</p>
                      {fullyPaid
                        ? <p className="text-xs text-emerald-600 font-bold">Fully Paid</p>
                        : <p className="text-xs text-rose-600 font-bold">Due: ₵{due.toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Deposit history */}
                  {fm.feeDeposits.length > 0 && (
                    <div className="border-t bg-gray-50 divide-y">
                      {fm.feeDeposits.map((dep: any) => {
                        const detail = Array.isArray(dep.amountDetail) ? dep.amountDetail : [];
                        return detail.map((d: any, i: number) => (
                          <div key={`${dep.id}-${i}`} className="flex items-center justify-between px-5 py-2.5 text-xs">
                            <div className="flex items-center gap-2 text-gray-500">
                              <Receipt className="h-3.5 w-3.5 shrink-0" />
                              <span>
                                {new Date(dep.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                {dep.paymentMode ? ` · ${dep.paymentMode}` : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-700">₵{(d.amount ?? dep.amount ?? 0).toLocaleString()}</span>
                              <Link href={`/fees/receipt/${dep.id}/${d.subId ?? i}`}
                                    className="text-blue-600 hover:underline text-[10px] font-semibold">
                                Receipt
                              </Link>
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
