"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Pencil, X, Check } from "lucide-react";

type Subject = { id: string; name: string; code?: string | null };
type Props = { staffId: string; assigned: Subject[]; allSubjects: Subject[] };

export function StaffSubjectsManager({ staffId, assigned, allSubjects }: Props) {
  const [editing,    setEditing]    = useState(false);
  const [selected,   setSelected]   = useState<Set<string>>(new Set(assigned.map(s => s.id)));
  const [saving,     setSaving]     = useState(false);
  const [subjects,   setSubjects]   = useState<Subject[]>(assigned);

  function toggleSubject(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/${staffId}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubjects(data.map((ts: any) => ts.subject));
      setEditing(false);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  function handleCancel() {
    setSelected(new Set(subjects.map(s => s.id)));
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-600" /> Subjects Taught
          </span>
          {!editing ? (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Manage
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCancel}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
              <Button size="sm" disabled={saving} onClick={handleSave}><Check className="h-3.5 w-3.5 mr-1" />{saving ? "Saving…" : "Save"}</Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!editing ? (
          subjects.length === 0 ? (
            <p className="text-sm text-gray-400">No subjects assigned. Click "Manage" to assign.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <span key={s.id} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                  {s.name}{s.code && <span className="text-indigo-400 ml-1">({s.code})</span>}
                </span>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-3">Check subjects this teacher can teach:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allSubjects.map(s => {
                const checked = selected.has(s.id);
                return (
                  <label key={s.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${checked ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-200 hover:border-slate-200"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleSubject(s.id)}
                      className="rounded border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-800">{s.name}</span>
                    {s.code && <span className="text-xs text-gray-400">({s.code})</span>}
                  </label>
                );
              })}
            </div>
            {allSubjects.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No subjects available. Create subjects first.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
