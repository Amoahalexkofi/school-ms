import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Users } from "lucide-react";

async function getFinanceData() {
  const [transactions, payrolls, incomeHeads, expenseHeads] = await Promise.all([
    (prisma as any).transaction.findMany({
      include: { incomeHead: true, expenseHead: true },
      orderBy: { date: "desc" },
      take: 50,
    }),
    (prisma as any).payroll.findMany({
      include: { entries: { include: { staff: true } } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 12,
    }),
    (prisma as any).incomeHead.findMany({ orderBy: { name: "asc" } }),
    (prisma as any).expenseHead.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { transactions, payrolls, incomeHeads, expenseHeads };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function FinancePage() {
  const { transactions, payrolls, incomeHeads, expenseHeads } = await getFinanceData();

  const totalIncome = transactions
    .filter((t: any) => t.type === "INCOME")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t: any) => t.type === "EXPENSE")
    .reduce((s: number, t: any) => s + Number(t.amount), 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Finance & Accounting" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">₵{totalIncome.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">₵{totalExpense.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}>
                ₵{(totalIncome - totalExpense).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Transactions</p>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" /> Transaction Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No transactions recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Head</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-600">Note</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-500 text-xs">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            t.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">
                          {t.incomeHead?.name ?? t.expenseHead?.name ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-500">{t.note ?? "—"}</td>
                        <td className={`px-3 py-2.5 text-right font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                          {t.type === "INCOME" ? "+" : "-"}₵{Number(t.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payroll */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" /> Payroll History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payrolls.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No payroll generated yet.</p>
            ) : (
              <div className="space-y-4">
                {payrolls.map((p: any) => {
                  const totalNet = p.entries.reduce((s: number, e: any) => s + Number(e.netSalary), 0);
                  return (
                    <div key={p.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{MONTHS[p.month - 1]} {p.year}</p>
                          <p className="text-xs text-gray-500">{p.entries.length} staff members</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">₵{totalNet.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            p.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="text-left py-1">Staff</th>
                              <th className="text-right py-1">Basic</th>
                              <th className="text-right py-1">Allowances</th>
                              <th className="text-right py-1">Deductions</th>
                              <th className="text-right py-1">Net</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {p.entries.map((e: any) => (
                              <tr key={e.id}>
                                <td className="py-1.5">{e.staff.firstName} {e.staff.lastName}</td>
                                <td className="text-right py-1.5">₵{Number(e.basicSalary).toLocaleString()}</td>
                                <td className="text-right py-1.5 text-green-600">+₵{Number(e.allowances).toLocaleString()}</td>
                                <td className="text-right py-1.5 text-red-600">-₵{Number(e.deductions).toLocaleString()}</td>
                                <td className="text-right py-1.5 font-semibold">₵{Number(e.netSalary).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
