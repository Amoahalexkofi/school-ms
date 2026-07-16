"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, DollarSign, CheckCircle2, AlertCircle, Receipt, CreditCard, Trash2, ChevronDown, Undo2, Users } from "lucide-react";

const PAYMENT_MODES = ["CASH", "BANK_TRANSFER", "CHEQUE", "MOBILE_MONEY", "ONLINE"];
const MODE_LABELS: Record<string, string> = {
  CASH: "Cash", BANK_TRANSFER: "Bank Transfer", CHEQUE: "Cheque",
  MOBILE_MONEY: "Mobile Money (MoMo)", ONLINE: "Online",
};

const SELECT_CLS = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 transition-all outline-none hover:border-slate-300 focus-visible:border-indigo-400 focus-visible:ring-3 focus-visible:ring-indigo-500/15";

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

// Amount paid against ONE fee type (deposits keyed by feeGroupItemId) — Smart
// School collects per fee_groups_feetype.
function paidForItem(deposits: any[], itemId: string) {
  return deposits
    .filter((d) => d.feeGroupItemId === itemId)
    .reduce((s, d) => s + Object.values(d.amountDetail as Record<string, any>)
      .reduce((ds: number, v: any) => ds + Number(v?.amount ?? 0), 0), 0);
}

const money = (n: number) => `₵${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

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
  // Class context from the fees hub — keeps the fee-day loop unbroken:
  // collect → back to the still-loaded class list → next student.
  const searchParams = useSearchParams();
  const backClassId   = searchParams.get("classId");
  const backSectionId = searchParams.get("sectionId");
  const classListHref = backClassId
    ? `/fees?classId=${backClassId}${backSectionId ? `&sectionId=${backSectionId}` : ""}`
    : "/fees";
  const [payDialog,       setPayDialog]       = useState<{ master: Master; item: any; idx: number } | null>(null);
  const [amount,          setAmount]          = useState("");
  const [fine,            setFine]            = useState("");
  const [payDate,         setPayDate]         = useState(todayStr());
  const [selDiscounts,    setSelDiscounts]    = useState<string[]>([]);
  const [mode,            setMode]            = useState("CASH");
  const [desc,            setDesc]            = useState("");
  const [showMore,        setShowMore]        = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [onlineLoading,   setOnlineLoading]   = useState(false);
  const [error,           setError]           = useState("");
  const [pageError,       setPageError]       = useState("");
  const [notice,          setNotice]          = useState("");
  const [deleteTarget,    setDeleteTarget]    = useState<{ depositId: string; subInvoiceId: string } | null>(null);
  const [deleting,        setDeleting]        = useState(false);
  const [lastDepositId,   setLastDepositId]   = useState<string | null>(null);
  const [lastSubInvoice,  setLastSubInvoice]  = useState<number | null>(null);

  const studentName = `${student.firstName ?? ""} ${student.middleName ? student.middleName + " " : ""}${student.lastName ?? ""}`.trim();
  const initials = `${(student.firstName ?? "?")[0] ?? "?"}${(student.lastName ?? "?")[0] ?? ""}`;

  const grandTotal   = masters.reduce((s, m) => s + Number(m.amount), 0);
  const grandPaid    = masters.reduce((s, m) => s + computePaid(m.deposits), 0);
  const grandBalance = grandTotal - grandPaid;

  // The balance for the currently open dialog item.
  const dialogBalance = payDialog
    ? itemAmount(payDialog.master, payDialog.item, payDialog.idx) - paidForItem(payDialog.master.deposits, payDialog.item.id)
    : 0;
  const overPaying = !!payDialog && Number(amount) > dialogBalance && dialogBalance > 0;

  async function handlePay(e?: React.FormEvent) {
    e?.preventDefault();
    if (!payDialog || !amount || Number(amount) <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true); setError("");
    try {
      // Deposit is keyed by the specific fee type (Smart School fee_groups_feetype_id)
      const res  = await fetch("/api/fees/collect", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentFeesMasterId: payDialog.master.id,
          feeGroupItemId: payDialog.item?.id ?? null,
          amount: Number(amount),
          fine: Number(fine) || 0,
          paymentDate: payDate,
          paymentMode: mode,
          description: desc,
          discountIds: selDiscounts,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not record the payment. Please try again.");
      setPayDialog(null);
      setNotice("");
      setLastDepositId(data.id ?? null);
      setLastSubInvoice(data.subInvoiceId ?? 1);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function itemAmount(master: Master, item: any, idx: number) {
    // Carry-forward (system) masters store the whole balance on item[0]
    return master.isSystem && idx === 0 ? Number(master.amount) : Number(item.amount);
  }

  function openPayItem(master: Master, item: any, idx: number) {
    const balance = itemAmount(master, item, idx) - paidForItem(master.deposits, item.id);
    setAmount(balance > 0 ? String(balance.toFixed(2)) : "");
    setFine(""); setPayDate(todayStr()); setSelDiscounts([]);
    setMode("CASH"); setDesc(""); setError(""); setShowMore(false); setPayDialog({ master, item, idx });
  }

  function toggleDiscount(id: string) {
    setSelDiscounts((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  // Delete a wrong payment entry, then the collector can re-collect correctly.
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true); setPageError("");
    try {
      const res = await fetch("/api/fees/collect", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ depositId: deleteTarget.depositId, subInvoiceId: deleteTarget.subInvoiceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reverse the payment.");
      setDeleteTarget(null);
      setNotice("Payment reversed. You can record it again with the correct figure.");
      setLastDepositId(null);
      router.refresh();
    } catch (e: any) { setPageError(e.message); setDeleteTarget(null); }
    finally { setDeleting(false); }
  }

  // Preview the discount total for the entered amount (mirrors the API math)
  const discountPreview = selDiscounts.reduce((sum, id) => {
    const d = discounts.find((x) => x.id === id);
    if (!d) return sum;
    // Decimal fields arrive as strings over JSON — coerce before math
    return sum + (d.type === "percentage" ? (Number(amount) || 0) * Number(d.percentage) / 100 : Number(d.amount));
  }, 0);

  async function handlePayOnline(master: Master) {
    const paid    = computePaid(master.deposits);
    const balance = Number(master.amount) - paid;
    if (balance <= 0) return;

    setOnlineLoading(true); setPageError("");
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
      if (!res.ok) throw new Error(data.error || "Could not start the online payment.");
      setNotice("Redirecting you to the secure payment page…");
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setPageError(`Online payment error: ${e.message}`);
    } finally {
      setOnlineLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <Link href={classListHref} className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> {backClassId ? "Back to class list" : "Back to Fees"}
      </Link>

      {/* Student header — flat, neutral avatar, balance emphasized */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-start justify-between flex-wrap gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-lg" aria-hidden="true">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{studentName || "Student"}</h2>
              <p className="text-sm text-gray-500 font-mono">{student.admissionNo}</p>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-base font-semibold text-gray-600">{money(grandTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paid</p>
              <p className="text-base font-semibold text-green-600">{money(grandPaid)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Balance</p>
              <p className={`text-2xl font-bold ${grandBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                {money(grandBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page-level error / notice */}
      {pageError && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" /> {pageError}
        </div>
      )}
      {notice && !lastDepositId && (
        <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
          <Undo2 className="h-4 w-4 shrink-0 text-slate-400" /> {notice}
        </div>
      )}

      {lastDepositId && (
        <div className="flex items-center justify-between gap-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3" role="status">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" /> Payment recorded successfully.</span>
          <span className="flex items-center gap-4 shrink-0">
            <Link href={`/fees/receipt/${lastDepositId}/${lastSubInvoice ?? 1}`} target="_blank"
              className="flex items-center gap-1 font-medium text-green-800 hover:underline">
              <Receipt className="h-4 w-4" /> Print Receipt
            </Link>
            <Link href={classListHref}
              className="flex items-center gap-1.5 font-semibold text-white bg-green-700 hover:bg-green-800 px-3 py-1.5 rounded-lg transition-colors">
              <Users className="h-4 w-4" /> Collect next student →
            </Link>
          </span>
        </div>
      )}

      {masters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-gray-500">
          <DollarSign className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No fees assigned to this student yet.</p>
          <Link href="/fees/assign" className="text-indigo-600 hover:underline text-sm mt-1 inline-block">Assign fees →</Link>
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
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm">{master.feeSessionGroup.feeGroup.name}</CardTitle>
                    <p className="text-xs text-gray-500 mt-0.5">{master.feeSessionGroup.session.session}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isPaid ? "bg-green-100 text-green-700" : balance === Number(master.amount) ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {isPaid ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID"}
                    </span>
                    {!isPaid && gateway && (
                      <button disabled={onlineLoading}
                        onClick={() => handlePayOnline(master)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 disabled:opacity-50 transition-colors"
                        title={`Pay online via ${gateway.paymentType}${gateway.isSandbox ? " (test)" : ""}`}>
                        <CreditCard className="h-3.5 w-3.5" />
                        {onlineLoading ? "…" : "Pay online"}
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{money(paid)} paid</span>
                      <span>{pct}%</span>
                      <span>{money(Number(master.amount))} total</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${isPaid ? "bg-green-500" : "bg-indigo-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>

                  {/* Fee items breakdown — each fee type collected individually */}
                  <div className="overflow-x-auto -mx-1 px-1">
                    <table className="w-full text-xs tabular-nums">
                      <thead className="text-gray-500">
                        <tr>
                          <th className="text-left py-1 font-medium">Fee Type</th>
                          <th className="text-right py-1 font-medium">Amount</th>
                          <th className="text-right py-1 font-medium hidden sm:table-cell">Paid</th>
                          <th className="text-right py-1 font-medium">Balance</th>
                          <th className="text-right py-1 font-medium hidden md:table-cell">Due</th>
                          <th className="py-1" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {master.feeSessionGroup.items.map((item, idx) => {
                          const amt   = itemAmount(master, item, idx);
                          const paidI = paidForItem(master.deposits, item.id);
                          const balI  = amt - paidI;
                          return (
                            <tr key={item.id}>
                              <td className="py-2 text-gray-700">{item.feeType.name}</td>
                              <td className="py-2 text-right font-medium text-gray-900">{money(amt)}</td>
                              <td className="py-2 text-right text-green-600 hidden sm:table-cell">{money(paidI)}</td>
                              <td className={`py-2 text-right font-medium ${balI > 0 ? "text-red-600" : "text-green-600"}`}>{money(balI)}</td>
                              <td className="py-2 text-right text-gray-500 hidden md:table-cell">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                              <td className="py-2 text-right">
                                {balI > 0 && (
                                  <Button size="sm" className="h-9" onClick={() => openPayItem(master, item, idx)}>
                                    <Receipt className="h-3.5 w-3.5 mr-1" /> Collect
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment history */}
                  {master.deposits.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Payment History</p>
                      <div className="space-y-1">
                        {master.deposits.flatMap((d: any) =>
                          Object.entries(d.amountDetail as Record<string, any>).map(([subId, detail]: [string, any]) => (
                            <div key={`${d.id}-${subId}`} className="flex items-center justify-between text-xs text-gray-600">
                              <span>
                                {detail?.date} · {MODE_LABELS[detail?.payment_mode] ?? detail?.payment_mode}
                                {Number(detail?.discount) > 0 && <span className="text-indigo-600 ml-1">(disc {money(Number(detail.discount))})</span>}
                                {Number(detail?.fine) > 0 && <span className="text-amber-600 ml-1">(fine {money(Number(detail.fine))})</span>}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="font-medium text-green-600">{money(Number(detail?.amount ?? 0))}</span>
                                <button
                                  onClick={() => { setPageError(""); setDeleteTarget({ depositId: d.id, subInvoiceId: subId }); }}
                                  aria-label={`Delete payment of ${money(Number(detail?.amount ?? 0))} on ${detail?.date}`}
                                  title="Delete this payment"
                                  className="text-gray-400 hover:text-red-600 transition-colors p-0.5"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </span>
                            </div>
                          ))
                        )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {payDialog && (
            <form className="space-y-4" onSubmit={handlePay}>
              {/* Who & what — always visible (prevents wrong-student entry) */}
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-slate-900">{studentName || "Student"}</p>
                <p className="text-xs text-gray-500 font-mono">{student.admissionNo}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-700">{payDialog.item?.feeType?.name ?? payDialog.master.feeSessionGroup.feeGroup.name}</span>
                  <span className="text-xs text-gray-500">Balance <span className="font-semibold text-slate-900">{money(dialogBalance)}</span></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pay-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₵) *</label>
                  <Input id="pay-amount" type="number" min="0.01" step="0.01" value={amount} autoFocus
                    aria-invalid={overPaying || undefined}
                    onChange={e => setAmount(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="pay-mode" className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                  <select id="pay-mode" className={SELECT_CLS} value={mode} onChange={e => setMode(e.target.value)}>
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{MODE_LABELS[m]}</option>)}
                  </select>
                </div>
              </div>

              {overPaying && (
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  This is more than the {money(dialogBalance)} balance. Record anyway only if you mean to.
                </div>
              )}

              {/* Progressive disclosure: most cash payments need nothing below */}
              <button type="button" onClick={() => setShowMore(s => !s)}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700">
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMore ? "rotate-180" : ""}`} />
                {showMore ? "Fewer options" : "More options (fine, date, discount, note)"}
              </button>

              {showMore && (
                <div className="space-y-4 border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pay-fine" className="block text-sm font-medium text-gray-700 mb-1">Fine / Late Fee (₵)</label>
                      <Input id="pay-fine" type="number" min="0" step="0.01" value={fine} onChange={e => setFine(e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label htmlFor="pay-date" className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
                      <Input id="pay-date" type="date" max={todayStr()} value={payDate} onChange={e => setPayDate(e.target.value)} />
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
                            <span className="text-xs text-gray-500 ml-auto">{d.type === "percentage" ? `${d.percentage}%` : money(d.amount)}</span>
                          </label>
                        ))}
                      </div>
                      {discountPreview > 0 && (
                        <p className="text-xs text-green-600 mt-1">Discount applied: {money(discountPreview)}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="pay-desc" className="block text-sm font-medium text-gray-700 mb-1">Description / Reference</label>
                    <Input id="pay-desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" />
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processing…" : amount && Number(amount) > 0 ? `Record ${money(Number(amount))}` : "Record Payment"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reverse this payment?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            The amount will be reversed and removed from this student&apos;s record. You can record it again afterwards with the correct figure.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Keep it</Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              {deleting ? "Reversing…" : "Reverse payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
