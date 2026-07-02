"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";

type Row = {
  studentId: string;
  attendancePresent: string;
  attendanceTotal: string;
  conduct: string;
  attitude: string;
  interest: string;
  classTeacherRemark: string;
  headTeacherRemark: string;
  promotedTo: string;
  nextTermBegins: string;
};

type Props = {
  group: { id: string; name: string };
  classSections: { id: string; label: string }[];
};

const CONDUCT_OPTIONS = ["Excellent", "Very Good", "Good", "Fair", "Needs Improvement"];

export function TermReportClient({ group, classSections }: Props) {
  const [classSectionId, setCsId] = useState("");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Shared apply-to-all values (next term date + promoted-to are class-wide)
  const [sharedNextTerm, setSharedNextTerm] = useState("");
  const [sharedPromotedTo, setSharedPromotedTo] = useState("");

  async function load() {
    if (!classSectionId) return;
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`/api/exams/term-report?examGroupId=${group.id}&classSectionId=${classSectionId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setEnrollments(data.enrollments);
      const m: Record<string, Row> = {};
      for (const enr of data.enrollments) {
        const sid = enr.student.id;
        const saved = data.savedMap[sid];
        const att = data.attendance[sid];
        m[sid] = {
          studentId: sid,
          attendancePresent: saved?.attendancePresent != null ? String(saved.attendancePresent) : att ? String(att.present) : "",
          attendanceTotal:   saved?.attendanceTotal   != null ? String(saved.attendanceTotal)   : att ? String(att.total)   : "",
          conduct:            saved?.conduct ?? "",
          attitude:           saved?.attitude ?? "",
          interest:           saved?.interest ?? "",
          classTeacherRemark: saved?.classTeacherRemark ?? "",
          headTeacherRemark:  saved?.headTeacherRemark ?? "",
          promotedTo:         saved?.promotedTo ?? "",
          nextTermBegins:     saved?.nextTermBegins ? String(saved.nextTermBegins).slice(0, 10) : "",
        };
      }
      setRows(m);
      setLoaded(true);
    } catch (e: any) {
      setMessage({ kind: "err", text: e.message });
    } finally {
      setLoading(false);
    }
  }

  function setRow(sid: string, field: keyof Row, value: string) {
    setRows(r => ({ ...r, [sid]: { ...r[sid], [field]: value } }));
  }

  function applyShared() {
    setRows(r => {
      const next = { ...r };
      for (const sid in next) {
        next[sid] = {
          ...next[sid],
          ...(sharedNextTerm ? { nextTermBegins: sharedNextTerm } : {}),
          ...(sharedPromotedTo ? { promotedTo: sharedPromotedTo } : {}),
        };
      }
      return next;
    });
  }

  async function save() {
    setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/exams/term-report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examGroupId: group.id, records: Object.values(rows) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setMessage({ kind: "ok", text: "Saved — these details will print on the report cards." });
    } catch (e: any) {
      setMessage({ kind: "err", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`/exams/${group.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        {loaded && enrollments.length > 0 && (
          <Button disabled={saving} onClick={save}>
            <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save All"}
          </Button>
        )}
      </div>

      {/* Class selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-end gap-4 flex-wrap">
        <div className="flex-1 max-w-xs">
          <label htmlFor="tr-class" className="block text-xs font-medium text-gray-600 mb-1">Class / Section</label>
          <select
            id="tr-class"
            className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={classSectionId} onChange={e => setCsId(e.target.value)}
          >
            <option value="">— Select —</option>
            {classSections.map(cs => (
              <option key={cs.id} value={cs.id}>{cs.label}</option>
            ))}
          </select>
        </div>
        <Button disabled={loading || !classSectionId} onClick={load}>
          {loading ? "Loading…" : "Load Students"}
        </Button>
      </div>

      {message && (
        <div
          role="status"
          className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 border ${
            message.kind === "ok"
              ? "text-emerald-800 bg-emerald-50 border-emerald-200"
              : "text-rose-700 bg-rose-50 border-rose-200"
          }`}
        >
          {message.kind === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {message.text}
        </div>
      )}

      {loaded && enrollments.length > 0 && (
        <>
          {/* Class-wide values */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-end gap-4 flex-wrap">
            <div>
              <label htmlFor="tr-next-term" className="block text-xs font-medium text-gray-600 mb-1">Next term begins</label>
              <input
                id="tr-next-term" type="date"
                value={sharedNextTerm} onChange={e => setSharedNextTerm(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div>
              <label htmlFor="tr-promoted" className="block text-xs font-medium text-gray-600 mb-1">Promoted to (end of year)</label>
              <input
                id="tr-promoted" type="text" placeholder="e.g. Basic 5"
                value={sharedPromotedTo} onChange={e => setSharedPromotedTo(e.target.value)}
                className="h-9 w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <Button variant="outline" onClick={applyShared} disabled={!sharedNextTerm && !sharedPromotedTo}>
              Apply to all students
            </Button>
            <p className="text-xs text-gray-400 basis-full">
              Attendance is pre-filled from the register — adjust any student before saving.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-40">Student</th>
                  <th className="text-center px-2 py-3 font-medium text-gray-600">Attendance<br /><span className="text-[10px] font-normal text-gray-400">present / total</span></th>
                  <th className="text-left px-2 py-3 font-medium text-gray-600">Conduct</th>
                  <th className="text-left px-2 py-3 font-medium text-gray-600">Attitude</th>
                  <th className="text-left px-2 py-3 font-medium text-gray-600">Interest</th>
                  <th className="text-left px-2 py-3 font-medium text-gray-600 min-w-44">Class teacher&rsquo;s remarks</th>
                  <th className="text-left px-2 py-3 font-medium text-gray-600 min-w-44">Head teacher&rsquo;s remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {enrollments.map((enr, idx) => {
                  const s = enr.student;
                  const row = rows[s.id];
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50 align-top">
                      <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-medium text-gray-900">
                          {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                        </span>
                        <span className="block font-mono text-[11px] text-gray-500">{s.admissionNo}</span>
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number" min="0" aria-label={`Days present for ${s.firstName} ${s.lastName}`}
                            value={row?.attendancePresent ?? ""}
                            onChange={e => setRow(s.id, "attendancePresent", e.target.value)}
                            className="w-14 h-8 rounded border border-gray-200 px-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                          <span className="text-gray-400">/</span>
                          <input
                            type="number" min="0" aria-label={`Total school days for ${s.firstName} ${s.lastName}`}
                            value={row?.attendanceTotal ?? ""}
                            onChange={e => setRow(s.id, "attendanceTotal", e.target.value)}
                            className="w-14 h-8 rounded border border-gray-200 px-1.5 text-center text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </div>
                      </td>
                      {(["conduct", "attitude", "interest"] as const).map(field => (
                        <td key={field} className="px-2 py-2.5">
                          <input
                            type="text" list="tr-conduct-options"
                            aria-label={`${field} for ${s.firstName} ${s.lastName}`}
                            value={row?.[field] ?? ""}
                            onChange={e => setRow(s.id, field, e.target.value)}
                            className="w-28 h-8 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2.5">
                        <input
                          type="text" placeholder="e.g. Hardworking; keep it up"
                          aria-label={`Class teacher's remarks for ${s.firstName} ${s.lastName}`}
                          value={row?.classTeacherRemark ?? ""}
                          onChange={e => setRow(s.id, "classTeacherRemark", e.target.value)}
                          className="w-44 h-8 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <input
                          type="text" placeholder="optional"
                          aria-label={`Head teacher's remarks for ${s.firstName} ${s.lastName}`}
                          value={row?.headTeacherRemark ?? ""}
                          onChange={e => setRow(s.id, "headTeacherRemark", e.target.value)}
                          className="w-44 h-8 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <datalist id="tr-conduct-options">
              {CONDUCT_OPTIONS.map(o => <option key={o} value={o} />)}
            </datalist>

            <div className="border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
              <span className="text-xs text-gray-400">{enrollments.length} students</span>
              <Button disabled={saving} onClick={save}>
                <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save All"}
              </Button>
            </div>
          </div>
        </>
      )}

      {loaded && enrollments.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-sm">No students enrolled in this class for the exam&rsquo;s session.</p>
        </div>
      )}
    </main>
  );
}
