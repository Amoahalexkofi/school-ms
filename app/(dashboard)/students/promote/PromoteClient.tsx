"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, CheckSquare, Square } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Props = { sessions: any[]; classSections: any[] };

export function PromoteClient({ sessions, classSections }: Props) {
  const perm = usePermission("student_information");
  // Step 1 — filter
  const [fromSessionId, setFromSessionId]         = useState("");
  const [fromClassSectionId, setFromClassSectionId] = useState("");

  // Loaded students
  const [students, setStudents]   = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Step 2 — selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Step 3 — destination
  const [toSessionId, setToSessionId]           = useState("");
  const [toClassSectionId, setToClassSectionId] = useState("");

  // Result
  const [result, setResult]   = useState<{ promoted: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function loadStudents() {
    if (!fromSessionId || !fromClassSectionId) { alert("Select session and class first"); return; }
    setLoadingStudents(true);
    setStudents([]);
    setSelected(new Set());
    setResult(null);
    try {
      const res = await fetch(
        `/api/students?sessionId=${fromSessionId}&classSectionId=${fromClassSectionId}`
      );
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : data.students ?? []);
    } catch (e: any) { alert(e.message); }
    finally { setLoadingStudents(false); }
  }

  function toggleAll() {
    if (selected.size === students.length) setSelected(new Set());
    else setSelected(new Set(students.map((s: any) => s.id)));
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function promote() {
    if (!selected.size) { alert("Select at least one student"); return; }
    if (!toSessionId || !toClassSectionId) { alert("Select destination session and class"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/students/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentIds: Array.from(selected),
          toSessionId,
          toClassSectionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      setSelected(new Set());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const fromCS = classSections.find((cs: any) => cs.id === fromClassSectionId);
  const toCS   = classSections.find((cs: any) => cs.id === toClassSectionId);

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/students" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
      </Link>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          ✓ Promoted <strong>{result.promoted}</strong> student{result.promoted !== 1 ? "s" : ""}.
          {result.skipped > 0 && ` ${result.skipped} already enrolled in destination — skipped.`}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Step 1: Source ── */}
      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Step 1 — Select Source Class</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Current Session</label>
              <select className={SEL} value={fromSessionId} onChange={e => setFromSessionId(e.target.value)}>
                <option value="">— Select session —</option>
                {sessions.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.session}{s.isActive ? " (Active)" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Current Class / Section</label>
              <select className={SEL} value={fromClassSectionId} onChange={e => setFromClassSectionId(e.target.value)}>
                <option value="">— Select class —</option>
                {classSections.map((cs: any) => (
                  <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={loadStudents} disabled={loadingStudents || !fromSessionId || !fromClassSectionId}>
              {loadingStudents ? "Loading…" : "Load Students"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Step 2: Select Students ── */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-slate-900">Step 2 — Select Students</CardTitle>
              <button onClick={toggleAll} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
                {selected.size === students.length
                  ? <><CheckSquare className="h-4 w-4" /> Deselect all</>
                  : <><Square className="h-4 w-4" /> Select all</>
                }
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-t">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Roll No.</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((s: any) => {
                    const checked = selected.has(s.id);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => toggle(s.id)}
                        className={`cursor-pointer ${checked ? "bg-blue-50" : "hover:bg-gray-50"}`}
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" readOnly checked={checked} className="h-4 w-4 rounded border-slate-200 text-blue-600" />
                        </td>
                        <td className="px-4 py-3 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {s.sessions?.find((ss: any) => ss.sessionId === fromSessionId)?.rollNo ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-500">
              {selected.size} of {students.length} selected
            </div>
          </CardContent>
        </Card>
      )}

      {students.length === 0 && fromSessionId && fromClassSectionId && !loadingStudents && (
        <p className="text-sm text-gray-400 text-center py-4">No students found in this class for the selected session.</p>
      )}

      {/* ── Step 3: Destination ── */}
      {selected.size > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Step 3 — Select Destination</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">New Session</label>
                <select className={SEL} value={toSessionId} onChange={e => setToSessionId(e.target.value)}>
                  <option value="">— Select session —</option>
                  {sessions.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.session}{s.isActive ? " (Active)" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">New Class / Section</label>
                <select className={SEL} value={toClassSectionId} onChange={e => setToClassSectionId(e.target.value)}>
                  <option value="">— Select class —</option>
                  {classSections.map((cs: any) => (
                    <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {fromCS && toCS && toSessionId && toClassSectionId && (
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
                <span className="font-medium text-gray-800">{fromCS.class.name} – {fromCS.section.name}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-blue-700">{toCS.class.name} – {toCS.section.name}</span>
                <span className="text-gray-400">·</span>
                <span>{selected.size} student{selected.size !== 1 ? "s" : ""}</span>
              </div>
            )}

            <div className="mt-4">
              {perm.canEdit && (
                <Button
                  disabled={loading || !toSessionId || !toClassSectionId}
                  onClick={promote}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Promoting…" : `Promote ${selected.size} Student${selected.size !== 1 ? "s" : ""}`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
