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

  async function load() {
    if (!classSectionId) { setError("Select a class"); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/exams/results/${group.id}?classSectionId=${classSectionId}`);
      const d    = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const cs = classSections.find((cs: any) => cs.id === classSectionId);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`/exams/${group.id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        {data && (
          <button onClick={() => window.print()} className="text-sm text-blue-600 hover:underline">Print Results</button>
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
              <table className="w-full text-sm">
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
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.rows.map((row: any) => (
                    <tr key={row.student.id} className={`hover:bg-gray-50 ${!row.allPassing ? "bg-red-50/20" : ""}`}>
                      <td className="px-3 py-3 text-center">
                        {row.rank <= 3 ? (
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                            row.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                            row.rank === 2 ? "bg-gray-100 text-gray-600" :
                            "bg-orange-100 text-orange-700"
                          }`}>{row.rank}</span>
                        ) : (
                          <span className="text-gray-500">{row.rank}</span>
                        )}
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
