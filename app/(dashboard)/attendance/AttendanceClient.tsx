"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CheckCheck, AlertCircle, Save, ClipboardList } from "lucide-react";
import Link from "next/link";

type AttendanceType = { id: string; type: string; keyValue: string; nameStyle: string };
type Enrollment     = { id: string; rollNo: string | null; student: { id: string; firstName: string; middleName: string | null; lastName: string | null; admissionNo: string; gender: string | null } };
type Props = { sessions: any[]; classSections: any[]; attendanceTypes: AttendanceType[] };

// keyValue → Tailwind classes
const KV_STYLE: Record<string, string> = {
  P:  "bg-green-100  text-green-700  border-green-300",
  A:  "bg-red-100    text-red-700    border-red-300",
  L:  "bg-yellow-100 text-yellow-700 border-yellow-300",
  H:  "bg-blue-100   text-blue-700   border-blue-300",
  F:  "bg-orange-100 text-orange-700 border-orange-300",
};

export function AttendanceClient({ sessions, classSections, attendanceTypes }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [sessionId,      setSessionId]      = useState(sessions[0]?.id ?? "");
  const [classSectionId, setClassSectionId] = useState("");
  const [date,           setDate]           = useState(today);

  const [enrollments,    setEnrollments]    = useState<Enrollment[]>([]);
  const [marks,          setMarks]          = useState<Record<string, string>>({}); // studentSessionId → attendanceTypeId
  const [remarks,        setRemarks]        = useState<Record<string, string>>({}); // studentSessionId → remark

  const [loadState,  setLoadState]  = useState<"idle" | "loading" | "loaded">("idle");
  const [saveState,  setSaveState]  = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error,      setError]      = useState("");
  const [alreadySaved, setAlreadySaved] = useState(false);

  const presentType = attendanceTypes.find(t => t.keyValue === "P");

  async function loadStudents() {
    if (!sessionId || !classSectionId || !date) return;
    setLoadState("loading"); setError(""); setSaveState("idle");
    try {
      const res  = await fetch(`/api/attendance?classSectionId=${classSectionId}&sessionId=${sessionId}&date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEnrollments(data.enrollments);
      setAlreadySaved(!!data.attendanceDayId);

      // Pre-fill: existing marks if already saved, else default all to Present
      const m: Record<string, string> = {};
      const r: Record<string, string> = {};
      for (const enr of data.enrollments) {
        const existing = data.existing[enr.id];
        m[enr.id] = existing ? existing.attendanceTypeId : (presentType?.id ?? attendanceTypes[0]?.id ?? "");
        r[enr.id] = existing?.remark ?? "";
      }
      setMarks(m); setRemarks(r);
      setLoadState("loaded");
    } catch (e: any) {
      setError(e.message); setLoadState("idle");
    }
  }

  function markAll(typeId: string) {
    const m: Record<string, string> = {};
    for (const enr of enrollments) m[enr.id] = typeId;
    setMarks(m);
  }

  async function handleSave() {
    setSaveState("saving"); setError("");
    try {
      const records = enrollments.map(enr => ({
        studentId:        enr.student.id,
        studentSessionId: enr.id,
        attendanceTypeId: marks[enr.id] ?? presentType?.id,
        remark:           remarks[enr.id] || null,
      }));
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classSectionId, sessionId, date, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveState("saved"); setAlreadySaved(true);
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (e: any) {
      setError(e.message); setSaveState("error");
    }
  }

  // Summary counts
  const counts = attendanceTypes.reduce((acc, t) => {
    acc[t.id] = Object.values(marks).filter(v => v === t.id).length;
    return acc;
  }, {} as Record<string, number>);

  const selectedCS = classSections.find((cs: any) => cs.id === classSectionId);

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50 min-h-0">

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Session</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={sessionId} onChange={e => setSessionId(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Class / Section</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              <option value="">— Select class —</option>
              {classSections.map((cs: any) => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" max={today}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <Button onClick={loadStudents} disabled={!classSectionId || !sessionId || loadState === "loading"}>
            {loadState === "loading" ? "Loading…" : "Load Students"}
          </Button>
          <Link href="/attendance/report">
            <Button variant="outline"><ClipboardList className="h-4 w-4 mr-1.5" />Reports</Button>
          </Link>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Loaded state ── */}
      {loadState === "loaded" && (
        <>
          {/* Summary + actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Counts */}
            <div className="flex gap-3 flex-wrap">
              {attendanceTypes.map(t => (
                <div key={t.id} className={`px-4 py-2 rounded-lg border text-sm font-medium ${KV_STYLE[t.keyValue] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  <span className="text-lg font-bold mr-1">{counts[t.id] ?? 0}</span>
                  {t.type}
                </div>
              ))}
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {alreadySaved && (
                <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                  Attendance already saved — saving again will update it
                </span>
              )}
              <div className="flex gap-1">
                <span className="text-xs text-gray-500 self-center mr-1">Mark all:</span>
                {attendanceTypes.filter(t => t.keyValue !== "H").map(t => (
                  <button key={t.id} onClick={() => markAll(t.id)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium transition-colors ${KV_STYLE[t.keyValue] ?? ""}`}>
                    {t.keyValue}
                  </button>
                ))}
              </div>
              <Button onClick={handleSave} disabled={saveState === "saving"} className="min-w-[120px]">
                <Save className="h-4 w-4 mr-1.5" />
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save"}
              </Button>
            </div>
          </div>

          {/* Class heading */}
          <div className="text-sm font-medium text-gray-600">
            {selectedCS ? `${selectedCS.class.name} – ${selectedCS.section.name}` : ""} &nbsp;·&nbsp; {date} &nbsp;·&nbsp; {enrollments.length} students
          </div>

          {/* Student table */}
          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No students enrolled in this class for the selected session.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-10">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Roll No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Attendance</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enrollments.map((enr, idx) => {
                    const s = enr.student;
                    const selectedTypeId = marks[enr.id];
                    const selectedType   = attendanceTypes.find(t => t.id === selectedTypeId);
                    return (
                      <tr key={enr.id} className={`hover:bg-gray-50 ${selectedType?.keyValue === "A" ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{enr.rollNo ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900">
                            {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                          </span>
                          {s.gender && <span className="text-xs text-gray-400 ml-2">{s.gender}</span>}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            {attendanceTypes.map(t => (
                              <button key={t.id} onClick={() => setMarks(m => ({ ...m, [enr.id]: t.id }))}
                                title={t.type}
                                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                  marks[enr.id] === t.id
                                    ? (KV_STYLE[t.keyValue] ?? "bg-gray-200") + " ring-2 ring-offset-1 ring-current shadow-sm"
                                    : "bg-white text-gray-300 border-gray-200 hover:border-gray-400 hover:text-gray-600"
                                }`}>
                                {t.keyValue}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="optional…"
                            value={remarks[enr.id] ?? ""}
                            onChange={e => setRemarks(r => ({ ...r, [enr.id]: e.target.value }))}
                            className="w-36 h-7 rounded border border-gray-200 px-2 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Sticky footer save */}
              <div className="border-t bg-gray-50 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{enrollments.length} students</span>
                <Button onClick={handleSave} disabled={saveState === "saving"}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save Attendance"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Idle state ── */}
      {loadState === "idle" && (
        <Card>
          <CardContent className="py-16 text-center text-gray-400">
            <CheckCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Select a session, class, and date then click Load Students.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
