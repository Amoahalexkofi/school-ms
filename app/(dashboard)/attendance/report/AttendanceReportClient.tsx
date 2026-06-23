"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, ClipboardList } from "lucide-react";

type Row = {
  student: { id: string; firstName: string; lastName: string; admissionNo: string };
  rollNo: string | null;
  total: number; present: number; late: number; absent: number; halfDay: number; holiday: number;
  schoolDays: number; percentage: number;
  days?: Record<number, string>;
};

type Props = { sessions: any[]; classSections: any[] };

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";
const CELL: Record<string, string> = {
  P: "bg-green-100 text-green-700", A: "bg-red-100 text-red-700", L: "bg-yellow-100 text-yellow-700",
  F: "bg-orange-100 text-orange-700", H: "bg-blue-100 text-blue-700",
};

export function AttendanceReportClient({ sessions, classSections }: Props) {
  const today  = new Date().toISOString().slice(0, 10);
  const month1 = today.slice(0, 7) + "-01";

  const [mode,           setMode]            = useState<"summary" | "monthly">("summary");
  const [sessionId,      setSessionId]      = useState(sessions[0]?.id ?? "");
  const [classSectionId, setClassSectionId] = useState("");
  const [from,           setFrom]           = useState(month1);
  const [to,             setTo]             = useState(today);
  const [month,          setMonth]          = useState(today.slice(0, 7));

  const [rows,        setRows]        = useState<Row[]>([]);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [generated,   setGenerated]   = useState(false);

  async function generate() {
    if (!sessionId || !classSectionId) { setError("Select session and class/section"); return; }
    setLoading(true); setError(""); setGenerated(false);
    try {
      const qs = mode === "monthly"
        ? `month=${month}`
        : `from=${from}&to=${to}`;
      const res  = await fetch(`/api/attendance/report?sessionId=${sessionId}&classSectionId=${classSectionId}&${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (mode === "monthly") { setRows(data.rows ?? []); setDaysInMonth(data.daysInMonth ?? 0); }
      else { setRows(data); }
      setGenerated(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function switchMode(m: "summary" | "monthly") { setMode(m); setGenerated(false); }

  const selectedCS = classSections.find((cs: any) => cs.id === classSectionId);
  const dayCols = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Attendance
      </Link>

      {/* Mode tabs */}
      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white">
        {([["summary", "Summary"], ["monthly", "Monthly Grid"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => switchMode(k)}
            className={`px-4 h-8 rounded-md text-xs font-semibold transition-colors ${mode === k ? "bg-indigo-600 text-white" : "text-slate-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
            <select className={SEL} value={sessionId} onChange={e => setSessionId(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class / Section</label>
            <select className={SEL} value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              <option value="">— Select class —</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          {mode === "summary" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                <input type="date" className={SEL} value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <input type="date" max={today} className={SEL} value={to} onChange={e => setTo(e.target.value)} />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
              <input type="month" max={today.slice(0, 7)} className={SEL} value={month} onChange={e => setMonth(e.target.value)} />
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate Report"}</Button>
          {generated && <button onClick={() => window.print()} className="text-sm text-blue-600 hover:underline">Print / Export</button>}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {generated && (
        <>
          <div className="text-sm text-gray-600 font-medium">
            {selectedCS ? `${selectedCS.class.name} – ${selectedCS.section.name}` : ""} &nbsp;·&nbsp; {mode === "monthly" ? month : `${from} to ${to}`}
          </div>

          {rows.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-gray-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records for the selected period.</p>
            </CardContent></Card>
          ) : mode === "summary" ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto print:shadow-none">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Roll</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                    <th className="text-center px-3 py-3 font-medium text-green-700">P</th>
                    <th className="text-center px-3 py-3 font-medium text-red-700">A</th>
                    <th className="text-center px-3 py-3 font-medium text-yellow-700">L</th>
                    <th className="text-center px-3 py-3 font-medium text-orange-700">F</th>
                    <th className="text-center px-3 py-3 font-medium text-blue-700">H</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Days</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, idx) => (
                    <tr key={row.student.id} className={`hover:bg-gray-50 ${row.percentage < 75 ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{row.rollNo ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/students/${row.student.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                          {row.student.firstName} {row.student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{row.student.admissionNo}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-green-700">{row.present}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-red-700">{row.absent}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-yellow-700">{row.late}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-orange-700">{row.halfDay}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-blue-700">{row.holiday}</td>
                      <td className="px-3 py-2.5 text-center text-gray-600">{row.schoolDays}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.percentage >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto print:shadow-none">
              <table className="text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[150px]">Student</th>
                    {dayCols.map(d => <th key={d} className="px-1.5 py-2 font-medium text-gray-500 text-center w-7">{d}</th>)}
                    <th className="px-3 py-2 font-medium text-gray-600 text-center">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map(row => (
                    <tr key={row.student.id} className="hover:bg-gray-50">
                      <td className="px-3 py-1.5 sticky left-0 bg-white font-medium text-gray-800 whitespace-nowrap">
                        {row.student.firstName} {row.student.lastName}
                      </td>
                      {dayCols.map(d => {
                        const k = row.days?.[d];
                        return (
                          <td key={d} className="px-0.5 py-1 text-center">
                            {k ? <span className={`inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold ${CELL[k] ?? "bg-gray-100 text-gray-500"}`}>{k}</span> : <span className="text-gray-200">·</span>}
                          </td>
                        );
                      })}
                      <td className="px-3 py-1.5 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${row.percentage >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{row.percentage}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 border-t flex flex-wrap gap-3 text-[10px] text-gray-500">
                {Object.entries(CELL).map(([k, c]) => (
                  <span key={k} className="flex items-center gap-1"><span className={`inline-block w-4 h-4 leading-4 rounded text-center font-bold ${c}`}>{k}</span> {({ P: "Present", A: "Absent", L: "Late", F: "Half-day", H: "Holiday" } as any)[k]}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
