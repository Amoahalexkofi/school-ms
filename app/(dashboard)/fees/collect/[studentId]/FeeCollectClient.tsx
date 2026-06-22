"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, DollarSign, CheckCircle2, AlertCircle, Receipt, CreditCard, ExternalLink } from "lucide-react";

const PAYMENT_MODES = ["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "ONLINE"];

type Master = {
  id: string; amount: number; isSystem: boolean;
  feeSessionGroup: {
    feeGroup: { name: string }; session: { session: string };
    items: { id: string; amount: number; feeType: { name: string; code: string }; dueDate: string | null }[];
  };
  deposits: { amountDetail: Record<string, any> }[];
};

function computePaid(deposits: any[]) {
  return deposits.reduce((s, d) => {
    return s + Object.values(d.amountDetail as Record<string, any>)
      .reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0), 0);
  }, 0);
}

type Discount = { id: string; name: string; type: string; percentage: number; amount: number };
type Props = {
  student: any;
  masters: Master[];
  gateway: { paymentType: string; isSandbox: boolean } | null;
  discounts?: Discount[];
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function FeeCollectClient({ student, masters, gateway, discounts = [] }: Props) {
  const router = useRouter();
  const [payDialog,       setPayDialog]       = useState<{ master: Master } | null>(null);
  const [amount,          setAmount]          = useState("");
  const [fine,            setFine]            = useState("");
  const [payDate,         setPayDate]         = useState(todayStr());
  const [selDiscounts,    setSelDiscounts]    = useState<string[]>([]);
  const [mode,            setMode]            = useState("CASH");
  const [desc,            setDesc]            = useState("");
  const [loading,         setLoading]         = useState(false);
  const [onlineLoading,   setOnlineLoading]   = useState(false);
  const [error,           setError]           = useState("");
  const [lastDepositId,   setLastDepositId]   = useState<string | null>(null);
  const [lastSubInvoice,  setLastSubInvoice]  = useState<number | null>(null);

  const grandTotal   = masters.reduce((s, m) => s + Number(m.amount), 0);
  const grandPaid    = masters.reduce((s, m) => s + computePaid(m.deposits), 0);
  const grandBalance = grandTotal - grandPaid;

  async function handlePay() {
    if (!payDialog || !amount || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true); setError("");
    try {
      // Pass the first feeGroupItemId (Smart School fee_deposit uses item-level keying)
    const firstItemId = payDialog.master.feeSessionGroup.items[0]?.id ?? null;
    const res  = await fetch("/api/fees/collect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeesMasterId: payDialog.master.id,
          feeGroupItemId: firstItemId,
          amount: Number(amount),
          fine: Number(fine) || 0,
          paymentDate: payDate,
          paymentMode: mode,
          description: desc,
          discountIds: selDiscounts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPayDialog(null);
      setLastDepositId(data.id ?? null);
      setLastSubInvoice(data.subInvoiceId ?? 1);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function openPay(master: Master) {
    const paid    = computePaid(master.deposits);
    const balance = Number(master.amount) - paid;
    setAmount(balance > 0 ? String(balance.toFixed(2)) : "");
    setFine(""); setPayDate(todayStr()); setSelDiscounts([]);
    setMode("CASH"); setDesc(""); setError(""); setPayDialog({ master });
  }

  function toggleDiscount(id: string) {
    setSelDiscounts((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  // Preview the discount total for the entered amount (mirrors the API math)
  const discountPreview = selDiscounts.reduce((sum, id) => {
    const d = discounts.find((x) => x.id === id);
    if (!d) return sum;
    return sum + (d.type === "percentage" ? (Number(amount) || 0) * d.percentage / 100 : d.amount);
  }, 0);

  async function handlePayOnline(master: Master) {
    const paid    = computePaid(master.deposits);
    const balance = Number(master.amount) - paid;
    if (balance <= 0) return;

    setOnlineLoading(true);
    try {
      const res = await fetch("/api/fees/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeesMasterId: master.id,
          feeGroupItemId:      master.feeSessionGroup.items[0]?.id ?? null,
          amount:              balance,
          studentEmail:        student.email ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      alert(`Online payment error: ${e.message}`);
    } finally {
      setOnlineLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      {/* Student header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
              {student.firstName[0]}{(student.lastName ?? "?")[0]}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {student.firstName} {student.middleName ? student.middleName + " " : ""}{student.lastName}
              </h2>
              <p className="text-sm text-gray-400 font-mono">{student.admissionNo}</p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900">₵{grandTotal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Paid</p>
              <p className="text-xl font-bold text-green-600">₵{grandPaid.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Balance</p>
              <p className={`text-xl font-bold ${grandBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                ₵{grandBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {lastDepositId && (
        <div className="flex items-center justify-between text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Payment recorded successfully.</span>
          <Link href={`/fees/receipt/${lastDepositId}/${lastSubInvoice ?? 1}`} target="_blank"
            className="flex items-center gap-1 font-medium text-green-800 hover:underline">
            <Receipt className="h-4 w-4" /> Print Receipt
          </Link>
        </div>
      )}

      {masters.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No fees assigned to this student yet.</p>
          <Link href="/fees/assign" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Assign fees →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {masters.map((master) => {
            const paid    = computePaid(master.deposits);
            const balance = Number(master.amount) - paid;
            const pct     = Number(master.amount) > 0 ? Math.round((paid / Number(master.amount)) * 100) : 0;
            const isPaid  = balance <= 0;

            return (
              <Card key={master.id}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-gray-800">
                      {master.feeSessionGroup.feeGroup.name}
                    </CardTitle>
                    <p className="text-xs text-gray-400 mt-0.5">{master.feeSessionGroup.session.session}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isPaid ? "bg-green-100 text-green-700" : balance === Number(master.amount) ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {isPaid ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID"}
                    </span>
                    {!isPaid && (
                      <>
                        <Button size="sm" onClick={() => openPay(master)}>
                          <Receipt className="h-3.5 w-3.5 mr-1" /> Collect
                        </Button>
                        {gateway && (
                          <Button size="sm" variant="outline" disabled={onlineLoading}
                            onClick={() => handlePayOnline(master)}
                            title={`Pay online via ${gateway.paymentType}${gateway.isSandbox ? " (test)" : ""}`}>
                            <CreditCard className="h-3.5 w-3.5 mr-1" />
                            {onlineLoading ? "…" : "Pay Online"}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>₵{paid.toLocaleString()} paid</span>
                      <span>{pct}%</span>
                      <span>₵{Number(master.amount).toLocaleString()} total</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${isPaid ? "bg-green-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Fee items breakdown */}
                  <table className="w-full text-xs">
                    <thead className="text-gray-400">
                      <tr>
                        <th className="text-left py-1">Fee Type</th>
                        <th className="text-right py-1">Amount</th>
                        <th className="text-right py-1">Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {master.feeSessionGroup.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-1.5 text-gray-700">{item.feeType.name}</td>
                          <td className="py-1.5 text-right font-medium text-gray-900">
                            {/* Smart School: for system (carry-forward) masters, item[0].amount = master.amount */}
                            ₵{(master.isSystem && idx === 0 ? Number(master.amount) : Number(item.amount)).toLocaleString()}
                          </td>
                          <td className="py-1.5 text-right text-gray-400">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Payment history */}
                  {master.deposits.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium text-gray-500 mb-2">Payment History</p>
                      <div className="space-y-1">
                        {master.deposits.map((d: any, i) => {
                          const detail = Object.values(d.amountDetail as Record<string, any>)[0] as any;
                          return (
                            <div key={i} className="flex justify-between text-xs text-gray-600">
                              <span>{detail?.date} · {detail?.payment_mode}</span>
                              <span className="font-medium text-green-600">₵{Number(detail?.amount ?? 0).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={!!payDialog} onOpenChange={o => !o && setPayDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-800">{payDialog.master.feeSessionGroup.feeGroup.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Balance: ₵{(Number(payDialog.master.amount) - computePaid(payDialog.master.deposits)).toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₵) *</label>
                  <Input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fine / Late Fee (₵)</label>
                  <Input type="number" min="0" step="0.01" value={fine} onChange={e => setFine(e.target.value)} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                  <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    value={mode} onChange={e => setMode(e.target.value)}>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>

              {discounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounts</label>
                  <div className="space-y-1.5 border border-slate-200 rounded-lg p-2.5 max-h-32 overflow-y-auto">
                    {discounts.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={selDiscounts.includes(d.id)} onChange={() => toggleDiscount(d.id)} />
                        <span className="text-gray-700">{d.name}</span>
                        <span className="text-xs text-gray-400 ml-auto">{d.type === "percentage" ? `${d.percentage}%` : `₵${d.amount}`}</span>
                      </label>
                    ))}
                  </div>
                  {discountPreview > 0 && (
                    <p className="text-xs text-green-600 mt-1">Discount applied: ₵{discountPreview.toFixed(2)}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Reference</label>
                <Input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
                <Button disabled={loading} onClick={handlePay}>{loading ? "Processing…" : "Record Payment"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
