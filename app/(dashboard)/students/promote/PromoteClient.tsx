"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Props = { sessions: any[]; classSections: any[] };

type Choice = { checked: boolean; result: "pass" | "fail"; status: "continue" | "leave" };

export function PromoteClient({ sessions, classSections }: Props) {
  const perm = usePermission("student_information");

  // Source + destination (Smart School's filter form carries all of these)
  const [fromSessionId, setFromSessionId] = useState("");
  const [fromClassSectionId, setFromClassSectionId] = useState("");
  const [toSessionId, setToSessionId] = useState("");
  const [toClassSectionId, setToClassSectionId] = useState("");

  const [students, setStudents] = useState<any[] | null>(null);
  const [alreadyPromoted, setAlreadyPromoted] = useState(0);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [result, setResult] = useState<{ promoted: number; retained: number; left: number; skipped: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ready = fromSessionId && fromClassSectionId && toSessionId && toClassSectionId;
  const sameSession = fromSessionId && fromSessionId === toSessionId;

  async function loadStudents() {
    if (!ready) { setError("Select the current class and the promote-to session/class first"); return; }
    if (sameSession) { setError("The promote-to session must be different from the current session"); return; }
    setLoadingStudents(true); setError(""); setStudents(null); setResult(null);
    try {
      const qs = new URLSearchParams({ fromSessionId, fromClassSectionId, toSessionId });
      const res = await fetch(`/api/students/promote?${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load students");
      setStudents(data.students);
      setAlreadyPromoted(data.alreadyPromoted ?? 0);
      // SS defaults: checked, pass, continue
      setChoices(Object.fromEntries(data.students.map((s: any) => [s.id, { checked: true, result: "pass", status: "continue" }])));
    } catch (e: any) { setError(e.message); }
    finally { setLoadingStudents(false); }
  }

  function setChoice(id: string, patch: Partial<Choice>) {
    setChoices(c => ({ ...c, [id]: { ...c[id], ...patch } }));
  }

  const selectedCount = students ? students.filter(s => choices[s.id]?.checked).length : 0;

  async function promote() {
    if (!students || selectedCount === 0) { setError("Select at least one student"); return; }
    const summary = students.filter(s => choices[s.id]?.checked).map(s => choices[s.id]);
    const leaving = summary.filter(c => c.status === "leave").length;
    if (!confirm(
      `Promote ${selectedCount} student${selectedCount !== 1 ? "s" : ""}?` +
      (leaving ? ` ${leaving} will LEAVE the school and become alumni.` : "")
    )) return;

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/students/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromSessionId, fromClassSectionId, toSessionId, toClassSectionId,
          students: students
            .filter(s => choices[s.id]?.checked)
            .map(s => ({ studentId: s.id, result: choices[s.id].result, status: choices[s.id].status })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      await loadStudents();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const fromCS = classSections.find((cs: any) => cs.id === fromClassSectionId);
  const toCS = classSections.find((cs: any) => cs.id === toClassSectionId);

  return (
    <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto space-y-6 w-full">
      <Link href="/students" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
      </Link>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">
          ✓ Done — <strong>{result.promoted}</strong> promoted
          {result.retained > 0 && <>, <strong>{result.retained}</strong> retained in the same class</>}
          {result.left > 0 && <>, <strong>{result.left}</strong> left school (now alumni)</>}
          {result.skipped > 0 && <>, {result.skipped} skipped</>}.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Source + destination */}
      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Promote Students</CardTitle></CardHeader>
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
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Promote in Session</label>
              <select className={SEL} value={toSessionId} onChange={e => setToSessionId(e.target.value)}>
                <option value="">— Select session —</option>
                {sessions.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.session}{s.isActive ? " (Active)" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Promote to Class / Section (on pass)</label>
              <select className={SEL} value={toClassSectionId} onChange={e => setToClassSectionId(e.target.value)}>
                <option value="">— Select class —</option>
                {classSections.map((cs: any) => (
                  <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
                ))}
              </select>
            </div>
          </div>
          {sameSession && (
            <p className="text-xs text-red-600 mt-2">The promote-to session must differ from the current session.</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Button onClick={loadStudents} disabled={loadingStudents || !ready || !!sameSession}>
              {loadingStudents ? "Loading…" : "Load Students"}
            </Button>
            {fromCS && toCS && (
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">{fromCS.class.name} – {fromCS.section.name}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-indigo-700">{toCS.class.name} – {toCS.section.name}</span>
                <span className="text-gray-400 text-xs">(failed students stay in {fromCS.class.name})</span>
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Roster with per-student choices */}
      {students && (
        students.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400 text-sm">
            <GraduationCap className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No promotable students{alreadyPromoted > 0 ? ` — ${alreadyPromoted} already have a record in the destination session` : ""}.
          </CardContent></Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-bold text-slate-900">Students ({students.length})</CardTitle>
                {alreadyPromoted > 0 && (
                  <span className="text-xs text-gray-400">{alreadyPromoted} already promoted — hidden</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-t">
                    <tr>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" aria-label="Select all"
                          checked={selectedCount === students.length}
                          onChange={() => {
                            const all = selectedCount === students.length;
                            setChoices(c => Object.fromEntries(Object.entries(c).map(([k, v]) => [k, { ...v, checked: !all }])));
                          }} />
                      </th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Current Result</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Next Session Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((s: any) => {
                      const c = choices[s.id];
                      return (
                        <tr key={s.id} className={c?.checked ? "" : "opacity-50"}>
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={c?.checked ?? false}
                              aria-label={`Include ${s.firstName} ${s.lastName ?? ""}`}
                              onChange={() => setChoice(s.id, { checked: !c?.checked })} />
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-4 text-sm">
                              {(["pass", "fail"] as const).map(v => (
                                <label key={v} className="flex items-center gap-1.5 cursor-pointer capitalize">
                                  <input type="radio" name={`result-${s.id}`} checked={c?.result === v}
                                    disabled={!c?.checked} onChange={() => setChoice(s.id, { result: v })} />
                                  <span className={c?.result === v ? (v === "pass" ? "text-green-700 font-medium" : "text-red-700 font-medium") : "text-gray-500"}>{v}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-4 text-sm">
                              {(["continue", "leave"] as const).map(v => (
                                <label key={v} className="flex items-center gap-1.5 cursor-pointer capitalize">
                                  <input type="radio" name={`status-${s.id}`} checked={c?.status === v}
                                    disabled={!c?.checked} onChange={() => setChoice(s.id, { status: v })} />
                                  <span className={c?.status === v ? (v === "continue" ? "text-indigo-700 font-medium" : "text-amber-700 font-medium") : "text-gray-500"}>{v}</span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {selectedCount} of {students.length} selected · leave = student exits school and becomes an alumnus
                </span>
                {perm.canEdit && (
                  <Button disabled={loading || selectedCount === 0} onClick={promote}>
                    {loading ? "Promoting…" : `Promote ${selectedCount} Student${selectedCount !== 1 ? "s" : ""}`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      )}
    </main>
  );
}
