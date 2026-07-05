"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, AlertCircle, ClipboardList, CalendarClock } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const KV_STYLE: Record<string, string> = {
  P:  "bg-green-100  text-green-700  border-green-300",
  A:  "bg-red-100    text-red-700    border-red-300",
  L:  "bg-yellow-100 text-yellow-700 border-yellow-300",
  H:  "bg-blue-100   text-blue-700   border-blue-300",
  F:  "bg-orange-100 text-orange-700 border-orange-300",
};
const KV_TEXT: Record<string, string> = {
  P: "text-green-700", A: "text-red-700", L: "text-yellow-700", H: "text-blue-700", F: "text-orange-700",
};

type CS = { id: string; class: { name: string }; section: { name: string } };
type AType = { id: string; type: string; keyValue: string };
type Slot = {
  id: string; day: string; timeFrom: string; timeTo: string;
  subject?: { name: string; code: string } | null;
  staff?: { firstName: string; lastName?: string | null } | null;
};

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function SubjectAttendanceClient({ classSections, attendanceTypes }: {
  classSections: CS[]; attendanceTypes: AType[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [tab, setTab] = useState<"mark" | "report">("mark");
  const [classSectionId, setClassSectionId] = useState("");
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState("");

  // ── marking state ──
  const [roster, setRoster] = useState<any[] | null>(null);
  const [slotInfo, setSlotInfo] = useState<any>(null);
  const [rows, setRows] = useState<Record<string, { attendanceTypeId: string; remark: string }>>({});
  const [notify, setNotify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── report state ──
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const weekday = DAYS[new Date(date + "T00:00:00").getDay()];
  const presentType = attendanceTypes.find(t => t.keyValue === "P");

  // Periods for the selected class on the selected weekday (Smart School's
  // subject dropdown lists timetable periods, not bare subjects).
  useEffect(() => {
    setSlots([]); setSlotId(""); setRoster(null);
    if (!classSectionId) return;
    fetch(`/api/timetable?classSectionId=${classSectionId}`)
      .then(r => (r.ok ? r.json() : []))
      .then((all: Slot[]) => setSlots(all.filter(s => s.day === weekday)))
      .catch(() => setSlots([]));
  }, [classSectionId, weekday]);

  const slotLabel = (s: Slot) =>
    `${s.subject?.name ?? "—"} (${s.timeFrom} – ${s.timeTo})` +
    (s.staff ? ` — ${s.staff.firstName} ${s.staff.lastName ?? ""}`.trimEnd() : "");

  async function loadRoster() {
    if (!slotId) { setError("Select a period first"); return; }
    setLoading(true); setError(""); setRoster(null); setSaved(false);
    try {
      const res = await fetch(`/api/subject-attendance/roster?timetableSlotId=${slotId}&date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load students");
      setSlotInfo(data.slot);
      setRoster(data.enrollments);
      const next: Record<string, { attendanceTypeId: string; remark: string }> = {};
      for (const enr of data.enrollments) {
        const ex = data.existing[enr.id];
        next[enr.id] = {
          attendanceTypeId: ex?.attendanceTypeId ?? presentType?.id ?? "",
          remark: ex?.remark ?? "",
        };
      }
      setRows(next);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function setRow(ssId: string, patch: Partial<{ attendanceTypeId: string; remark: string }>) {
    setRows(r => ({ ...r, [ssId]: { ...r[ssId], ...patch } }));
  }

  function markAll(typeId: string) {
    setRows(r => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, { ...v, attendanceTypeId: typeId }])));
  }

  async function save() {
    if (!roster) return;
    setSaving(true); setError(""); setSaved(false);
    try {
      const records = roster.map((enr: any) => ({
        studentSessionId: enr.id,
        timetableSlotId: slotId,
        attendanceTypeId: rows[enr.id]?.attendanceTypeId,
        date,
        remark: rows[enr.id]?.remark || null,
      }));
      const res = await fetch("/api/subject-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, notify }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  const loadReport = useCallback(async () => {
    if (!classSectionId) { setError("Select a class first"); return; }
    setReportLoading(true); setError(""); setReport(null);
    try {
      const res = await fetch(`/api/subject-attendance/report?classSectionId=${classSectionId}&date=${date}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load report");
      setReport(data);
    } catch (e: any) { setError(e.message); }
    finally { setReportLoading(false); }
  }, [classSectionId, date]);

  const counts: Record<string, number> = {};
  if (roster) for (const enr of roster) {
    const t = rows[enr.id]?.attendanceTypeId;
    if (t) counts[t] = (counts[t] ?? 0) + 1;
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/attendance" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Daily Attendance
        </Link>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
          <button onClick={() => setTab("mark")}
            className={`px-4 py-1.5 ${tab === "mark" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <CalendarClock className="h-3.5 w-3.5 inline mr-1" /> Mark
          </button>
          <button onClick={() => setTab("report")}
            className={`px-4 py-1.5 ${tab === "report" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
            <ClipboardList className="h-3.5 w-3.5 inline mr-1" /> By-Date Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class – Section</label>
            <select className={SEL} value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              <option value="">Select class</option>
              {classSections.map(cs => (
                <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" max={today} className={SEL} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          {tab === "mark" ? (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Period ({weekday.charAt(0) + weekday.slice(1).toLowerCase()})</label>
                <select className={SEL} value={slotId} onChange={e => setSlotId(e.target.value)} disabled={!classSectionId}>
                  <option value="">{slots.length ? "Select period" : classSectionId ? "No periods on the timetable for this day" : "Select a class first"}</option>
                  {slots.map(s => <option key={s.id} value={s.id}>{slotLabel(s)}</option>)}
                </select>
              </div>
              <Button onClick={loadRoster} disabled={loading || !slotId}>
                {loading ? "Loading…" : "Load Students"}
              </Button>
            </>
          ) : (
            <>
              <div />
              <Button onClick={loadReport} disabled={reportLoading || !classSectionId}>
                {reportLoading ? "Loading…" : "Load Report"}
              </Button>
            </>
          )}
        </div>
        {tab === "mark" && slots.length === 0 && classSectionId && (
          <p className="text-xs text-gray-400 mt-2">
            Period attendance follows the timetable — add periods for this class in{" "}
            <Link href="/timetable" className="text-indigo-600 underline">Timetable</Link> first.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── MARK TAB ── */}
      {tab === "mark" && roster && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-6 text-sm">
            <div><p className="text-xs text-gray-400">Subject</p><p className="font-medium">{slotInfo?.subject?.name ?? "—"}</p></div>
            <div><p className="text-xs text-gray-400">Period</p><p className="font-medium">{slotInfo?.timeFrom} – {slotInfo?.timeTo}</p></div>
            <div><p className="text-xs text-gray-400">Teacher</p><p className="font-medium">{slotInfo?.staff ? `${slotInfo.staff.firstName} ${slotInfo.staff.lastName ?? ""}` : "—"}</p></div>
            <div><p className="text-xs text-gray-400">Class</p><p className="font-medium">{slotInfo?.classSection ? `${slotInfo.classSection.class.name} – ${slotInfo.classSection.section.name}` : "—"}</p></div>
            <div><p className="text-xs text-gray-400">Date</p><p className="font-medium">{date}</p></div>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {attendanceTypes.filter(t => t.keyValue !== "H").map(t => (
              <div key={t.id} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${KV_STYLE[t.keyValue] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                <span className="font-bold mr-1">{counts[t.id] ?? 0}</span>{t.type}
              </div>
            ))}
            <div className="ml-auto flex gap-2">
              {presentType && (
                <Button size="sm" variant="outline" onClick={() => markAll(presentType.id)}>Mark All Present</Button>
              )}
            </div>
          </div>

          {roster.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
              No active students in this class.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {roster.map((enr: any, idx: number) => {
                    const s = enr.student;
                    const row = rows[enr.id];
                    return (
                      <tr key={enr.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">
                          {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex justify-center gap-1.5">
                            {attendanceTypes.map(t => (
                              <button key={t.id}
                                onClick={() => setRow(enr.id, { attendanceTypeId: t.id })}
                                title={t.type}
                                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                                  row?.attendanceTypeId === t.id
                                    ? `${KV_STYLE[t.keyValue] ?? "bg-gray-100 text-gray-700 border-gray-300"} ring-2 ring-offset-1 ring-indigo-300`
                                    : "bg-white text-gray-300 border-gray-200 hover:border-gray-400"
                                }`}>
                                {t.keyValue}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <input type="text" placeholder="optional"
                            value={row?.remark ?? ""}
                            onChange={e => setRow(enr.id, { remark: e.target.value })}
                            className="w-32 h-7 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={notify} onChange={e => setNotify(e.target.checked)} className="rounded" />
                  Notify guardians of absentees
                </label>
                <Button disabled={saving} onClick={save}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? "Saving…" : saved ? "Saved ✓" : "Save Attendance"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── REPORT TAB ── */}
      {tab === "report" && report && (
        report.periods.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400 text-sm">
            No timetable periods for this class on {report.day.charAt(0) + report.day.slice(1).toLowerCase()}.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 sticky left-0 bg-gray-50">Student</th>
                    <th className="text-left px-3 py-3 font-medium text-gray-600">Adm No.</th>
                    {report.periods.map((p: any) => (
                      <th key={p.id} className="text-center px-3 py-2 font-medium text-gray-600">
                        <span className="block leading-tight">{p.subject}</span>
                        <span className="text-[10px] font-normal text-gray-400">{p.timeFrom}–{p.timeTo}</span>
                        {p.teacher && <span className="block text-[10px] font-normal text-gray-400">{p.teacher}</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {report.rows.map((r: any) => (
                    <tr key={r.studentSessionId} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-900 sticky left-0 bg-white">
                        {r.student.firstName} {r.student.middleName ? r.student.middleName + " " : ""}{r.student.lastName}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{r.student.admissionNo}</td>
                      {report.periods.map((p: any) => {
                        const kv = r.marks[p.id];
                        return (
                          <td key={p.id} className={`px-3 py-2.5 text-center font-bold ${kv ? KV_TEXT[kv] ?? "text-gray-600" : "text-gray-200"}`}>
                            {kv ?? "·"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-gray-50 px-4 py-2 flex gap-4 text-xs text-gray-500">
              {attendanceTypes.map(t => (
                <span key={t.id}><strong className={KV_TEXT[t.keyValue] ?? ""}>{t.keyValue}</strong> {t.type}</span>
              ))}
              <span><strong className="text-gray-300">·</strong> not marked</span>
            </div>
          </div>
        )
      )}
    </main>
  );
}
