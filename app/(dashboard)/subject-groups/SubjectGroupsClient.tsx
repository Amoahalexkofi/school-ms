"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, BookOpen, LayoutGrid } from "lucide-react";

type Subject      = { id: string; name: string; code?: string | null; type?: string | null };
type ClassSection = { id: string; class: { id: string; name: string }; section: { id: string; name: string } };
type Session      = { id: string; session: string };
type Group = {
  id: string;
  name: string;
  description?: string | null;
  sessionId: string;
  isActive: boolean;
  subjects: { subject: Subject }[];
  sections: { classSection: ClassSection }[];
};

type Props = {
  sessions: Session[];
  groups: Group[];
  subjects: Subject[];
  classSections: ClassSection[];
};

function blank(sessionId: string) {
  return { name: "", description: "", sessionId };
}

export function SubjectGroupsClient({ sessions, groups: init, subjects, classSections }: Props) {
  const [groups,     setGroups]     = useState<Group[]>(init);
  const [sessionId,  setSessionId]  = useState(sessions[0]?.id ?? "");
  const [open,       setOpen]       = useState(false);
  const [edit,       setEdit]       = useState<Group | null>(null);
  const [form,       setForm]       = useState(blank(sessionId));
  const [selSubjects, setSelSubjects] = useState<Set<string>>(new Set());
  const [selSections, setSelSections] = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(false);
  const [err,        setErr]        = useState("");

  const filtered = groups.filter(g => g.sessionId === sessionId);

  // Class sections with a unique class list for grouping
  const classMap = useMemo(() => {
    const m = new Map<string, { classId: string; className: string; sections: ClassSection[] }>();
    for (const cs of classSections) {
      const cid = cs.class.id;
      if (!m.has(cid)) m.set(cid, { classId: cid, className: cs.class.name, sections: [] });
      m.get(cid)!.sections.push(cs);
    }
    return Array.from(m.values()).sort((a, b) => a.className.localeCompare(b.className));
  }, [classSections]);

  function openNew() {
    setForm(blank(sessionId));
    setSelSubjects(new Set());
    setSelSections(new Set());
    setEdit(null);
    setErr("");
    setOpen(true);
  }

  function openEdit(g: Group) {
    setForm({ name: g.name, description: g.description ?? "", sessionId: g.sessionId });
    setSelSubjects(new Set(g.subjects.map(s => s.subject.id)));
    setSelSections(new Set(g.sections.map(s => s.classSection.id)));
    setEdit(g);
    setErr("");
    setOpen(true);
  }

  function toggleSub(id: string) {
    setSelSubjects(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleSec(id: string) {
    setSelSections(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function save() {
    if (!form.name.trim()) { setErr("Name is required"); return; }
    setLoading(true); setErr("");
    try {
      if (edit) {
        // Diff-based PATCH — mirrors Subjectgroup_model edit()
        const origSubjects = new Set(edit.subjects.map(s => s.subject.id));
        const origSections = new Set(edit.sections.map(s => s.classSection.id));
        const addSubjectIds        = [...selSubjects].filter(id => !origSubjects.has(id));
        const removeSubjectIds     = [...origSubjects].filter(id => !selSubjects.has(id));
        const addClassSectionIds   = [...selSections].filter(id => !origSections.has(id));
        const removeClassSectionIds = [...origSections].filter(id => !selSections.has(id));

        const res = await fetch(`/api/subject-groups/${edit.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description || null,
            addSubjectIds, removeSubjectIds, addClassSectionIds, removeClassSectionIds,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGroups(gs => gs.map(g => g.id === edit.id ? data : g));
      } else {
        const res = await fetch("/api/subject-groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            description: form.description || null,
            sessionId: form.sessionId,
            subjectIds:      [...selSubjects],
            classSectionIds: [...selSections],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGroups(gs => [...gs, data]);
      }
      setOpen(false);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this subject group? This also removes timetable links.")) return;
    const res = await fetch(`/api/subject-groups/${id}`, { method: "DELETE" });
    if (res.ok) setGroups(gs => gs.filter(g => g.id !== id));
  }

  return (
    <main className="flex-1 p-6 space-y-5 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <select
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            className="text-sm border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>{s.session}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} group{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1.5" /> New Group
        </Button>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-400">
            No subject groups for this session. Create one to organise subjects and class sections.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(g => (
          <Card key={g.id} className={g.isActive ? "" : "opacity-60"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-indigo-600" />
                  {g.name}
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(g)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => remove(g.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Subjects */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Subjects ({g.subjects.length})</p>
                {g.subjects.length === 0
                  ? <p className="text-xs text-gray-300 italic">None assigned</p>
                  : (
                    <div className="flex flex-wrap gap-1">
                      {g.subjects.map(({ subject: s }) => (
                        <span key={s.id} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                          {s.name}{s.code ? ` (${s.code})` : ""}
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
              {/* Class sections */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Class Sections ({g.sections.length})</p>
                {g.sections.length === 0
                  ? <p className="text-xs text-gray-300 italic">None assigned</p>
                  : (
                    <div className="flex flex-wrap gap-1">
                      {g.sections.map(({ classSection: cs }) => (
                        <span key={cs.id} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                          {cs.class.name} – {cs.section.name}
                        </span>
                      ))}
                    </div>
                  )
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit Subject Group" : "New Subject Group"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Science Group A"
              />
            </div>

            {!edit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
                <select
                  value={form.sessionId}
                  onChange={e => setForm(f => ({ ...f, sessionId: e.target.value }))}
                  className="w-full text-sm border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subjects <span className="text-gray-400 font-normal">({selSubjects.size} selected)</span>
              </label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto grid grid-cols-2 gap-1.5">
                {subjects.map(s => (
                  <label key={s.id} className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded ${selSubjects.has(s.id) ? "bg-indigo-50" : "hover:bg-gray-50"}`}>
                    <input
                      type="checkbox"
                      checked={selSubjects.has(s.id)}
                      onChange={() => toggleSub(s.id)}
                      className="rounded border-gray-300 text-indigo-600"
                    />
                    <span className="text-gray-800 truncate">{s.name}</span>
                    {s.code && <span className="text-gray-400 text-xs">({s.code})</span>}
                  </label>
                ))}
                {subjects.length === 0 && <p className="text-xs text-gray-400 col-span-2">No subjects available.</p>}
              </div>
            </div>

            {/* Class sections — grouped by class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Sections <span className="text-gray-400 font-normal">({selSections.size} selected)</span>
              </label>
              <p className="text-xs text-gray-400 mb-2">Each section can only belong to one group per session.</p>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
                {classMap.map(({ classId, className, sections }) => (
                  <div key={classId}>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{className}</p>
                    <div className="grid grid-cols-2 gap-1">
                      {sections.map(cs => (
                        <label key={cs.id} className={`flex items-center gap-2 text-sm cursor-pointer px-2 py-1 rounded ${selSections.has(cs.id) ? "bg-green-50" : "hover:bg-gray-50"}`}>
                          <input
                            type="checkbox"
                            checked={selSections.has(cs.id)}
                            onChange={() => toggleSec(cs.id)}
                            className="rounded border-gray-300 text-green-600"
                          />
                          <span className="text-gray-800">{cs.section.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                {classSections.length === 0 && <p className="text-xs text-gray-400">No class sections available.</p>}
              </div>
            </div>
          </div>

          {err && <p className="text-sm text-red-600 mt-1">{err}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={save}>{loading ? "Saving…" : "Save Group"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
