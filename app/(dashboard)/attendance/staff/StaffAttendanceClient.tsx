"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, AlertCircle, Save } from "lucide-react";

type AttendanceType = { id: string; type: string; keyValue: string };
type Props = { departments: any[]; attendanceTypes: AttendanceType[] };

const KV_STYLE: Record<string, string> = {
  P:  "bg-emerald-500/10  text-emerald-400  border-green-300",
  A:  "bg-red-500/10    text-red-400    border-red-300",
  L:  "bg-amber-500/10 text-amber-400 border-yellow-300",
  F:  "bg-orange-500/10 text-orange-400 border-orange-300",
  LE: "bg-violet-500/10 text-violet-400 border-purple-300",
};

export function StaffAttendanceClient({ departments, attendanceTypes }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const [departmentId, setDepartmentId] = useState("");
  const [date,         setDate]         = useState(today);
  const [staff,        setStaff]        = useState<any[]>([]);
  const [marks,        setMarks]        = useState<Record<string, string>>({});
  const [remarks,      setRemarks]      = useState<Record<string, string>>({});

  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error,     setError]     = useState("");

  const presentType = attendanceTypes.find(t => t.keyValue === "P");

  async function loadStaff() {
    if (!date) return;
    setLoadState("loading"); setError("");
    try {
      const url = `/api/attendance/staff?date=${date}${departmentId ? `&departmentId=${departmentId}` : ""}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStaff(data.staff);
      const m: Record<string, string> = {};
      const r: Record<string, string> = {};
      for (const s of data.staff) {
        const ex = data.existingMap[s.id];
        m[s.id] = ex ? ex.staffAttendanceTypeId : (presentType?.id ?? attendanceTypes[0]?.id ?? "");
        r[s.id] = ex?.remark ?? "";
      }
      setMarks(m); setRemarks(r);
      setLoadState("loaded");
    } catch (e: any) {
      setError(e.message); setLoadState("idle");
    }
  }

  function markAll(typeId: string) {
    const m: Record<string, string> = {};
    for (const s of staff) m[s.id] = typeId;
    setMarks(m);
  }

  async function handleSave() {
    setSaveState("saving"); setError("");
    try {
      const records = staff.map(s => ({
        staffId:              s.id,
        staffAttendanceTypeId: marks[s.id] ?? presentType?.id,
        remark:               remarks[s.id] || null,
      }));
      const res = await fetch("/api/attendance/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 3000);
    } catch (e: any) {
      setError(e.message); setSaveState("error");
    }
  }

  const counts = attendanceTypes.reduce((acc, t) => {
    acc[t.id] = Object.values(marks).filter(v => v === t.id).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">

      {/* Filter bar */}
      <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-white/50 mb-1">Department (optional)</label>
            <select className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-white/50 mb-1">Date</label>
            <input type="date" max={today}
              className="w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <Button onClick={loadStaff} disabled={!date || loadState === "loading"}>
            {loadState === "loading" ? "Loading…" : "Load Staff"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loadState === "loaded" && (
        <>
          {/* Summary + bulk actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              {attendanceTypes.map(t => (
                <div key={t.id} className={`px-4 py-2 rounded-lg border text-sm font-medium ${KV_STYLE[t.keyValue] ?? "bg-white/[0.04] text-white/50 border-white/[0.06]"}`}>
                  <span className="text-lg font-bold mr-1">{counts[t.id] ?? 0}</span>
                  {t.type}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                <span className="text-xs text-white/40 self-center mr-1">Mark all:</span>
                {attendanceTypes.map(t => (
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

          {/* Staff table */}
          {staff.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-white/30">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff found.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#0f1015] border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Staff Member</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Attendance</th>
                    <th className="text-left px-4 py-3 font-medium text-white/50">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staff.map((s: any, idx) => (
                    <tr key={s.id} className="hover:bg-[#0f1015]">
                      <td className="px-4 py-3 text-white/30 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white/80">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-white/30 font-mono">{s.employeeId}</div>
                      </td>
                      <td className="px-4 py-3 text-white/50">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/50">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {attendanceTypes.map(t => (
                            <button key={t.id} onClick={() => setMarks(m => ({ ...m, [s.id]: t.id }))}
                              title={t.type}
                              className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                marks[s.id] === t.id
                                  ? (KV_STYLE[t.keyValue] ?? "bg-white/[0.06]") + " ring-2 ring-offset-1 ring-current shadow-sm"
                                  : "bg-[#111318] text-white/30 border-white/[0.06] hover:border-gray-400 hover:text-white/50"
                              }`}>
                              {t.keyValue}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" placeholder="optional…"
                          value={remarks[s.id] ?? ""}
                          onChange={e => setRemarks(r => ({ ...r, [s.id]: e.target.value }))}
                          className="w-36 h-7 rounded border border-white/[0.06] px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t bg-[#0f1015] px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-white/30">{staff.length} staff members · {date}</span>
                <Button onClick={handleSave} disabled={saveState === "saving"}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save Attendance"}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {loadState === "idle" && (
        <Card><CardContent className="py-16 text-center text-white/30">
          <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a date and click Load Staff.</p>
        </CardContent></Card>
      )}
    </main>
  );
}
