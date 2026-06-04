"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const SECTION_ID = "section-g1-a";
const SUBJECTS = [
  { id: "subj-math", name: "Mathematics" },
  { id: "subj-eng", name: "English Language" },
  { id: "subj-sci", name: "Integrated Science" },
  { id: "subj-soc", name: "Social Studies" },
];

export default function HomeworkPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const [homework, setHomework] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/homework?sectionId=${SECTION_ID}`).catch(() => null);
    if (res?.ok) setHomework(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    fetch("/api/students").then(r => r.json()).then(setStudents).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError("");
    const fd = new FormData(e.currentTarget);
    // get staff id for the teacher
    const staffRes = await fetch("/api/staff").then(r => r.json()).catch(() => []);
    const staffId = staffRes[0]?.id ?? "";

    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"),
          description: fd.get("description"),
          subjectId: fd.get("subjectId"),
          sectionId: SECTION_ID,
          assignedById: staffId,
          dueDate: fd.get("dueDate"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDialog(false);
      await load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function handleAcknowledge(hwId: string) {
    const student = students[0]; // in a real app, get the logged-in student's id
    if (!student) return;
    await fetch(`/api/homework/${hwId}/acknowledge`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    });
    await load();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Homework" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{homework.length} assignment{homework.length !== 1 ? "s" : ""}</p>
          {(role === "TEACHER" || role === "ADMIN" || role === "SUPER_ADMIN") && (
            <Button size="sm" onClick={() => { setDialog(true); setError(""); }}>
              <Plus className="h-4 w-4 mr-1" /> Assign Homework
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading…</div>
        ) : homework.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No homework assigned yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {homework.map((hw: any) => {
              const due = new Date(hw.dueDate);
              const overdue = due < today;
              const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
              const subject = SUBJECTS.find(s => s.id === hw.subjectId);

              return (
                <Card key={hw.id} className={overdue ? "border-red-200" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                            {subject?.name ?? hw.subjectId}
                          </span>
                          {overdue ? (
                            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Overdue
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {daysLeft === 0 ? "Due today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900">{hw.title}</h3>
                        {hw.description && (
                          <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Due: {due.toLocaleDateString()} ·
                          Assigned by: {hw.assignedBy?.firstName} {hw.assignedBy?.lastName}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {role === "STUDENT" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleAcknowledge(hw.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledge
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {hw._count?.acknowledgements ?? 0} acknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={dialog} onOpenChange={setDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <select name="subjectId" required className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm">
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input name="title" required placeholder="e.g. Chapter 5 Exercises" />
              </div>
              <div className="space-y-1.5">
                <Label>Description (optional)</Label>
                <Input name="description" placeholder="Additional instructions…" />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input name="dueDate" type="date" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>{saving ? "Assigning…" : "Assign"}</Button>
                <Button type="button" variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
