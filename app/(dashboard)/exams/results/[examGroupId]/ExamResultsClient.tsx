"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, AlertCircle } from "lucide-react";

type Props = { group: { id: string; name: string; isPublished: boolean }; classSections: any[] };

export function ExamResultsClient({ group, classSections }: Props) {
  const [classSectionId, setCsId]    = useState("");
  const [data,           setData]    = useState<any>(null);
  const [loading,        setLoading] = useState(false);
  const [error,          setError]   = useState("");
  const [rankEdits, setRankEdits]    = useState<Record<string, number>>({});
  const [savingRank, setSavingRank]  = useState(false);
  const [emailing, setEmailing]      = useState(false);

  async function emailParents() {
    if (!confirm("Email each student's report card to their guardian? (Sends only if an email provider is configured.)")) return;
    setEmailing(true);
    try {
      const res = await fetch(`/api/exams/results/${group.id}/email`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ classSectionId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      alert(d.sent > 0 ? `Report cards emailed to ${d.sent} guardian(s).` : (d.error || "No guardians with an email address."));
    } catch (e: any) { alert(e.message); }
    finally { setEmailing(false); }
  }

  async function load() {
    if (!classSectionId) { setError("Select a class"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/exams/results/${group.id}?classSectionId=${classSectionId}`);
      const d    = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
      setRankEdits(Object.fromEntries((d.rows ?? []).map((r: any) => [r.student.id, r.rank])));
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function saveRanks() {
    if (!data) return;
    setSavingRank(true);
    try {
      const ranks = data.rows.map((r: any) => ({ studentId: r.student.id, rank: rankEdits[r.student.id] ?? r.rank, classSectionId }));
      const res = await fetch(`/api/exams/results/${group.id}/rank`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ranks }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setSavingRank(false); }
  }

  const cs = classSections.find((cs: any) => cs.id === classSectionId);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`/exams/${group.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        {data && data.rows.length > 0 && (
          <div className="flex items-center gap-3">
            {data.ranksPersisted && <span className="text-xs text-green-600 font-medium">Ranks saved</span>}
            <Button size="sm" variant="outline" disabled={savingRank} onClick={saveRanks}>
              {savingRank ? "Saving…" : data.ranksPersisted ? "Update Ranks" : "Save Ranks"}
            </Button>
            <Button size="sm" variant="outline" disabled={emailing} onClick={emailParents}>
              {emailing ? "Sending…" : "Email to Parents"}
            </Button>
            <button onClick={() => window.print()} className="text-sm text-blue-600 hover:underline">Print Results</button>
          </div>
        )}
      </div>

      {!group.isPublished && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> This exam is not published — results are only visible to admin.
        </div>
      )}

      {/* Class selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-end gap-4">
        <div className="flex-1 max-w-xs">
          <label className="block text-xs font-medium text-gray-600 mb-1">Class / Section</label>
          <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            value={classSectionId} onChange={e => setCsId(e.target.value)}>
            <option value="">— Select —</option>
            {classSections.map((cs: any) => (
              <option key={cs.id} value={cs.id}>{cs.class.name} – {cs.section.name}</option>
            ))}
          </select>
        </div>
        <Button disabled={loading || !classSectionId} onClick={load}>
          {loading ? "Loading…" : "View Results"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {data && (
        <>
          {/* Subject columns header info */}
          <div className="text-sm font-medium text-gray-600">
            {cs ? `${cs.class.name} – ${cs.section.name}` : ""} · {group.name}
          </div>

          {data.rows.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-400">
              <Trophy className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No marks entered for this class yet.</p>
            </CardContent></Card>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-center px-3 py-3 font-medium text-gray-600 w-12">Rank</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    {data.schedules.map((sch: any) => (
                      <th key={sch.id} className="text-center px-3 py-3 font-medium text-gray-600 min-w-[80px]">
                        <div>{sch.subject.code}</div>
                        <div className="text-xs text-gray-400 font-normal">/{sch.fullMarks}</div>
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">%</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Division</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.rows.map((row: any) => (
                    <tr key={row.student.id} className={`hover:bg-gray-50 ${!row.allPassing ? "bg-red-50/20" : ""}`}>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number" min="1"
                          value={rankEdits[row.student.id] ?? row.rank}
                          onChange={(e) => setRankEdits((m) => ({ ...m, [row.student.id]: parseInt(e.target.value) || 0 }))}
                          className="w-12 text-center text-sm rounded border border-slate-200 px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 print:border-0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/students/${row.student.id}`} className="font-medium text-gray-900 hover:text-blue-600 hover:underline">
                          {row.student.firstName} {row.student.lastName}
                        </Link>
                        <div className="text-xs text-gray-400 font-mono">{row.student.admissionNo}</div>
                      </td>
                      {data.schedules.map((sch: any) => {
                        const sub = row.subjects[sch.subject.code];
                        if (!sub) return <td key={sch.id} className="px-3 py-3 text-center text-gray-300">—</td>;
                        return (
                          <td key={sch.id} className="px-3 py-3 text-center">
                            {sub.absent ? (
                              <span className="text-xs text-red-500">A</span>
                            ) : (
                              <div>
                                <div className={`font-medium ${sub.isPassing ? "text-gray-900" : "text-red-600"}`}>{sub.marks}</div>
                                {sub.grade && <div className="text-xs text-indigo-600 font-semibold">{sub.grade}</div>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center font-semibold">{row.totalObt} / {row.totalFull}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.pct >= 50 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {row.pct}%
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-xs font-medium text-gray-700">{row.division || "—"}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${row.allPassing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {row.allPassing ? "PASS" : "FAIL"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
