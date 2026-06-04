"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700 border-red-200",
  PARTIAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
};

export default function FeesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialog, setPayDialog] = useState<any>(null);
  const [genDialog, setGenDialog] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [genStudent, setGenStudent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadInvoices() {
    const res = await fetch("/api/fees/invoices").catch(() => null);
    if (res?.ok) setInvoices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadInvoices();
    fetch("/api/students").then(r => r.json()).then(setStudents).catch(() => {});
  }, []);

  async function handlePay() {
    if (!payDialog || !payAmount) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/fees/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: payDialog.id, amount: Number(payAmount), method: payMethod }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPayDialog(null); setPayAmount("");
      await loadInvoices();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleGenerate() {
    if (!genStudent) return;
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/fees/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: genStudent,
          feeGroupId: "fg-term1-2026",
          dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGenDialog(false); setGenStudent("");
      await loadInvoices();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  const total = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const paid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);
  const pending = total - paid;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Management" />
      <main className="flex-1 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
          <Button size="sm" onClick={() => { setGenDialog(true); setError(""); }}>
            Generate Invoice
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">Total Invoiced</p>
            <p className="text-2xl font-bold text-gray-900">₵{total.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">Collected</p>
            <p className="text-2xl font-bold text-green-600">₵{paid.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <p className="text-xs text-gray-500 mb-1">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">₵{pending.toLocaleString()}</p>
          </CardContent></Card>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading invoices…</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No invoices yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fee Group</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Balance</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((inv: any) => {
                  const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
                  const overdue = new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {inv.student?.firstName} {inv.student?.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{inv.feeGroup?.name ?? "—"}</td>
                      <td className="px-4 py-3">₵{Number(inv.totalAmount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-600">₵{Number(inv.paidAmount).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-red-600">₵{balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[inv.status]}`}>
                          {inv.status}
                        </span>
                        {overdue && <span className="ml-1 text-xs text-red-600 font-medium">OVERDUE</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {inv.status !== "PAID" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setPayDialog(inv); setPayAmount(""); setError(""); }}
                          >
                            Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pay Dialog */}
        <Dialog open={!!payDialog} onOpenChange={(o) => !o && setPayDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            {payDialog && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Balance due: <strong>₵{(Number(payDialog.totalAmount) - Number(payDialog.paidAmount)).toLocaleString()}</strong>
                </p>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="space-y-1.5">
                  <Label>Amount (₵)</Label>
                  <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Method</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="ONLINE">Online</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handlePay} disabled={saving}>{saving ? "Saving…" : "Record Payment"}</Button>
                  <Button variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Generate Invoice Dialog */}
        <Dialog open={genDialog} onOpenChange={setGenDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <Label>Student</Label>
                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={genStudent} onChange={e => setGenStudent(e.target.value)}>
                  <option value="">Select student…</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-500">Fee group: Term 1 Fees 2026 (₵650)</p>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} disabled={saving || !genStudent}>{saving ? "Generating…" : "Generate"}</Button>
                <Button variant="outline" onClick={() => setGenDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
