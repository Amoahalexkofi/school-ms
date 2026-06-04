"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCog, AlertCircle, Save } from "lucide-react";

type AttendanceType = { id: string; type: string; keyValue: string };
type Props = { departments: any[]; attendanceTypes: AttendanceType[] };

const KV_STYLE: Record<string, string> = {
  P:  "bg-green-100  text-green-700  border-green-300",
  A:  "bg-red-100    text-red-700    border-red-300",
  L:  "bg-yellow-100 text-yellow-700 border-yellow-300",
  F:  "bg-orange-100 text-orange-700 border-orange-300",
  LE: "bg-purple-100 text-purple-700 border-purple-300",
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
    <main className="flex-1 p-6 space-y-5 bg-gray-50">

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Department (optional)</label>
            <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" max={today}
              className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <Button onClick={loadStaff} disabled={!date || loadState === "loading"}>
            {loadState === "loading" ? "Loading…" : "Load Staff"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {loadState === "loaded" && (
        <>
          {/* Summary + bulk actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-3 flex-wrap">
              {attendanceTypes.map(t => (
                <div key={t.id} className={`px-4 py-2 rounded-lg border text-sm font-medium ${KV_STYLE[t.keyValue] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                  <span className="text-lg font-bold mr-1">{counts[t.id] ?? 0}</span>
                  {t.type}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1">
                <span className="text-xs text-gray-500 self-center mr-1">Mark all:</span>
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
            <Card><CardContent className="py-16 text-center text-gray-400">
              <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No staff found.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Staff Member</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Designation</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Attendance</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {staff.map((s: any, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-400 font-mono">{s.employeeId}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{s.department?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{s.designation?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {attendanceTypes.map(t => (
                            <button key={t.id} onClick={() => setMarks(m => ({ ...m, [s.id]: t.id }))}
                              title={t.type}
                              className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
                                marks[s.id] === t.id
                                  ? (KV_STYLE[t.keyValue] ?? "bg-gray-200") + " ring-2 ring-offset-1 ring-current shadow-sm"
                                  : "bg-white text-gray-300 border-gray-200 hover:border-gray-400 hover:text-gray-600"
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
                          className="w-36 h-7 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t bg-gray-50 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{staff.length} staff members · {date}</span>
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
        <Card><CardContent className="py-16 text-center text-gray-400">
          <UserCog className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a date and click Load Staff.</p>
        </CardContent></Card>
      )}
    </main>
  );
}
