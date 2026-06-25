"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, FileText, CheckCircle2, XCircle } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type MarkEntry = {
  student: {
    id: string; firstName: string; lastName: string; admissionNo: string;
    rollNo?: string; dateOfBirth?: string; gender?: string; image?: string;
    fatherName?: string; motherName?: string; currentAddress?: string;
  };
  marksObtained: number | null; grade: string | null; isPassing: boolean; note?: string;
};

type Schedule = {
  id: string; fullMarks: number; passingMarks: number;
  subject: { id: string; name: string; code: string };
  session: { id: string; session: string };
  markEntries: MarkEntry[];
};

type ExamGroup = { id: string; name: string; schedules: Schedule[] };
type ClassData = { id: string; name: string; classSections: { id: string; section: { id: string; name: string } }[] };

type Division = { name: string; from: number; to: number };

// Colour the division by its position (top band → purple, fail → red).
const DIV_COLORS = ["text-purple-700", "text-green-700", "text-blue-700", "text-yellow-700", "text-red-700"];

function makeDivisionFn(divisions: Division[]) {
  // Fall back to sensible defaults only if the school configured none.
  const bands = divisions.length
    ? divisions
    : [
        { name: "Distinction", from: 80, to: 100 },
        { name: "First Class", from: 60, to: 79.99 },
        { name: "Second Class", from: 45, to: 59.99 },
        { name: "Pass", from: 40, to: 44.99 },
        { name: "Fail", from: 0, to: 39.99 },
      ];
  return (pct: number) => {
    const idx = bands.findIndex((d) => pct >= d.from && pct <= d.to);
    if (idx === -1) return { div: "—", color: "text-gray-500" };
    return { div: bands[idx].name, color: DIV_COLORS[Math.min(idx, DIV_COLORS.length - 1)] };
  };
}

type GradeKey = { grade: string; from: number; to: number };

export function MarksheetClient({ examGroups, classes, school, divisions = [], gradeKey = [] }: {
  examGroups: ExamGroup[];
  classes: ClassData[];
  school: { name: string; address?: string; phone?: string; logo?: string } | null;
  divisions?: Division[];
  gradeKey?: GradeKey[];
}) {
  const getGradeDivision = useMemo(() => makeDivisionFn(divisions), [divisions]);
  const [examGroupId, setExamGroupId] = useState("");
  const [classId, setClassId]         = useState("");
  const [classSectionId, setClassSectionId] = useState("");

  const selectedExam  = examGroups.find(e => e.id === examGroupId);
  const selectedClass = classes.find(c => c.id === classId);
  const sections      = selectedClass?.classSections ?? [];
  const schoolName    = school?.name ?? "Skula";
  const sessionLabel  = selectedExam?.schedules?.[0]?.session?.session ?? "";

  // Build per-student marksheets from the exam schedules + mark entries
  const studentMarksheets = useMemo(() => {
    if (!selectedExam || !classSectionId) return [];

    const schedules = selectedExam.schedules;
    const studentMap: Record<string, {
      student: MarkEntry["student"];
      rows: { subjectName: string; subjectCode: string; fullMarks: number; passingMarks: number; obtained: number | null; grade: string | null; isPassing: boolean }[];
    }> = {};

    for (const sched of schedules) {
      for (const entry of sched.markEntries) {
        const sid = entry.student.id;
        if (!studentMap[sid]) studentMap[sid] = { student: entry.student, rows: [] };
        studentMap[sid].rows.push({
          subjectName: sched.subject.name,
          subjectCode: sched.subject.code,
          fullMarks:   sched.fullMarks,
          passingMarks: sched.passingMarks,
          obtained:    entry.marksObtained !== null ? Number(entry.marksObtained) : null,
          grade:       entry.grade,
          isPassing:   entry.isPassing,
        });
      }
    }

    // Sort by rollNo or name, then compute rank
    const list = Object.values(studentMap).map(ms => {
      const totalFull   = ms.rows.reduce((s, r) => s + r.fullMarks, 0);
      const totalObtained = ms.rows.reduce((s, r) => s + (r.obtained ?? 0), 0);
      const pct         = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;
      const allPassed   = ms.rows.every(r => r.isPassing);
      const { div, color } = getGradeDivision(pct);
      return { ...ms, totalFull, totalObtained, pct, allPassed, div, color };
    });

    // Rank by total obtained (descending)
    list.sort((a, b) => b.totalObtained - a.totalObtained);
    list.forEach((s, i) => (s as any).rank = i + 1);

    return list;
  }, [selectedExam, classSectionId]);

  const sectionName = sections.find(s => s.id === classSectionId)?.section.name ?? "";
  const printDate   = new Date().toLocaleDateString();

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      {/* Filters — hidden on print */}
      <div className="no-print">
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Exam Group *</Label>
                <select className={SEL + " w-52"} value={examGroupId} onChange={e => { setExamGroupId(e.target.value); }}>
                  <option value="">Select Exam Group</option>
                  {examGroups.map(eg => <option key={eg.id} value={eg.id}>{eg.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Class *</Label>
                <select className={SEL + " w-40"} value={classId} onChange={e => { setClassId(e.target.value); setClassSectionId(""); }}>
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
              {studentMarksheets.length > 0 && (
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="h-4 w-4 mr-1" /> Print All ({studentMarksheets.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!classSectionId || !examGroupId ? (
        <div className="no-print text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select a published exam group, class and section</p>
          <p className="text-sm mt-1">Only published exam groups appear here</p>
        </div>
      ) : studentMarksheets.length === 0 ? (
        <div className="no-print text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
          <p className="font-medium">No mark entries found for this selection</p>
          <p className="text-sm mt-1">Make sure marks have been entered for this class in this exam group</p>
        </div>
      ) : (
        <div className="space-y-8">
          {studentMarksheets.map((ms, idx) => (
            <div
              key={ms.student.id}
              className="border-2 border-gray-700 print:break-after-page print:border print:border-gray-400"
            >
              {/* Header */}
              <div className="bg-blue-700 text-white p-4 text-center relative">
                {school?.logo && (
                  <img src={school.logo} alt="" className="absolute left-4 top-1/2 -translate-y-1/2 h-14 w-14 object-contain bg-white rounded p-1" />
                )}
                <h1 className="text-xl font-bold">{schoolName}</h1>
                {school?.address && <p className="text-sm text-blue-200">{school.address}</p>}
                <div className="mt-2 inline-block bg-white text-blue-700 font-bold px-4 py-1 rounded text-sm tracking-widest">
                  REPORT CARD / MARKSHEET
                </div>
                <p className="text-sm text-blue-200 mt-1">{selectedExam?.name} — {sessionLabel}</p>
              </div>

              {/* Student Info */}
              <div className="p-4 flex gap-4 border-b">
                <div className="w-20 h-24 bg-gray-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {ms.student.image
                    ? <img src={ms.student.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl text-gray-300 font-bold">{ms.student.firstName[0]}</span>
                  }
                </div>
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  <Field label="Student Name"   value={`${ms.student.firstName} ${ms.student.lastName}`} />
                  <Field label="Admission No"   value={ms.student.admissionNo} />
                  <Field label="Roll No"        value={ms.student.rollNo ?? "—"} />
                  <Field label="Class"          value={`${selectedClass?.name} — ${sectionName}`} />
                  <Field label="Father's Name"  value={ms.student.fatherName ?? "—"} />
                  <Field label="Mother's Name"  value={ms.student.motherName ?? "—"} />
                  <Field label="Date of Birth"  value={ms.student.dateOfBirth ? new Date(ms.student.dateOfBirth).toLocaleDateString() : "—"} />
                  <Field label="Gender"         value={ms.student.gender ?? "—"} />
                  <Field label="Issue Date"     value={printDate} />
                </div>
                <div className="text-center shrink-0">
                  <div className="text-2xl font-bold text-blue-700">#{(ms as any).rank}</div>
                  <div className="text-xs text-gray-400">Rank</div>
                </div>
              </div>

              {/* Marks Table */}
              <div className="p-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-slate-200 bg-white px-3 py-2 text-left">Subject</th>
                      <th className="border border-slate-200 bg-white px-3 py-2 text-center">Max Marks</th>
                      <th className="border border-slate-200 bg-white px-3 py-2 text-center">Pass Marks</th>
                      <th className="border border-slate-200 bg-white px-3 py-2 text-center">Marks Obtained</th>
                      <th className="border border-slate-200 bg-white px-3 py-2 text-center">Grade</th>
                      <th className="border border-slate-200 bg-white px-3 py-2 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ms.rows.map((row, i) => (
                      <tr key={i} className={row.isPassing ? "" : "bg-red-50"}>
                        <td className="border border-slate-200 bg-white px-3 py-2">{row.subjectName}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2 text-center">{row.fullMarks}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2 text-center">{row.passingMarks}</td>
                        <td className="border border-slate-200 bg-white px-3 py-2 text-center font-semibold">
                          {row.obtained !== null ? row.obtained : "ABS"}
                        </td>
                        <td className="border border-slate-200 bg-white px-3 py-2 text-center font-bold text-blue-700">
                          {row.grade ?? "—"}
                        </td>
                        <td className="border border-slate-200 bg-white px-3 py-2 text-center">
                          {row.isPassing
                            ? <span className="inline-flex items-center gap-1 text-green-700 font-medium"><CheckCircle2 className="h-3.5 w-3.5" />PASS</span>
                            : <span className="inline-flex items-center gap-1 text-red-600 font-medium"><XCircle className="h-3.5 w-3.5" />FAIL</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="border border-slate-200 bg-white px-3 py-2">TOTAL</td>
                      <td className="border border-slate-200 bg-white px-3 py-2 text-center">{ms.totalFull}</td>
                      <td className="border border-slate-200 bg-white px-3 py-2" />
                      <td className="border border-slate-200 bg-white px-3 py-2 text-center">{ms.totalObtained}</td>
                      <td className="border border-slate-200 bg-white px-3 py-2 text-center">{ms.pct}%</td>
                      <td className="border border-slate-200 bg-white px-3 py-2 text-center">
                        {ms.allPassed
                          ? <span className="text-green-700 font-bold">PASS</span>
                          : <span className="text-red-600 font-bold">FAIL</span>
                        }
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Grade key legend */}
              {gradeKey.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="border border-slate-200 rounded px-3 py-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
                    <span className="font-semibold text-gray-500">Grading Key:</span>
                    {gradeKey.map((g) => (
                      <span key={g.grade}><strong className="text-gray-800">{g.grade}</strong> {g.from}–{g.to}%</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary + Remark + Signatures */}
              <div className="px-4 pb-4 space-y-3">
                <div className="flex items-end justify-between">
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Percentage:</span> <strong>{ms.pct}%</strong></p>
                    <p><span className="text-gray-500">Division:</span> <strong className={ms.color}>{ms.div}</strong></p>
                    <p><span className="text-gray-500">Overall Result:</span> <strong className={ms.allPassed ? "text-green-700" : "text-red-600"}>{ms.allPassed ? "PASSED" : "FAILED"}</strong></p>
                  </div>
                  <div className="flex gap-12 text-center text-xs text-gray-500">
                    <div><div className="border-t border-gray-400 mt-8 pt-1 w-28">Class Teacher</div></div>
                    <div><div className="border-t border-gray-400 mt-8 pt-1 w-28">Principal</div></div>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 text-xs">Remarks:</span>
                  <div className="border-b border-dotted border-gray-300 h-5 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="font-medium text-gray-800 text-sm">{value}</p>
    </div>
  );
}
