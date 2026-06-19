import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CreditCard, CheckCircle2, AlertCircle, Users, Receipt } from "lucide-react";
import Link from "next/link";

export default async function ParentFeesPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const user = session.user as any;
  const db = await getDb();

  const parentUser = await (db as any).user.findUnique({ where: { id: user.id } });
  const childIds = (parentUser?.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);

  if (childIds.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Fee Statement" />
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No children linked to your account.</p>
          </div>
        </main>
      </div>
    );
  }

  const children = await Promise.all(childIds.map(async (id: string) => {
    const student = await (db as any).student.findUnique({ where: { id } });
    if (!student) return null;
    const feeMasters = await (db as any).studentFeesMaster.findMany({
      where: { studentId: id, isSystem: false },
      include: {
        feeSessionGroup: { include: { session: true } },
        deposits: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    let totalInv = 0, totalPaid = 0;
    for (const fm of feeMasters) {
      const amt = Number(fm.amount ?? 0);
      totalInv  += amt;
      totalPaid += fm.deposits.reduce((s: number, d: any) => {
        const detail = Array.isArray(d.amountDetail) ? d.amountDetail : Object.values(d.amountDetail ?? {});
        return s + detail.reduce((ds: number, dd: any) => ds + Number(dd?.amount ?? 0), 0);
      }, 0);
    }
    return { student, feeMasters, totalInv, totalPaid, totalDue: totalInv - totalPaid };
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Statement" />
      <main className="flex-1 p-4 md:p-6 space-y-8 max-w-4xl mx-auto w-full">
        {children.map((data, idx) => {
          if (!data) return null;
          const { student, feeMasters, totalInv, totalPaid, totalDue } = data;
          const totalInvNum = Number(totalInv);
          const totalPaidNum = Number(totalPaid);
          const totalDueNum = Number(totalDue);
          return (
            <div key={childIds[idx]}>
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">{student.firstName[0]}{student.lastName?.[0]}</div>
                  <div>
                    <p className="font-black text-lg">{student.firstName} {student.lastName}</p>
                    <p className="text-violet-200 text-sm">Adm: {student.admissionNo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xl font-black">₵{totalInvNum.toLocaleString()}</p>
                    <p className="text-xs text-white/70 mt-0.5">Invoiced</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className="text-xl font-black text-emerald-300">₵{totalPaidNum.toLocaleString()}</p>
                    <p className="text-xs text-white/70 mt-0.5">Paid</p>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${totalDueNum > 0 ? "text-rose-300" : "text-emerald-300"}`}>₵{totalDueNum.toLocaleString()}</p>
                    <p className="text-xs text-white/70 mt-0.5">Outstanding</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {feeMasters.map((fm: any) => {
                  const paid = fm.deposits.reduce((s: number, d: any) => {
                    const detail = Array.isArray(d.amountDetail) ? d.amountDetail : Object.values(d.amountDetail ?? {});
                    return s + detail.reduce((ds: number, dd: any) => ds + Number(dd?.amount ?? 0), 0);
                  }, 0);
                  const amt  = Number(fm.amount ?? 0);
                  const due  = amt - paid;
                  const full = due <= 0;
                  return (
                    <div key={fm.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3.5 gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${full ? "bg-emerald-50" : "bg-rose-50"}`}>
                            {full ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">{fm.feeSessionGroup?.name ?? "Fee Invoice"}</p>
                            <p className="text-xs text-gray-400">{fm.feeSessionGroup?.session?.session ?? "—"}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-gray-900">₵{amt.toLocaleString()}</p>
                          {full ? <p className="text-xs text-emerald-600 font-bold">Paid</p> : <p className="text-xs text-rose-600 font-bold">Due ₵{due.toLocaleString()}</p>}
                        </div>
                      </div>
                      {fm.deposits.length > 0 && (
                        <div className="border-t bg-gray-50 divide-y">
                          {fm.deposits.map((dep: any) => {
                            const detail = Array.isArray(dep.amountDetail) ? dep.amountDetail : Object.values(dep.amountDetail ?? {});
                            return detail.map((d: any, i: number) => (
                              <div key={`${dep.id}-${i}`} className="flex items-center justify-between px-5 py-2 text-xs">
                                <span className="text-gray-500 flex items-center gap-1.5">
                                  <Receipt className="h-3 w-3" />
                                  {new Date(dep.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-700">₵{Number(d?.amount ?? 0).toLocaleString()}</span>
                                  <Link href={`/fees/receipt/${dep.id}/${d.subId ?? i}`} className="text-blue-600 hover:underline text-[10px] font-semibold">Receipt</Link>
                                </div>
                              </div>
                            ));
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {feeMasters.length === 0 && <p className="text-center py-6 text-sm text-gray-400">No fee records found.</p>}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
