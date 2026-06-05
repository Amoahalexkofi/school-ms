"use client";

import { useState, useEffect } from "react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from "lucide-react";

export default function ExamGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState<string | null>(null);
  const [marksDialog, setMarksDialog] = useState<{ schedule: any; groupId: string } | null>(null);
  const [markEntries, setMarkEntries] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadGroups() {
    const res = await fetch("/api/exam-groups/list").catch(() => null);
    if (res?.ok) { const d = await res.json(); setGroups(d); }
    setLoading(false);
  }

  useEffect(() => {
    loadGroups();
    fetch("/api/students").then(r => r.json()).then(setStudents).catch(() => {});
  }, []);

  async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/exam-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          sessionId: "session-2026",
          startDate: fd.get("startDate"),
          endDate: fd.get("endDate"),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setCreateDialog(false);
      await loadGroups();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleAddSchedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!scheduleDialog) return;
    setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;
    try {
      const res = await fetch(`/api/exam-groups/${scheduleDialog}/schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: fd.get("subjectId"),
          date,
          startTime: `${date}T${fd.get("startTime")}:00`,
          endTime: `${date}T${fd.get("endTime")}:00`,
          maxMarks: Number(fd.get("maxMarks")),
          passingMarks: Number(fd.get("passingMarks")),
          room: fd.get("room") || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setScheduleDialog(null);
      await loadGroups();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleSubmitMarks() {
    if (!marksDialog) return;
    setSaving(true); setError("");
    try {
      const entries = Object.entries(markEntries).filter(([, v]) => v !== "");
      await Promise.all(entries.map(([studentId, marks]) =>
        fetch("/api/marks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examScheduleId: marksDialog.schedule.id,
            studentId,
            theoryMarks: Number(marks),
          }),
        })
      ));
      setMarksDialog(null);
      setMarkEntries({});
    } catch { setError("Failed to save marks."); }
    finally { setSaving(false); }
  }

  async function handlePublish(groupId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/exam-groups/${groupId}/publish`, { method: "PATCH" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      await loadGroups();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Exams & Marks" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{groups.length} exam group{groups.length !== 1 ? "s" : ""}</p>
          <Button size="sm" onClick={() => { setCreateDialog(true); setError(""); }}>
            <Plus className="h-4 w-4 mr-1" /> New Exam Group
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No exam groups yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g: any) => (
              <Card key={g.id} className="overflow-hidden">
                <CardHeader className="cursor-pointer select-none" onClick={() => setExpanded(expanded === g.id ? null : g.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base">{g.name}</CardTitle>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${g.published ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {g.published ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(g.startDate).toLocaleDateString()} – {new Date(g.endDate).toLocaleDateString()}
                      </span>
                      {expanded === g.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                </CardHeader>

                {expanded === g.id && (
                  <CardContent className="border-t pt-4 space-y-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setScheduleDialog(g.id); setError(""); }}>
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Subject Schedule
                      </Button>
                      {!g.published && g.schedules?.length > 0 && (
                        <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50"
                          onClick={() => handlePublish(g.id)} disabled={saving}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Publish Results
                        </Button>
                      )}
                    </div>

                    {!g.schedules?.length ? (
                      <p className="text-sm text-gray-400">No subjects scheduled yet.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Subject</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Max Marks</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Pass Marks</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {g.schedules.map((s: any) => (
                            <tr key={s.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">{s.subject?.name ?? s.subjectId}</td>
                              <td className="px-3 py-2 text-gray-500">{new Date(s.date).toLocaleDateString()}</td>
                              <td className="px-3 py-2">{s.maxMarks}</td>
                              <td className="px-3 py-2">{s.passingMarks}</td>
                              <td className="px-3 py-2">
                                <Button size="sm" variant="outline"
                                  onClick={() => { setMarksDialog({ schedule: s, groupId: g.id }); setMarkEntries({}); setError(""); }}>
                                  Enter Marks
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Create Group Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Exam Group</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input name="name" required placeholder="e.g. Term 1 Exams" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input name="startDate" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input name="endDate" type="date" required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create"}</Button>
                <Button type="button" variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Schedule Dialog */}
        <Dialog open={!!scheduleDialog} onOpenChange={o => !o && setScheduleDialog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Subject Schedule</DialogTitle></DialogHeader>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select name="subjectId" required className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">Select subject…</option>
                  <option value="subj-math">Mathematics</option>
                  <option value="subj-eng">English Language</option>
                  <option value="subj-sci">Integrated Science</option>
                  <option value="subj-soc">Social Studies</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input name="date" type="date" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input name="startTime" type="time" required />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input name="endTime" type="time" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Max Marks</Label>
                  <Input name="maxMarks" type="number" defaultValue={100} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Passing Marks</Label>
                  <Input name="passingMarks" type="number" defaultValue={40} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Room (optional)</Label>
                <Input name="room" placeholder="e.g. Room 4A" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add Schedule"}</Button>
                <Button type="button" variant="outline" onClick={() => setScheduleDialog(null)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Enter Marks Dialog */}
        <Dialog open={!!marksDialog} onOpenChange={o => !o && setMarksDialog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Enter Marks — {marksDialog?.schedule?.subject?.name ?? "Subject"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <p className="text-xs text-gray-500">Max marks: {marksDialog?.schedule?.maxMarks} · Pass: {marksDialog?.schedule?.passingMarks}</p>
              {students.length === 0 ? (
                <p className="text-sm text-gray-400">No students found.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {students.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm">{s.firstName} {s.lastName}</span>
                      <Input
                        type="number"
                        min={0}
                        max={marksDialog?.schedule?.maxMarks}
                        className="w-24"
                        placeholder="—"
                        value={markEntries[s.id] ?? ""}
                        onChange={e => setMarkEntries(m => ({ ...m, [s.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSubmitMarks} disabled={saving}>{saving ? "Saving…" : "Save Marks"}</Button>
                <Button variant="outline" onClick={() => setMarksDialog(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
