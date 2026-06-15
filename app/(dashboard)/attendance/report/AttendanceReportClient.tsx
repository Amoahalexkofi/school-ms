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
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">
      <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Attendance
      </Link>

      {/* Filter card */}
      <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm p-5">
        <h2 className="text-sm font-semibold text-white/70 mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Session</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sessionId} onChange={e => setSessionId(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">Class / Section</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              <option value="">— Select class —</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">From</label>
            <input type="date" className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1">To</label>
            <input type="date" max={today} className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={to} onChange={e => setTo(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating…" : "Generate Report"}
          </Button>
          {generated && (
            <button onClick={() => window.print()}
              className="text-sm text-blue-400 hover:underline">Print / Export</button>
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
          {/* Report heading */}
          <div className="text-sm text-white/50 font-medium">
            {selectedCS ? `${selectedCS.class.name} – ${selectedCS.section.name}` : ""} &nbsp;·&nbsp; {from} to {to}
          </div>

          {rows.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-white/30">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No attendance records for the selected period.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto print:shadow-none">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015] border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Roll</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Adm No.</th>
                    <th className="text-center px-3 py-3 font-medium text-emerald-400">P</th>
                    <th className="text-center px-3 py-3 font-medium text-red-400">A</th>
                    <th className="text-center px-3 py-3 font-medium text-amber-400">L</th>
                    <th className="text-center px-3 py-3 font-medium text-orange-400">F</th>
                    <th className="text-center px-3 py-3 font-medium text-blue-400">H</th>
                    <th className="text-center px-3 py-3 font-medium text-white/50">Days</th>
                    <th className="text-center px-4 py-3 font-medium text-white/50">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row, idx) => (
                    <tr key={row.student.id} className={`hover:bg-[#0f1015] ${row.percentage < 75 ? "bg-red-500/10/40" : ""}`}>
                      <td className="px-4 py-2.5 text-white/30 text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5 text-white/40 text-xs font-mono">{row.rollNo ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <Link href={`/students/${row.student.id}`} className="font-medium text-white/80 hover:text-blue-400 hover:underline">
                          {row.student.firstName} {row.student.lastName}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-white/40">{row.student.admissionNo}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-emerald-400">{row.present}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-red-400">{row.absent}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-amber-400">{row.late}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-orange-400">{row.halfDay}</td>
                      <td className="px-3 py-2.5 text-center font-medium text-blue-400">{row.holiday}</td>
                      <td className="px-3 py-2.5 text-center text-white/50">{row.schoolDays}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          row.percentage >= 75 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
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
