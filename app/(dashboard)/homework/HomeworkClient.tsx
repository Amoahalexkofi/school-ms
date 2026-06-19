"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePermission } from "@/components/PermissionsProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, X, Trash2, Calendar } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type ClassData = { id: string; name: string; classSections: { id: string; section: { id: string; name: string } }[] };

const emptyForm = { title: "", description: "", subjectId: "", staffId: "", dueDate: "" };

export function HomeworkClient({ classes, staff, session }: {
  classes: ClassData[];
  staff: { id: string; firstName: string; lastName: string }[];
  session: { id: string; session: string } | null;
}) {
  const { data: authSession } = useSession();
  const role = (authSession?.user as any)?.role;
  const perm = usePermission("homework");

  const [classId, setClassId]             = useState("");
  const [classSectionId, setClassSectionId] = useState("");
  const [subjects, setSubjects]           = useState<{ id: string; name: string; code: string }[]>([]);
  const [homework, setHomework]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(false);
  const [showForm, setShowForm]           = useState(false);
  const [form, setForm]                   = useState<any>(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState("");

  const selectedClass = classes.find(c => c.id === classId);
  const sections = selectedClass?.classSections ?? [];

  // Load subjects when class + session change
  useEffect(() => {
    if (!classId || !session?.id) { setSubjects([]); return; }
    fetch(`/api/subjects?classId=${classId}&sessionId=${session.id}`)
      .then(r => r.json())
      .then(d => setSubjects(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [classId, session?.id]);

  // Load homework when class-section changes
  useEffect(() => {
    if (!classSectionId) { setHomework([]); return; }
    setLoading(true);
    fetch(`/api/homework?classSectionId=${classSectionId}`)
      .then(r => r.json())
      .then(d => setHomework(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classSectionId]);

  function set(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title || !form.subjectId || !form.dueDate) {
      setError("Title, subject and due date are required"); return;
    }
    if (!classSectionId || !session?.id) { setError("Select class and section first"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          subjectId: form.subjectId,
          classSectionId,
          staffId: form.staffId || null,
          sessionId: session.id,
          dueDate: new Date(form.dueDate).toISOString(),
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      // Reload
      const updated = await fetch(`/api/homework?classSectionId=${classSectionId}`).then(r => r.json());
      setHomework(Array.isArray(updated) ? updated : []);
      setShowForm(false);
      setForm(emptyForm);
    } catch (e: any) { setError(e.message ?? "Failed to save"); }
    finally { setSaving(false); }
  }

  async function deleteHw(id: string) {
    if (!confirm("Delete this homework?")) return;
    await fetch(`/api/homework/${id}`, { method: "DELETE" });
    setHomework(h => h.filter(x => x.id !== id));
  }

  const canCreate = (role === "SUPER_ADMIN" || role === "ADMIN" || role === "TEACHER") && perm.canAdd;

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Class *</Label>
              <select className={SEL + " w-40"} value={classId} onChange={e => { setClassId(e.target.value); setClassSectionId(""); setHomework([]); }}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Section *</Label>
              <select className={SEL + " w-36"} value={classSectionId} onChange={e => setClassSectionId(e.target.value)} disabled={!classId}>
                <option value="">Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.section.name}</option>)}
              </select>
            </div>
            {session && <p className="text-xs text-gray-400 self-end pb-2">Session: {session.session}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Homework list */}
      {classSectionId && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              Homework — {selectedClass?.name} / {sections.find(s => s.id === classSectionId)?.section.name}
            </h2>
            {canCreate && (
              <Button onClick={() => { setShowForm(true); setError(""); setForm(emptyForm); }}>
                <Plus className="h-4 w-4 mr-1" /> Assign Homework
              </Button>
            )}
          </div>

          {/* Add form */}
          {showForm && (
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-blue-800">Assign Homework</CardTitle>
                  <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Chapter 5 exercises" />
                </div>
                <div>
                  <Label>Subject *</Label>
                  <select className={SEL} value={form.subjectId} onChange={e => set("subjectId", e.target.value)}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>
                <div>
                  <Label>Assigned By</Label>
                  <select className={SEL} value={form.staffId} onChange={e => set("staffId", e.target.value)}>
                    <option value="">Select Teacher</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Due Date *</Label>
                  <Input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    rows={3}
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Instructions, details…"
                  />
                </div>
                {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
                <div className="sm:col-span-2 flex gap-2">
                  <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Assign"}</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && <p className="text-sm text-gray-400 text-center py-8">Loading…</p>}

          {!loading && homework.length === 0 && (
            <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No homework assigned yet for this class</p>
            </div>
          )}

          {!loading && homework.length > 0 && (
            <div className="space-y-3">
              {homework.map((hw: any) => {
                const overdue = new Date(hw.dueDate) < new Date() && !hw.isActive;
                const daysLeft = Math.ceil((new Date(hw.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <Card key={hw.id} className={overdue ? "border-red-200" : ""}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-800">{hw.title}</h3>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {hw.subject?.name ?? "—"}
                            </span>
                          </div>
                          {hw.description && <p className="text-sm text-gray-600 mb-2">{hw.description}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(hw.dueDate).toLocaleDateString()}
                              {daysLeft > 0 ? <span className="text-amber-600 ml-1">({daysLeft}d left)</span>
                               : daysLeft === 0 ? <span className="text-red-600 ml-1">(today)</span>
                               : <span className="text-red-500 ml-1">(overdue)</span>}
                            </span>
                            {hw.staff && <span>By: {hw.staff.firstName} {hw.staff.lastName}</span>}
                            {hw.acknowledgements?.length > 0 && (
                              <span>{hw.acknowledgements.length} student{hw.acknowledgements.length !== 1 ? "s" : ""} acknowledged</span>
                            )}
                          </div>
                        </div>
                        {perm.canDelete && (role === "SUPER_ADMIN" || role === "ADMIN" || role === "TEACHER") && (
                          <Button size="sm" variant="ghost" onClick={() => deleteHw(hw.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {!classSectionId && (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a class and section to view homework</p>
        </div>
      )}
    </main>
  );
}
