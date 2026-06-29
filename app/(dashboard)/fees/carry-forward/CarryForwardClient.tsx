"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Props = { sessions: any[]; classSections: any[] };
type Row  = { student: { id: string; firstName: string; lastName: string; admissionNo: string }; balance: number };

export function CarryForwardClient({ sessions, classSections }: Props) {
  const [fromSessionId,      setFromSessionId]      = useState("");
  const [fromClassSectionId, setFromClassSectionId] = useState("");
  const [toSessionId,        setToSessionId]        = useState("");
  const [dueDate,            setDueDate]            = useState("");

  const [rows,        setRows]        = useState<Row[]>([]);
  const [previewing,  setPreviewing]  = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState<{ carried: number; skipped: number } | null>(null);
  const [error,       setError]       = useState("");

  async function preview() {
    if (!fromSessionId || !fromClassSectionId) { alert("Select source session and class"); return; }
    setPreviewing(true); setRows([]); setResult(null); setError("");
    try {
      const res = await fetch(
        `/api/fees/carry-forward?fromSessionId=${fromSessionId}&fromClassSectionId=${fromClassSectionId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data);
    } catch (e: any) { setError(e.message); }
    finally { setPreviewing(false); }
  }

  async function submit() {
    if (!toSessionId) { alert("Select target session"); return; }
    if (!rows.length) { alert("No balances to carry forward"); return; }
    if (!confirm(`Carry forward ${rows.length} student balance${rows.length !== 1 ? "s" : ""} to the selected session?`)) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/fees/carry-forward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSessionId, fromClassSectionId, toSessionId, dueDate: dueDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setRows([]);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  }

  const total = rows.reduce((s, r) => s + r.balance, 0);
  const fromSession = sessions.find(s => s.id === fromSessionId);
  const toSession   = sessions.find(s => s.id === toSessionId);
  const fromCS      = classSections.find(cs => cs.id === fromClassSectionId);

  return (
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/fees" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Fees
      </Link>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          ✓ Carried forward <strong>{result.carried}</strong> balance{result.carried !== 1 ? "s" : ""}.
          {result.skipped > 0 && ` ${result.skipped} skipped (already exists or student not in target session).`}
        </div>
      )}
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Step 1 — Source */}
      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Step 1 — Source Session & Class</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">From Session</label>
              <select className={SEL} value={fromSessionId} onChange={e => { setFromSessionId(e.target.value); setRows([]); }}>
                <option value="">— Select —</option>
                {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}{s.isActive ? " (Active)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">From Class / Section</label>
              <select className={SEL} value={fromClassSectionId} onChange={e => { setFromClassSectionId(e.target.value); setRows([]); }}>
                <option value="">— Select —</option>
                {classSections.map((cs: any) => <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={preview} disabled={previewing || !fromSessionId || !fromClassSectionId}>
              {previewing ? "Loading…" : "Preview Outstanding Balances"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-slate-900">
                {rows.length} student{rows.length !== 1 ? "s" : ""} with outstanding balances
              </CardTitle>
              <span className="text-sm font-semibold text-red-600">
                Total: GHS {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-gray-50 border-b border-t">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Balance (GHS)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map(r => (
                  <tr key={r.student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.student.firstName} {r.student.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.student.admissionNo}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {r.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {rows.length === 0 && fromSessionId && fromClassSectionId && !previewing && !result && (
        <p className="text-center text-sm text-gray-400 py-4">No outstanding balances found for this class in the selected session.</p>
      )}

      {/* Step 2 — Destination */}
      {rows.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Step 2 — Carry Forward To</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Target Session</label>
                <select className={SEL} value={toSessionId} onChange={e => setToSessionId(e.target.value)}>
                  <option value="">— Select —</option>
                  {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}{s.isActive ? " (Active)" : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Due Date (optional)</label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            {fromCS && fromSession && toSession && (
              <div className="mt-4 flex items-center gap-3 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800">
                <span>Carrying forward balances from <strong>{fromSession.session} · {fromCS.class.name} – {fromCS.section.name}</strong></span>
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
                <span><strong>{toSession.session}</strong></span>
              </div>
            )}

            <div className="mt-4">
              <Button
                disabled={submitting || !toSessionId}
                onClick={submit}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {submitting ? "Processing…" : `Carry Forward ${rows.length} Balance${rows.length !== 1 ? "s" : ""}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
