"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Calendar, AlertCircle } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTION_ID = "section-g1-a";

const COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-teal-100 text-teal-800 border-teal-200",
];

const SUBJECTS = [
  { id: "subj-math", name: "Mathematics" },
  { id: "subj-eng", name: "English Language" },
  { id: "subj-sci", name: "Integrated Science" },
  { id: "subj-soc", name: "Social Studies" },
];

export default function TimetablePage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ day: string; period: number } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjectColorMap: Record<string, string> = {};
  SUBJECTS.forEach((s, i) => { subjectColorMap[s.id] = COLORS[i % COLORS.length]; });

  async function loadSlots() {
    const res = await fetch(`/api/timetable?sectionId=${SECTION_ID}`).catch(() => null);
    if (res?.ok) setSlots(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadSlots();
    fetch("/api/staff").then(r => r.json()).then(setStaff).catch(() => {});
  }, []);

  function getSlot(day: string, period: number) {
    return slots.find((s: any) => s.day === day && s.period === period);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dialog) return;
    setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: SECTION_ID,
          day: dialog.day,
          period: dialog.period,
          startTime: fd.get("startTime"),
          endTime: fd.get("endTime"),
          subjectId: fd.get("subjectId") || undefined,
          staffId: fd.get("staffId") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDialog(null);
      await loadSlots();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(slotId: string) {
    const res = await fetch(`/api/timetable/${slotId}`, { method: "DELETE" });
    if (res.ok) await loadSlots();
  }

  const emptyCell = (day: string, period: number) => (
    <button
      onClick={() => { setDialog({ day, period }); setError(""); }}
      className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center text-gray-300 hover:text-blue-500"
    >
      <Plus className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Timetable" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Grade 1 – Section A</p>
          <div className="flex gap-2 flex-wrap">
            {SUBJECTS.map((s, i) => (
              <span key={s.id} className={`text-xs px-2 py-1 rounded-full border font-medium ${COLORS[i % COLORS.length]}`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr>
                  <th className="w-20 text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Period
                  </th>
                  {DAYS.map(d => (
                    <th key={d} className="text-center px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {d.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p} className="border-t border-gray-100">
                    <td className="px-3 py-2 text-xs font-medium text-gray-400">P{p}</td>
                    {DAYS.map(d => {
                      const slot = getSlot(d, p);
                      const subject = SUBJECTS.find(s => s.id === slot?.subjectId);
                      const colorIdx = SUBJECTS.findIndex(s => s.id === slot?.subjectId);
                      const color = colorIdx >= 0 ? COLORS[colorIdx % COLORS.length] : "bg-gray-100 text-gray-700 border-gray-200";
                      const teacher = staff.find((s: any) => s.id === slot?.staffId);

                      return (
                        <td key={d} className="px-1 py-1">
                          {slot ? (
                            <div className={`relative group rounded-lg border px-2 py-1.5 text-xs ${color}`}>
                              <p className="font-semibold truncate">{subject?.name ?? "—"}</p>
                              {teacher && <p className="text-xs opacity-70 truncate">{teacher.firstName} {teacher.lastName}</p>}
                              <p className="text-xs opacity-60">{slot.startTime}–{slot.endTime}</p>
                              <button
                                onClick={() => handleDelete(slot.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-current hover:text-red-600 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : emptyCell(d, p)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={!!dialog} onOpenChange={o => !o && setDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Add Slot — {dialog?.day} Period {dialog?.period}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select name="subjectId" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">None / Free period</option>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Teacher</Label>
                <select name="staffId" className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">None</option>
                  {staff.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input name="startTime" type="time" required defaultValue="08:00" />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input name="endTime" type="time" required defaultValue="08:45" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add Slot"}</Button>
                <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
