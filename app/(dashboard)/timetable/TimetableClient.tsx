"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, X, Calendar, Printer } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABEL: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat",
};

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const SUBJECT_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-200",
  "bg-green-100 text-green-800 border-green-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-pink-100 text-pink-800 border-pink-200",
  "bg-orange-100 text-orange-800 border-orange-200",
  "bg-teal-100 text-teal-800 border-teal-200",
  "bg-rose-100 text-rose-800 border-rose-200",
];

type Slot = {
  id: string; day: string; timeFrom: string; timeTo: string; roomNo?: string;
  subject: { id: string; name: string; code: string };
  staff?: { id: string; firstName: string; lastName: string } | null;
};

type ClassData = {
  id: string; name: string;
  classSections: { id: string; section: { id: string; name: string } }[];
};

const emptyForm = { subjectId: "", staffId: "", timeFrom: "", timeTo: "", roomNo: "" };

export function TimetableClient({ classes, staff, session }: {
  classes: ClassData[];
  staff: { id: string; firstName: string; lastName: string }[];
  session: { id: string; session: string } | null;
}) {
  const [classId, setClassId] = useState("");
  const [classSectionId, setClassSectionId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingDay, setAddingDay] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedClass = classes.find(c => c.id === classId);
  const sections = selectedClass?.classSections ?? [];

  // Load subjects when class changes
  useEffect(() => {
    if (!classId || !session?.id) { setSubjects([]); return; }
    fetch(`/api/subjects?classId=${classId}&sessionId=${session.id}`)
      .then(r => r.json())
      .then(d => setSubjects(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [classId, session?.id]);

  // Load slots when class-section changes
  useEffect(() => {
    if (!classSectionId) { setSlots([]); return; }
    setLoading(true);
    fetch(`/api/timetable?classSectionId=${classSectionId}`)
      .then(r => r.json())
      .then(d => setSlots(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSectionId]);

  function getSlotsForDay(day: string) {
    return slots.filter(s => s.day === day).sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));
  }

  function subjectColor(subjectId: string) {
    const idx = subjects.findIndex(s => s.id === subjectId);
    return SUBJECT_COLORS[idx % SUBJECT_COLORS.length] ?? SUBJECT_COLORS[0];
  }

  async function saveSlot(day: string) {
    if (!form.subjectId || !form.timeFrom || !form.timeTo) {
      setError("Subject, Time From and Time To are required"); return;
    }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSectionId, subjectId: form.subjectId, staffId: form.staffId || null,
          day, timeFrom: form.timeFrom, timeTo: form.timeTo, roomNo: form.roomNo || null,
          sessionId: session?.id || null,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      // Reload slots
      const updated = await fetch(`/api/timetable?classSectionId=${classSectionId}`).then(r => r.json());
      setSlots(Array.isArray(updated) ? updated : []);
      setAddingDay(null);
      setForm(emptyForm);
    } catch (e: any) { setError(e.message ?? "Failed to save"); }
    finally { setSaving(false); }
  }

  async function deleteSlot(id: string) {
    if (!confirm("Remove this timetable slot?")) return;
    await fetch(`/api/timetable/${id}`, { method: "DELETE" });
    setSlots(s => s.filter(x => x.id !== id));
  }

  const hasData = classSectionId && !loading;
  const className = selectedClass?.name ?? "";
  const sectionName = sections.find(s => s.id === classSectionId)?.section.name ?? "";

  return (
    <main className="flex-1 p-6 space-y-5">
      {/* Filters — matches Smart School: select class + section first */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" /> Select Class &amp; Section
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div>
            <Label className="text-xs mb-1 block">Class *</Label>
            <select className={SEL + " w-44"} value={classId} onChange={e => { setClassId(e.target.value); setClassSectionId(""); }}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-xs mb-1 block">Section *</Label>
            <select className={SEL + " w-36"} value={classSectionId} onChange={e => setClassSectionId(e.target.value)} disabled={!classId}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.section.name}</option>)}
            </select>
          </div>
          {hasData && (
            <Button variant="outline" size="sm" onClick={() => window.print()} className="no-print">
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          )}
        </CardContent>
      </Card>

      {!classSectionId && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a class and section to view or edit the timetable</p>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400 text-center py-8">Loading timetable…</p>}

      {/* Timetable Grid — rows = days, columns = subjects (matches Smart School layout) */}
      {hasData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Timetable — {className} / {sectionName}
              {session && <span className="text-sm font-normal text-gray-500 ml-2">({session.session})</span>}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-3 py-2.5 text-left font-semibold text-gray-600 w-24">Day</th>
                  {subjects.map(sub => (
                    <th key={sub.id} className="border px-3 py-2.5 text-left font-semibold text-gray-600 min-w-[140px]">
                      {sub.name}
                      <span className="text-xs font-normal text-gray-400 ml-1">({sub.code})</span>
                    </th>
                  ))}
                  {subjects.length === 0 && (
                    <th className="border px-3 py-2.5 text-left text-gray-400 font-normal">
                      No subjects found for this class
                    </th>
                  )}
                  <th className="border px-3 py-2.5 text-center w-10 no-print" />
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => {
                  const daySlots = getSlotsForDay(day);
                  return (
                    <tr key={day} className="hover:bg-gray-50/50">
                      <td className="border px-3 py-2.5 font-semibold text-gray-700">{DAY_LABEL[day]}</td>
                      {subjects.map(sub => {
                        const slot = daySlots.find(s => s.subject.id === sub.id);
                        return (
                          <td key={sub.id} className="border px-2 py-2">
                            {slot ? (
                              <div className={`rounded-lg px-2 py-1.5 border text-xs space-y-0.5 ${subjectColor(sub.id)}`}>
                                <p className="font-semibold">{slot.timeFrom} – {slot.timeTo}</p>
                                {slot.staff && <p className="opacity-70">{slot.staff.firstName} {slot.staff.lastName}</p>}
                                {slot.roomNo && <p className="opacity-60">Room: {slot.roomNo}</p>}
                                <button
                                  onClick={() => deleteSlot(slot.id)}
                                  className="text-red-400 hover:text-red-600 mt-0.5 no-print"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setAddingDay(day); setForm({ ...emptyForm, subjectId: sub.id }); setError(""); }}
                                className="w-full h-12 text-gray-300 hover:text-blue-400 hover:bg-blue-50 rounded-lg border border-dashed border-gray-200 hover:border-blue-300 transition-colors flex items-center justify-center no-print"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        );
                      })}
                      {subjects.length === 0 && <td className="border px-3 py-2.5 text-gray-300 text-xs">—</td>}
                      {/* Per-day add button */}
                      <td className="border px-2 py-2 text-center no-print">
                        <button
                          onClick={() => { setAddingDay(day); setForm(emptyForm); setError(""); }}
                          title={`Add slot for ${DAY_LABEL[day]}`}
                          className="p-1 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Slot Form */}
          {addingDay && (
            <Card className="border-blue-200 bg-blue-50/30 no-print">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-blue-800">
                    Add Slot — {DAY_LABEL[addingDay]}
                  </CardTitle>
                  <button onClick={() => setAddingDay(null)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Subject *</Label>
                  <select className={SEL} value={form.subjectId} onChange={e => setForm((f: any) => ({ ...f, subjectId: e.target.value }))}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div>
                  <Label>Teacher</Label>
                  <select className={SEL} value={form.staffId} onChange={e => setForm((f: any) => ({ ...f, staffId: e.target.value }))}>
                    <option value="">Select Teacher</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Time From *</Label>
                  <Input type="time" value={form.timeFrom} onChange={e => setForm((f: any) => ({ ...f, timeFrom: e.target.value }))} />
                </div>
                <div>
                  <Label>Time To *</Label>
                  <Input type="time" value={form.timeTo} onChange={e => setForm((f: any) => ({ ...f, timeTo: e.target.value }))} />
                </div>
                <div>
                  <Label>Room No</Label>
                  <Input value={form.roomNo} onChange={e => setForm((f: any) => ({ ...f, roomNo: e.target.value }))} placeholder="e.g. Room 101" />
                </div>
                <div className="flex items-end gap-2">
                  <Button size="sm" onClick={() => saveSlot(addingDay)} disabled={saving}>
                    {saving ? "Saving…" : "Save Slot"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setAddingDay(null); setError(""); }}>Cancel</Button>
                </div>
                {error && <p className="sm:col-span-2 md:col-span-3 text-xs text-red-600">{error}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
