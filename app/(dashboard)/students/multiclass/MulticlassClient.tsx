"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Layers, Plus, Search, Trash2, AlertCircle } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

type CS = { id: string; class: { id: string; name: string }; section: { id: string; name: string } };
type Membership = { classSectionId: string; defaultLogin: boolean };
type Student = {
  id: string; admissionNo: string; firstName: string; middleName?: string | null; lastName?: string | null;
  sessions: { classSectionId: string; defaultLogin: boolean; classSection: CS }[];
};

export function MulticlassClient({ classSections, sessionName }: { classSections: CS[]; sessionName: string | null }) {
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [students, setStudents] = useState<Student[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // editor state
  const [editing, setEditing] = useState<Student | null>(null);
  const [rows, setRows] = useState<Membership[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const classes = Array.from(new Map(classSections.map(cs => [cs.class.id, cs.class])).values());
  const sections = classSections.filter(cs => cs.class.id === classId).map(cs => cs.section);

  async function search() {
    if (!classId) { setError("Select a class first"); return; }
    setLoading(true); setError("");
    try {
      const qs = new URLSearchParams({ classId, ...(sectionId ? { sectionId } : {}) });
      const res = await fetch(`/api/students/multiclass?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setStudents(data.students);
    } catch (e: any) { setError(e.message); setStudents(null); }
    finally { setLoading(false); }
  }

  function openEditor(s: Student) {
    setSaveError("");
    setEditing(s);
    setRows(s.sessions.map(x => ({ classSectionId: x.classSectionId, defaultLogin: x.defaultLogin })));
  }

  function labelOf(csId: string) {
    const cs = classSections.find(c => c.id === csId);
    return cs ? `${cs.class.name} – ${cs.section.name}` : "—";
  }

  async function save() {
    if (!editing) return;
    setSaving(true); setSaveError("");
    try {
      const res = await fetch("/api/students/multiclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: editing.id, entries: rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setEditing(null);
      await search();
    } catch (e: any) { setSaveError(e.message); }
    finally { setSaving(false); }
  }

  const hasDefault = rows.some(r => r.defaultLogin);
  const dupSelected = new Set(rows.map(r => r.classSectionId).filter(Boolean)).size
    !== rows.filter(r => r.classSectionId).length;

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back to Students
        </Link>
        {sessionName && <span className="text-sm text-gray-500">Session: <span className="font-medium text-gray-700">{sessionName}</span></span>}
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Multi-Class Students</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Assign a student to more than one class or section in the current session. The primary
              class is used for login, reports and fee collection.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
              <select className={SEL} value={classId} onChange={e => { setClassId(e.target.value); setSectionId(""); }}>
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
              <select className={SEL} value={sectionId} onChange={e => setSectionId(e.target.value)} disabled={!classId}>
                <option value="">All sections</option>
                {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Button onClick={search} disabled={loading || !classId}>
              <Search className="h-4 w-4 mr-1" /> {loading ? "Searching…" : "Search"}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </CardContent>
      </Card>

      {students !== null && (
        <Card>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No students found for this class.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Adm No.", "Student Name", "Classes (current session)", ""].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3 font-medium">
                          {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {s.sessions.map(x => (
                              <span key={x.classSectionId}
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                                  x.defaultLogin
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                    : "border-slate-200 bg-slate-50 text-slate-600"
                                }`}>
                                {x.classSection.class.name} – {x.classSection.section.name}
                                {x.defaultLogin && <span className="ml-1 font-medium">· primary</span>}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => openEditor(s)}>
                            <Layers className="h-3.5 w-3.5 mr-1" /> Manage
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Membership editor */}
      <Dialog open={!!editing} onOpenChange={o => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Classes — {editing?.firstName} {editing?.lastName ?? ""}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This defines the student&apos;s full set of classes for the current session.
            Removed classes must have no attendance or fee records.
          </p>
          <div className="space-y-2 mt-2">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  className={SEL}
                  value={r.classSectionId}
                  onChange={e => setRows(rs => rs.map((x, j) => j === i ? { ...x, classSectionId: e.target.value } : x))}>
                  <option value="">Select class – section</option>
                  {classSections.map(cs => (
                    <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                  ))}
                </select>
                <label className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
                  <input
                    type="radio"
                    name="primary-class"
                    checked={r.defaultLogin}
                    onChange={() => setRows(rs => rs.map((x, j) => ({ ...x, defaultLogin: j === i })))}
                  />
                  Primary
                </label>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-600 shrink-0"
                  disabled={rows.length <= 1}
                  onClick={() => setRows(rs => {
                    const next = rs.filter((_, j) => j !== i);
                    return next.some(x => x.defaultLogin) || next.length === 0
                      ? next
                      : next.map((x, j) => ({ ...x, defaultLogin: j === 0 }));
                  })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline"
              onClick={() => setRows(rs => [...rs, { classSectionId: "", defaultLogin: rs.length === 0 }])}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Class
            </Button>
          </div>
          {dupSelected && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              The same class–section is selected twice.
            </p>
          )}
          {saveError && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">{saveError}</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              disabled={saving || dupSelected || !hasDefault || rows.length === 0 || rows.some(r => !r.classSectionId)}
              onClick={save}>
              {saving ? "Saving…" : "Save Classes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
