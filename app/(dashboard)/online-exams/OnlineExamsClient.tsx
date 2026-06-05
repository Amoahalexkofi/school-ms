"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Clock, CheckCircle, Users, Plus, Pencil, Trash2, BookOpen, Eye, Send } from "lucide-react";

type Exam = {
  id: string;
  title: string;
  instructions?: string;
  duration: number;
  totalQuestions: number;
  passingPercentage?: number;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  class?: { id: string; name: string };
  subjectId?: string;
  _count: { questions: number; attempts: number };
  attempts: { score: number; total: number }[];
};

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

function statusLabel(exam: Exam) {
  const now = new Date();
  if (!exam.isPublished) return { label: "Draft", color: "bg-gray-100 text-gray-600" };
  if (now < new Date(exam.startTime)) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  if (now > new Date(exam.endTime)) return { label: "Ended", color: "bg-gray-100 text-gray-600" };
  return { label: "Live", color: "bg-green-100 text-green-700" };
}

const emptyEditForm = {
  title: "",
  classId: "",
  subjectId: "",
  duration: "60",
  passingPercentage: "50",
  instructions: "",
  startTime: "",
  endTime: "",
};

export function OnlineExamsClient({
  exams: initial,
  classes,
  subjects,
}: {
  exams: Exam[];
  classes: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}) {
  const [exams, setExams] = useState<Exam[]>(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [form, setForm] = useState<any>(emptyEditForm);
  const [saving, setSaving] = useState(false);

  const live = useMemo(() => {
    const now = new Date();
    return exams.filter((e) => e.isPublished && now >= new Date(e.startTime) && now <= new Date(e.endTime)).length;
  }, [exams]);

  function openEdit(e: Exam) {
    setEditing(e);
    setForm({
      title: e.title,
      classId: e.class?.id ?? "",
      subjectId: e.subjectId ?? "",
      duration: String(e.duration),
      passingPercentage: String(e.passingPercentage ?? "50"),
      instructions: e.instructions ?? "",
      startTime: e.startTime ? e.startTime.slice(0, 16) : "",
      endTime: e.endTime ? e.endTime.slice(0, 16) : "",
    });
    setEditOpen(true);
  }

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function saveEdit() {
    if (!form.title.trim()) return alert("Title required");
    if (!form.startTime || !form.endTime) return alert("Start and end time required");
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        classId: form.classId || null,
        subjectId: form.subjectId || null,
        duration: parseInt(form.duration) || 60,
        passingPercentage: parseFloat(form.passingPercentage) || null,
        instructions: form.instructions || null,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      const res = await fetch(`/api/online-exams/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setExams((es) => es.map((e) => (e.id === editing.id ? { ...e, ...updated } : e)));
      setEditOpen(false);
    } catch {
      alert("Failed to save exam");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this exam and all its data?")) return;
    try {
      const res = await fetch(`/api/online-exams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setExams((es) => es.filter((e) => e.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  async function togglePublish(exam: Exam) {
    try {
      const res = await fetch(`/api/online-exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !exam.isPublished }),
      });
      if (!res.ok) throw new Error();
      setExams((es) => es.map((e) => (e.id === exam.id ? { ...e, isPublished: !e.isPublished } : e)));
    } catch {
      alert("Failed");
    }
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: exams.length, extra: "" },
          { label: "Live Now", value: live, extra: live > 0 ? "text-green-600" : "" },
          { label: "Published", value: exams.filter((e) => e.isPublished).length, extra: "" },
          { label: "Total Attempts", value: exams.reduce((s, e) => s + e._count.attempts, 0), extra: "" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.extra}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 justify-between items-center">
        <Link href="/online-exams/questions">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-1" /> Question Bank
          </Button>
        </Link>
        <Link href="/online-exams/new">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Create Exam
          </Button>
        </Link>
      </div>

      {/* Exam cards */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No online exams yet. Click "Create Exam" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const { label, color } = statusLabel(exam);
            const submitted = exam.attempts.filter((a) => a.total != null).length;
            const avgScore =
              submitted > 0
                ? Math.round(
                    exam.attempts.reduce((s, a) => s + ((a.score ?? 0) / (a.total || 1)) * 100, 0) / submitted
                  )
                : null;

            return (
              <Card key={exam.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Monitor className="h-4 w-4 text-blue-600 shrink-0" />
                        <p className="font-semibold">{exam.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                        {exam.class && <span className="text-xs text-gray-500">· {exam.class.name}</span>}
                      </div>
                      {exam.instructions && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{exam.instructions}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {exam.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {exam._count.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {exam._count.attempts} attempts
                        </span>
                        <span>Start: {new Date(exam.startTime).toLocaleString()}</span>
                        <span>End: {new Date(exam.endTime).toLocaleString()}</span>
                      </div>
                    </div>
                    {avgScore !== null && (
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold text-blue-600">{avgScore}%</p>
                        <p className="text-xs text-gray-400">{submitted} submitted</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap">
                    <Link href={`/online-exams/${exam.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" /> Manage
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={exam.isPublished ? "outline" : "default"}
                      onClick={() => togglePublish(exam)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {exam.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(exam)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => del(exam.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog (kept for editing existing exams) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Exam Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Mid-term Math Quiz"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class (optional)</Label>
                <select className={SEL} value={form.classId} onChange={(e) => set("classId", e.target.value)}>
                  <option value="">Any class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Subject (optional)</Label>
                <select className={SEL} value={form.subjectId} onChange={(e) => set("subjectId", e.target.value)}>
                  <option value="">Any subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Duration (minutes) *</Label>
                <Input
                  type="number"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  min={1}
                />
              </div>
              <div>
                <Label>Passing % (optional)</Label>
                <Input
                  type="number"
                  value={form.passingPercentage}
                  onChange={(e) => set("passingPercentage", e.target.value)}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => set("endTime", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Instructions (optional)</Label>
              <Input
                value={form.instructions}
                onChange={(e) => set("instructions", e.target.value)}
                placeholder="Instructions for students…"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "Update"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
