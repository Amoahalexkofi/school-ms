"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, CreditCard,
  Printer, AlertCircle, TrendingUp, TrendingDown, Download,
} from "lucide-react";

const MONTHS = ["","January","February","March","April","May","June",
  "July","August","September","October","November","December"];

const PAYMENT_MODES = ["CASH","BANK_TRANSFER","CHEQUE","MOBILE_MONEY","ONLINE"];

const COMMON_ALLOWANCES = ["HRA","Transport Allowance","Medical Allowance","DA","Bonus","Overtime"];
const COMMON_DEDUCTIONS = ["Income Tax","Professional Tax","PF / Pension","Loan Deduction","Absence Deduction"];

const STATUS_STYLE: Record<string, string> = {
  DRAFT:    "bg-gray-100 text-gray-700",
  APPROVED: "bg-blue-100 text-blue-700",
  PAID:     "bg-green-100 text-green-700",
};

type Allowance = { id: string; type: string; amount: number; isDeduction: boolean; calType: string };

type Payslip = {
  id: string; month: string; year: string; status: string;
  basicSalary: number; totalAllowance: number; totalDeduction: number; tax: number; netSalary: number;
  paymentMode: string | null; paymentDate: string | null; remark: string | null;
  staff: { id: string; firstName: string; lastName: string; employeeId: string; department: { name: string } | null; designation: { name: string } | null };
  allowances: Allowance[];
};

export function PayslipDetailClient({ payslip: initial }: { payslip: Payslip }) {
  const router = useRouter();
  const [payslip,     setPayslip]     = useState(initial);
  const [lineOpen,    setLineOpen]    = useState(false);
  const [lineIsDeduction, setLineIsDeduction] = useState(false);
  const [lineType,    setLineType]    = useState("");
  const [lineAmount,  setLineAmount]  = useState("");
  const [lineLoading, setLineLoading] = useState(false);
  const [lineError,   setLineError]   = useState("");
  const [payOpen,     setPayOpen]     = useState(false);
  const [payMode,     setPayMode]     = useState(payslip.paymentMode ?? "CASH");
  const [payDate,     setPayDate]     = useState(new Date().toISOString().slice(0, 10));
  const [payLoading,  setPayLoading]  = useState(false);
  const [error,       setError]       = useState("");
  const [taxInput,    setTaxInput]    = useState(String(Number(payslip.tax)));

  const isPaid     = payslip.status === "PAID";
  const isApproved = payslip.status === "APPROVED";
  const isDraft    = payslip.status === "DRAFT";
  const monthLabel = MONTHS[parseInt(payslip.month)] ?? payslip.month;

  async function refetch() {
    const res  = await fetch(`/api/payroll/${payslip.id}`);
    const data = await res.json();
    if (res.ok) setPayslip(data);
  }

  async function addLine() {
    if (!lineType.trim() || !lineAmount || Number(lineAmount) <= 0) {
      setLineError("Type and a positive amount are required"); return;
    }
    setLineLoading(true); setLineError("");
    try {
      const res = await fetch(`/api/payroll/${payslip.id}/allowances`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: lineType, amount: lineAmount, isDeduction: lineIsDeduction }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setLineOpen(false); setLineType(""); setLineAmount("");
      await refetch();
    } catch (e: any) { setLineError(e.message); }
    finally { setLineLoading(false); }
  }

  async function deleteLine(lineId: string) {
    const res = await fetch(`/api/payroll/${payslip.id}/allowances/${lineId}`, { method: "DELETE" });
    if (!res.ok) { setError((await res.json()).error); return; }
    await refetch();
  }

  async function updateTax() {
    const t = parseFloat(taxInput);
    if (isNaN(t) || t < 0) return;
    const res = await fetch(`/api/payroll/${payslip.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tax: t, recompute: true }),
    });
    if (res.ok) await refetch();
  }

  async function approve() {
    setError("");
    const res = await fetch(`/api/payroll/${payslip.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "APPROVED" }),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    await refetch();
  }

  async function markPaid() {
    setPayLoading(true); setError("");
    try {
      const res = await fetch(`/api/payroll/${payslip.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID", paymentMode: payMode, paymentDate: payDate }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setPayOpen(false); await refetch();
    } catch (e: any) { setError(e.message); }
    finally { setPayLoading(false); }
  }

  const allowances = payslip.allowances.filter(a => !a.isDeduction);
  const deductions = payslip.allowances.filter(a =>  a.isDeduction);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/payroll" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Payroll
        </Link>
        <div className="flex gap-2 items-center flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[payslip.status]}`}>{payslip.status}</span>
          {isDraft    && <Button size="sm" onClick={approve}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Approve</Button>}
          {isApproved && <Button size="sm" onClick={() => setPayOpen(true)}><CreditCard className="h-3.5 w-3.5 mr-1.5" />Mark as Paid</Button>}
          <Button size="sm" variant="outline" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5 mr-1.5" />Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open(`/payroll/${payslip.id}/print`, "_blank")}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Download PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Payslip card — print-friendly */}
      <div id="payslip-print" className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border-none">

        {/* Header */}
        <div className="bg-indigo-600 px-6 py-5 text-white print:bg-indigo-600">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">Salary Payslip</h1>
              <p className="text-indigo-200 text-sm mt-0.5">{monthLabel} {payslip.year}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-200 uppercase tracking-wide">Status</p>
              <p className="font-semibold mt-0.5">{payslip.status}</p>
            </div>
          </div>
        </div>

        {/* Employee info */}
        <div className="px-6 py-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm">
          {[
            ["Employee Name",  `${payslip.staff.firstName} ${payslip.staff.lastName}`],
            ["Employee ID",    payslip.staff.employeeId],
            ["Department",     payslip.staff.department?.name ?? "—"],
            ["Designation",    payslip.staff.designation?.name ?? "—"],
            ["Pay Period",     `${monthLabel} ${payslip.year}`],
            ["Payment Mode",   payslip.paymentMode ?? "—"],
            ["Payment Date",   payslip.paymentDate ? new Date(payslip.paymentDate).toLocaleDateString() : "—"],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Earnings + Deductions */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">

          {/* Earnings */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-600" /> Earnings
              </h3>
              {!isPaid && (
                <Button size="sm" variant="outline" onClick={() => { setLineIsDeduction(false); setLineType(""); setLineAmount(""); setLineError(""); setLineOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                <tr className="text-gray-700">
                  <td className="py-2 font-medium">Basic Salary</td>
                  <td className="py-2 text-right font-semibold">₵{Number(payslip.basicSalary ?? 0).toLocaleString()}</td>
                  <td className="w-8" />
                </tr>
                {allowances.map(a => (
                  <tr key={a.id} className="text-gray-600">
                    <td className="py-2">{a.type}</td>
                    <td className="py-2 text-right text-green-700">+ ₵{Number(a.amount).toLocaleString()}</td>
                    <td className="py-2 pl-2">
                      {!isPaid && (
                        <button onClick={() => deleteLine(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200">
                <tr>
                  <td className="pt-2 font-semibold text-gray-800">Total Earnings</td>
                  <td className="pt-2 text-right font-bold text-green-700">
                    ₵{(Number(payslip.basicSalary) + Number(payslip.totalAllowance)).toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Deductions */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-red-500" /> Deductions
              </h3>
              {!isPaid && (
                <Button size="sm" variant="outline" onClick={() => { setLineIsDeduction(true); setLineType(""); setLineAmount(""); setLineError(""); setLineOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {/* Tax row — editable */}
                <tr className="text-gray-600">
                  <td className="py-2">Tax</td>
                  <td className="py-2 text-right">
                    {!isPaid ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-400">₵</span>
                        <Input type="number" min="0" step="0.01" className="w-24 h-7 text-right text-xs"
                          value={taxInput} onChange={e => setTaxInput(e.target.value)}
                          onBlur={updateTax} />
                      </div>
                    ) : (
                      <span className="text-red-600">- ₵{Number(payslip.tax).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="w-8" />
                </tr>
                {deductions.map(a => (
                  <tr key={a.id} className="text-gray-600">
                    <td className="py-2">{a.type}</td>
                    <td className="py-2 text-right text-red-600">- ₵{Number(a.amount).toLocaleString()}</td>
                    <td className="py-2 pl-2">
                      {!isPaid && (
                        <button onClick={() => deleteLine(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200">
                <tr>
                  <td className="pt-2 font-semibold text-gray-800">Total Deductions</td>
                  <td className="pt-2 text-right font-bold text-red-600">
                    ₵{(Number(payslip.totalDeduction) + Number(payslip.tax)).toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Net salary footer */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between print:bg-indigo-600">
          <p className="text-white font-semibold text-sm">Net Salary</p>
          <p className="text-white text-2xl font-bold">₵{Number(payslip.netSalary).toLocaleString()}</p>
        </div>
      </div>

      {/* Add Line Dialog */}
      <Dialog open={lineOpen} onOpenChange={o => !o && setLineOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{lineIsDeduction ? "Add Deduction" : "Add Allowance"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(lineIsDeduction ? COMMON_DEDUCTIONS : COMMON_ALLOWANCES).map(s => (
                  <button key={s} onClick={() => setLineType(s)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${lineType === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
              <Input value={lineType} onChange={e => setLineType(e.target.value)} placeholder="Or type custom name…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₵) *</label>
              <Input type="number" min="0.01" step="0.01" value={lineAmount} onChange={e => setLineAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          {lineError && <p className="text-sm text-red-600 mt-1">{lineError}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setLineOpen(false)}>Cancel</Button>
            <Button disabled={lineLoading} onClick={addLine}>{lineLoading ? "Adding…" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog open={payOpen} onOpenChange={o => !o && setPayOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Mark as Paid</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                value={payMode} onChange={e => setPayMode(e.target.value)}>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Net Salary</span>
                <span className="font-bold text-gray-900">₵{Number(payslip.netSalary).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button disabled={payLoading} onClick={markPaid}>{payLoading ? "Processing…" : "Confirm Payment"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
