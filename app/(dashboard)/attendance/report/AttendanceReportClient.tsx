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
};

type Props = { sessions: any[]; classSections: any[] };

export function AttendanceReportClient({ sessions, classSections }: Props) {
  const today  = new Date().toISOString().slice(0, 10);
  const month1 = today.slice(0, 7) + "-01";

  const [sessionId,      setSessionId]      = useState(sessions[0]?.id ?? "");
  const [classSectionId, setClassSectionId] = useState("");
  const [from,           setFrom]           = useState(month1);
  const [to,             setTo]             = useState(today);

  const [rows,      setRows]      = useState<Row[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [generated, setGenerated] = useState(false);

  async function generate() {
    if (!sessionId || !classSectionId) { setError("Select session and class/section"); return; }
    setLoading(true); setError(""); setGenerated(false);
    try {
      const res  = await fetch(`/api/attendance/report?sessionId=${sessionId}&classSectionId=${classSectionId}&from=${from}&to=${to}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows(data);
      setGenerated(true);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const selectedCS = classSections.find((cs: any) => cs.id === classSectionId);

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Attendance
      </Link>

      {/* Filter card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={sessionId} onChange={e => setSessionId(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class / Section</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              <option value="">— Select class —</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input type="date" className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input type="date" max={today} className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </Button>
          {generated && (
            <button onClick={() => window.print()}
              className="text-sm text-blue-600 hover:underline">Print / Export</button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {generated && (
        <>
          {/* Report heading */}
          <div className="text-sm text-gray-600 font-medium">
            {selectedCS ? `${selectedCS.class.name} – ${selectedCS.section.name}` : ""} &nbsp;·&nbsp; {from} to {to}
          </div>

          {rows.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-gray-400">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records for the selected period.</p>
            </CardContent></Card>
          ) : (
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
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          row.percentage >= 75 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>{row.percentage}%</span>
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
