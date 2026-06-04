"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, ClipboardEdit, Globe, Lock } from "lucide-react";

type Props = { group: any; sessions: any[]; classSections: any[]; subjects: any[] };

export function ExamGroupDetailClient({ group, sessions, classSections, subjects }: Props) {
  const router = useRouter();
  const [addOpen,  setAddOpen]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const [form, setForm] = useState({
    sessionId: sessions[0]?.id ?? "", classSectionId: "", subjectId: "",
    dateOfExam: "", startTime: "", endTime: "",
    fullMarks: "100", passingMarks: "40", roomNo: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleAdd() {
    if (!form.sessionId || !form.classSectionId || !form.subjectId) {
      setError("Session, class, and subject are required"); return;
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/exams/${group.id}/schedules`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddOpen(false); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDeleteSchedule(scheduleId: string) {
    if (!confirm("Delete this schedule and all its mark entries?")) return;
    const res = await fetch(`/api/exams/schedules/${scheduleId}`, { method: "DELETE" });
    if (!res.ok) { alert((await res.json()).error); return; }
    router.refresh();
  }

  async function togglePublish() {
    await fetch(`/api/exams/${group.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !group.isPublished }),
    });
    router.refresh();
  }

  // Group schedules by classSection
  const byClass: Record<string, any[]> = {};
  for (const sch of group.schedules) {
    const key = sch.classSectionId ?? "unassigned";
    if (!byClass[key]) byClass[key] = [];
    byClass[key].push(sch);
  }

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/exams" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> All Exam Groups
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={togglePublish}>
            {group.isPublished ? <><Lock className="h-4 w-4 mr-1.5" />Unpublish</> : <><Globe className="h-4 w-4 mr-1.5" />Publish Results</>}
          </Button>
          {group.isPublished && (
            <Link href={`/exams/results/${group.id}`}>
              <Button variant="outline">View Results</Button>
            </Link>
          )}
          <Button onClick={() => { setError(""); setAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Schedule
          </Button>
        </div>
      </div>

      {/* Group info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">{group.name}</h2>
          {group.examType && <p className="text-xs text-gray-400 mt-0.5">{group.examType.replace(/_/g, " ")}</p>}
          {group.description && <p className="text-sm text-gray-500 mt-1">{group.description}</p>}
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${group.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {group.isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Schedules */}
      {group.schedules.length === 0 ? (
        <Card><CardContent className="py-14 text-center text-gray-400">
          <p className="text-sm">No schedules yet. Add subjects to this exam group.</p>
        </CardContent></Card>
      ) : (
        Object.entries(byClass).map(([csId, schedules]) => {
          const first = schedules[0];
          const csLabel = first.classSection
            ? `${first.classSection.class.name} – ${first.classSection.section.name}`
            : "Unassigned";
          return (
            <Card key={csId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-800">{csLabel}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-t border-b">
                    <tr>
                      {["Subject", "Session", "Date", "Time", "Full Marks", "Pass Marks", "Entries", ""].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {schedules.map((sch: any) => (
                      <tr key={sch.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {sch.subject.name}
                          <span className="text-xs text-gray-400 ml-1.5 font-mono">({sch.subject.code})</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{sch.session.session}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {sch.dateOfExam ? new Date(sch.dateOfExam).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {sch.startTime ? `${sch.startTime}–${sch.endTime ?? ""}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{sch.fullMarks}</td>
                        <td className="px-4 py-3 text-center text-gray-500">{sch.passingMarks}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${sch._count.markEntries > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {sch._count.markEntries}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex gap-2 justify-end">
                          <Link href={`/exams/${group.id}/marks/${sch.id}`}>
                            <Button size="sm" variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                              <ClipboardEdit className="h-3.5 w-3.5 mr-1" /> Marks
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteSchedule(sch.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Add Schedule Dialog */}
      <Dialog open={addOpen} onOpenChange={o => !o && setAddOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Exam Schedule</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.sessionId} onChange={set("sessionId")}>
                {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class / Section *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.classSectionId} onChange={set("classSectionId")}>
                <option value="">— Select —</option>
                {classSections.map((cs: any) => (
                  <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.subjectId} onChange={set("subjectId")}>
                <option value="">— Select subject —</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Exam</label>
              <Input type="date" value={form.dateOfExam} onChange={set("dateOfExam")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room No.</label>
              <Input value={form.roomNo} onChange={set("roomNo")} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <Input type="time" value={form.startTime} onChange={set("startTime")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <Input type="time" value={form.endTime} onChange={set("endTime")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Marks *</label>
              <Input type="number" min="1" value={form.fullMarks} onChange={set("fullMarks")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Marks *</label>
              <Input type="number" min="1" value={form.passingMarks} onChange={set("passingMarks")} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleAdd}>{loading ? "Adding…" : "Add Schedule"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
