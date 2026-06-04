"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Wallet, Users, Plus } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
  return res.json();
}

export function FinanceClient({ transactions, payrolls, incomeHeads, expenseHeads }: any) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txForm, setTxForm] = useState({ type: "INCOME", amount: "", date: new Date().toISOString().split("T")[0], headId: "", note: "" });
  const [headForm, setHeadForm] = useState({ name: "", type: "INCOME" });
  const [payrollForm, setPayrollForm] = useState({ month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()) });

  const totalIncome = transactions.filter((t: any) => t.type === "INCOME").reduce((s: number, t: any) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t: any) => t.type === "EXPENSE").reduce((s: number, t: any) => s + Number(t.amount), 0);

  async function submit(url: string, body: object) {
    setLoading(true); setError("");
    try { await post(url, body); setOpen(null); router.refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const heads = txForm.type === "INCOME" ? incomeHeads : expenseHeads;

  return (
    <main className="flex-1 p-6 space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Income</p><p className="text-2xl font-bold text-green-600">₵{totalIncome.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Expenses</p><p className="text-2xl font-bold text-red-600">₵{totalExpense.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Balance</p><p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-600"}`}>₵{(totalIncome - totalExpense).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Transactions</p><p className="text-2xl font-bold">{transactions.length}</p></CardContent></Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4 text-blue-600" /> Transactions</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setError(""); setOpen("head"); }}>+ Head</Button>
            <Button size="sm" onClick={() => { setError(""); setOpen("tx"); }}>
              <Plus className="h-4 w-4 mr-1" /> Record
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No transactions yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Type</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Head</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Note</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                </tr></thead>
                <tbody className="divide-y">
                  {transactions.map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-gray-500 text-xs">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{t.type}</span></td>
                      <td className="px-3 py-2.5 text-gray-700">{t.incomeHead?.name ?? t.expenseHead?.name ?? "—"}</td>
                      <td className="px-3 py-2.5 text-gray-500">{t.note ?? "—"}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${t.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>{t.type === "INCOME" ? "+" : "-"}₵{Number(t.amount).toLocaleString()}</td>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-purple-600" /> Payroll</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("payroll"); }}>
            <Plus className="h-4 w-4 mr-1" /> Generate
          </Button>
        </CardHeader>
        <CardContent>
          {payrolls.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No payroll generated yet.</p> : (
            <div className="space-y-4">
              {payrolls.map((p: any) => {
                const totalNet = p.entries.reduce((s: number, e: any) => s + Number(e.netSalary), 0);
                return (
                  <div key={p.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{MONTHS[p.month - 1]} {p.year}</p>
                        <p className="text-xs text-gray-500">{p.entries.length} staff · ₵{totalNet.toLocaleString()} total</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                        {p.status === "PENDING" && (
                          <Button size="sm" variant="outline" onClick={() => submit("/api/finance/payroll", { action: "markPaid", payrollId: p.id })}>Mark Paid</Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Transaction Dialog */}
      <Dialog open={open === "tx"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value, headId: "" }))}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            <div>
              <Label>Head *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={txForm.headId} onChange={e => setTxForm(f => ({ ...f, headId: e.target.value }))}>
                <option value="">Select head</option>
                {heads.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Amount (₵) *</Label><Input className="mt-1" type="number" min="0.01" step="0.01" value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} /></div>
              <div><Label>Date *</Label><Input className="mt-1" type="date" value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div><Label>Note</Label><Input className="mt-1" value={txForm.note} onChange={e => setTxForm(f => ({ ...f, note: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/finance/transactions", { ...txForm, amount: Number(txForm.amount) })}>
              {loading ? "Saving…" : "Record Transaction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Head Dialog */}
      <Dialog open={open === "head"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Account Head</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input className="mt-1" value={headForm.name} onChange={e => setHeadForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Type</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={headForm.type} onChange={e => setHeadForm(f => ({ ...f, type: e.target.value }))}>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/finance/heads", headForm)}>
              {loading ? "Creating…" : "Create Head"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Payroll Dialog */}
      <Dialog open={open === "payroll"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Payroll</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={payrollForm.month} onChange={e => setPayrollForm(f => ({ ...f, month: e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
                </select>
              </div>
              <div><Label>Year</Label><Input className="mt-1" type="number" value={payrollForm.year} onChange={e => setPayrollForm(f => ({ ...f, year: e.target.value }))} /></div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/finance/payroll", payrollForm)}>
              {loading ? "Generating…" : "Generate Payroll"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
