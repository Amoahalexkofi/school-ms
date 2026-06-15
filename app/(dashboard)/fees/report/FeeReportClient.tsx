"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, BarChart3 } from "lucide-react";

type Row = {
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  feeGroupName: string; sessionName: string;
  amount: number; paid: number; balance: number; status: string;
};

type Props = { sessions: any[]; classSections: any[]; sessionGroups: any[] };

export function FeeReportClient({ sessions, classSections, sessionGroups }: Props) {
  const [fsgId,          setFsgId]     = useState("");
  const [classSectionId, setCsId]      = useState("");
  const [sessionId,      setSessionId] = useState(sessions[0]?.id ?? "");
  const [rows,           setRows]      = useState<Row[]>([]);
  const [loading,        setLoading]   = useState(false);
  const [error,          setError]     = useState("");
  const [generated,      setGenerated] = useState(false);

  async function generate() {
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

  const totalCollected = rows.reduce((s, r) => s + r.paid, 0);
  const totalDue       = rows.reduce((s, r) => s + r.balance, 0);

  const STATUS_STYLE: Record<string, string> = {
    PAID:    "bg-emerald-500/10 text-emerald-400",
    PARTIAL: "bg-amber-500/10 text-amber-400",
    UNPAID:  "bg-red-500/10 text-red-400",
  };

  return (
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      {/* Filter */}
      <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Generate Fee Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Session *</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sessionId} onChange={e => setSessionId(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Fee Group (optional)</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fsgId} onChange={e => setFsgId(e.target.value)}>
              <option value="">All Groups</option>
              {sessionGroups.map((sg: any) => (
                <option key={sg.id} value={sg.id}>{sg.feeGroup.name} ({sg.session.session})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Class / Section (optional)</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={classSectionId} onChange={e => setCsId(e.target.value)}>
              <option value="">All Classes</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </Button>
          {generated && rows.length > 0 && (
            <button onClick={() => window.print()} className="text-sm text-blue-400 hover:underline">Print</button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {generated && (
        <>
          {/* Summary */}
          {rows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Collected", value: `₵${totalCollected.toLocaleString()}`, cls: "text-emerald-400" },
                { label: "Total Due",       value: `₵${totalDue.toLocaleString()}`,       cls: "text-red-400" },
                { label: "Students",        value: rows.length,                            cls: "text-white/80" },
              ].map(({ label, value, cls }) => (
                <Card key={label}>
                  <CardContent className="pt-4">
                    <p className="text-xs text-white/30">{label}</p>
                    <p className={`text-2xl font-bold ${cls}`}>{value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {rows.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-white/30">
              <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No records for the selected filters.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015] border-b">
                  <tr>
                    {["Student", "Adm No.", "Fee Group", "Session", "Total (₵)", "Paid (₵)", "Balance (₵)", "Status", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r, i) => (
                    <tr key={i} className="hover:bg-[#0f1015]">
                      <td className="px-4 py-3 font-medium text-white/80">{r.student.firstName} {r.student.lastName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/40">{r.student.admissionNo}</td>
                      <td className="px-4 py-3 text-white/50">{r.feeGroupName}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">{r.sessionName}</td>
                      <td className="px-4 py-3 font-medium">₵{r.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">₵{r.paid.toLocaleString()}</td>
                      <td className={`px-4 py-3 font-medium ${r.balance > 0 ? "text-red-400" : "text-emerald-400"}`}>₵{r.balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/fees/collect/${r.student.id}`} className="text-xs text-blue-400 hover:underline">Collect</Link>
                      </td>
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
