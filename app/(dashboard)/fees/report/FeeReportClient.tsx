"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, BarChart3 } from "lucide-react";

type Row = {
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  feeGroupName: string; sessionName: string;
  amount: number; paid: number; balance: number; status: string;
};
type DailyRow = {
  date: string; studentId: string; studentName: string; admissionNo: string;
  className: string; feeGroup: string; amount: number; discount: number; fine: number;
  paymentMode: string; receivedBy: string;
};

type Props = { sessions: any[]; classSections: any[]; sessionGroups: any[] };

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";
const todayStr = () => new Date().toISOString().slice(0, 10);

export function FeeReportClient({ sessions, classSections, sessionGroups }: Props) {
  const [reportType, setReportType] = useState<"balance" | "daily">("balance");

  // Balance/Due report state
  const [fsgId,          setFsgId]     = useState("");
  const [classSectionId, setCsId]      = useState("");
  const [sessionId,      setSessionId] = useState(sessions[0]?.id ?? "");
  const [rows,           setRows]      = useState<Row[]>([]);

  // Daily collection report state
  const [from, setFrom] = useState(todayStr());
  const [to,   setTo]   = useState(todayStr());
  const [daily, setDaily] = useState<DailyRow[]>([]);

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [generated, setGenerated] = useState(false);

  async function generateBalance() {
    if (!sessionId) { setError("Select a session"); return; }
    setLoading(true); setError(""); setGenerated(false);
    try {
      const params = new URLSearchParams({ sessionId });
      if (fsgId)          params.set("fsgId",          fsgId);
      if (classSectionId) params.set("classSectionId", classSectionId);
      const res  = await fetch(`/api/fees/report?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data); setGenerated(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function generateDaily() {
    if (!from || !to) { setError("Select a date range"); return; }
    setLoading(true); setError(""); setGenerated(false);
    try {
      const res  = await fetch(`/api/fees/report/daily?from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDaily(data); setGenerated(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function switchType(t: "balance" | "daily") {
    setReportType(t); setGenerated(false); setError("");
  }

  const totalCollected = rows.reduce((s, r) => s + r.paid, 0);
  const totalDue       = rows.reduce((s, r) => s + r.balance, 0);
  const dailyTotal     = daily.reduce((s, r) => s + r.amount, 0);
  const dailyFine      = daily.reduce((s, r) => s + r.fine, 0);
  const dailyDiscount  = daily.reduce((s, r) => s + r.discount, 0);

  const STATUS_STYLE: Record<string, string> = {
    PAID:    "bg-green-100 text-green-700",
    PARTIAL: "bg-yellow-100 text-yellow-700",
    UNPAID:  "bg-red-100 text-red-700",
  };

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      {/* Report type tabs */}
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
        {([["balance", "Balance / Due"], ["daily", "Daily Collection"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => switchType(k)}
            className={`px-4 h-8 rounded-md text-xs font-semibold transition-colors ${reportType === k ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        {reportType === "balance" ? (
          <>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Balance / Due Report</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Session *</label>
                <select className={SEL} value={sessionId} onChange={e => setSessionId(e.target.value)}>
                  {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fee Group (optional)</label>
                <select className={SEL} value={fsgId} onChange={e => setFsgId(e.target.value)}>
                  <option value="">All Groups</option>
                  {sessionGroups.map((sg: any) => (
                    <option key={sg.id} value={sg.id}>{sg.feeGroup.name} ({sg.session.session})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Class / Section (optional)</label>
                <select className={SEL} value={classSectionId} onChange={e => setCsId(e.target.value)}>
                  <option value="">All Classes</option>
                  {classSections.map((cs: any) => (
                    <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Daily Collection Report</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From *</label>
                <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To *</label>
                <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </div>
          </>
        )}
        <div className="mt-4 flex gap-3">
          <Button onClick={reportType === "balance" ? generateBalance : generateDaily} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </Button>
          {generated && (rows.length > 0 || daily.length > 0) && (
            <button onClick={() => window.print()} className="text-sm text-blue-600 hover:underline">Print</button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Balance report results ── */}
      {generated && reportType === "balance" && (
        <>
          {rows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Collected", value: `₵${totalCollected.toLocaleString()}`, cls: "text-green-700" },
                { label: "Total Due",       value: `₵${totalDue.toLocaleString()}`,       cls: "text-red-700" },
                { label: "Students",        value: rows.length,                            cls: "text-gray-900" },
              ].map(({ label, value, cls }) => (
                <Card key={label}><CardContent className="pt-4">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                </CardContent></Card>
              ))}
            </div>
          )}
          {rows.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No records for the selected filters.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Student", "Adm No.", "Fee Group", "Session", "Total (₵)", "Paid (₵)", "Balance (₵)", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.student.firstName} {r.student.lastName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.student.admissionNo}</td>
                      <td className="px-4 py-3 text-gray-600">{r.feeGroupName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.sessionName}</td>
                      <td className="px-4 py-3 font-medium">₵{r.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-green-700 font-medium">₵{r.paid.toLocaleString()}</td>
                      <td className={`px-4 py-3 font-medium ${r.balance > 0 ? "text-red-600" : "text-green-600"}`}>₵{r.balance.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                      <td className="px-4 py-3"><Link href={`/fees/collect/${r.student.id}`} className="text-xs text-blue-600 hover:underline">Collect</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Daily collection results ── */}
      {generated && reportType === "daily" && (
        <>
          {daily.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Collected", value: `₵${dailyTotal.toLocaleString()}`, cls: "text-green-700" },
                { label: "Fine",      value: `₵${dailyFine.toLocaleString()}`,  cls: "text-amber-600" },
                { label: "Discount",  value: `₵${dailyDiscount.toLocaleString()}`, cls: "text-blue-600" },
                { label: "Payments",  value: daily.length,                       cls: "text-gray-900" },
              ].map(({ label, value, cls }) => (
                <Card key={label}><CardContent className="pt-4">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                </CardContent></Card>
              ))}
            </div>
          )}
          {daily.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No payments collected in this date range.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Date", "Student", "Adm No.", "Class", "Fee Group", "Mode", "Discount", "Fine", "Amount (₵)"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {daily.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{r.date}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.studentName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.admissionNo}</td>
                      <td className="px-4 py-3 text-gray-600">{r.className || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.feeGroup || "—"}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{r.paymentMode}</td>
                      <td className="px-4 py-3 text-blue-600">{r.discount ? `₵${r.discount.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 text-amber-600">{r.fine ? `₵${r.fine.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">₵{r.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
