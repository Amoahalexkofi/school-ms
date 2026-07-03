"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, UserCheck, AlertCircle, Users } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

type StudentRow = {
  id: string; admissionNo: string; firstName: string; middleName?: string | null;
  lastName?: string | null; gender?: string | null; rollNo?: string | null; assigned: boolean;
};

export function AssignStudentsClient({
  examGroupId, groupName, classSections, initialClassSectionId,
}: {
  examGroupId: string;
  groupName: string;
  classSections: { id: string; label: string }[];
  initialClassSectionId?: string;
}) {
  const [classSectionId, setClassSectionId] = useState(
    initialClassSectionId && classSections.some(cs => cs.id === initialClassSectionId)
      ? initialClassSectionId
      : classSections[0]?.id ?? ""
  );
  const [students, setStudents] = useState<StudentRow[] | null>(null);
  const [hasRoster, setHasRoster] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const load = useCallback(async (csId: string) => {
    if (!csId) { setStudents(null); return; }
    setLoading(true); setError(""); setSavedMsg("");
    try {
      const res = await fetch(`/api/exams/${examGroupId}/students?classSectionId=${csId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load students");
      setStudents(data.students);
      setHasRoster(data.hasRoster);
      // No roster saved yet → everyone sits the exam, so pre-check all.
      setChecked(new Set(
        data.hasRoster
          ? data.students.filter((s: StudentRow) => s.assigned).map((s: StudentRow) => s.id)
          : data.students.map((s: StudentRow) => s.id)
      ));
    } catch (e: any) { setError(e.message); setStudents(null); }
    finally { setLoading(false); }
  }, [examGroupId]);

  useEffect(() => { load(classSectionId); }, [classSectionId, load]);

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const allChecked = !!students?.length && checked.size === students.length;

  async function save() {
    setSaving(true); setError(""); setSavedMsg("");
    try {
      // Everyone checked = whole-class default → store no roster rows.
      const studentIds = allChecked ? [] : Array.from(checked);
      const res = await fetch(`/api/exams/${examGroupId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classSectionId, studentIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setHasRoster(data.hasRoster);
      setSavedMsg(data.hasRoster
        ? `Roster saved — ${checked.size} of ${students?.length} students sit this exam.`
        : "Roster cleared — the whole class sits this exam (default).");
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`/exams/${examGroupId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back to {groupName}
        </Link>
        <Button disabled={saving || loading || !students} onClick={save}>
          <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save Roster"}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Who sits this exam?</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Untick students who do not take {groupName} (e.g. exempted or transferred mid-term).
              With everyone ticked, the whole class is included by default. Unticked students are
              left out of mark entry and the term report.
            </p>
          </div>
          <div className="max-w-xs">
            <label className="block text-xs font-medium text-gray-600 mb-1">Class – Section</label>
            <select className={SEL} value={classSectionId} onChange={e => setClassSectionId(e.target.value)}>
              {classSections.length === 0 && <option value="">No classes scheduled</option>}
              {classSections.map(cs => <option key={cs.id} value={cs.id}>{cs.label}</option>)}
            </select>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          {savedMsg && (
            <div className="flex items-center gap-2 text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <UserCheck className="h-4 w-4 shrink-0" /> {savedMsg}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="py-14 text-center text-gray-400 text-sm">Loading students…</CardContent></Card>
      ) : students && (
        <Card>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active students in this class.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input
                          type="checkbox"
                          aria-label="Select all students"
                          checked={allChecked}
                          onChange={() => setChecked(allChecked ? new Set() : new Set(students.map(s => s.id)))}
                        />
                      </th>
                      {["Adm No.", "Student Name", "Roll No", "Gender", "Sits Exam"].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map(s => {
                      const on = checked.has(s.id);
                      return (
                        <tr key={s.id} className={`hover:bg-gray-50 ${!on ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={on} onChange={() => toggle(s.id)}
                              aria-label={`${s.firstName} ${s.lastName ?? ""} sits exam`} />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                          <td className="px-4 py-3 font-medium">
                            {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{s.rollNo ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{s.gender ?? "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>{on ? "Included" : "Excluded"}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {students.length > 0 && (
              <div className="border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">{checked.size} of {students.length} included{hasRoster ? "" : " (whole class — no roster saved)"}</span>
                <Button disabled={saving} onClick={save}>
                  <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save Roster"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
