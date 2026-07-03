"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, CheckCheck, AlertCircle, Download, Upload } from "lucide-react";

// Minimal CSV parse with basic quoted-field support (same as students import).
function parseCSV(text: string): string[][] {
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
      else if (c === "," && !inQ) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  return lines.map(split);
}

type Row = {
  studentId: string;
  marksObtained: string;
  attendance: "P" | "A";
  note: string;
  components: Record<string, string>; // componentId → score (out of its weight)
};

type Component = { id: string; name: string; weight: number; isExam: boolean };

type Props = {
  schedule: any;
  examGroupId: string;
  enrollments: any[];
  marksMap: Record<string, any>;
  gradingScale: any;
  components?: Component[];
  componentMarksMap?: Record<string, Record<string, string>>;
};

function computeGrade(marks: number | null, fullMarks: number, ranges: any[]): string | null {
  if (marks === null || !ranges) return null;
  const pct = (marks / fullMarks) * 100;
  for (const r of ranges) {
    if (pct >= Number(r.markFrom) && pct <= Number(r.markTo)) return r.grade;
  }
  return null;
}

export function MarkEntryClient({ schedule, examGroupId, enrollments, marksMap, gradingScale, components = [], componentMarksMap = {} }: Props) {
  const router = useRouter();

  // GES SBA mode: one score column per component (out of its weight); the
  // final mark is their sum. No components configured → single-mark mode.
  const sbaMode = components.length > 0;
  const sbaComponents = components.filter(c => !c.isExam);
  const examComponent = components.find(c => c.isExam) ?? null;
  const sbaMax = sbaComponents.reduce((a, c) => a + c.weight, 0);
  const totalMax = components.reduce((a, c) => a + c.weight, 0);

  const initRows = (): Record<string, Row> => {
    const m: Record<string, Row> = {};
    for (const enr of enrollments) {
      const existing = marksMap[enr.student.id];
      m[enr.student.id] = {
        studentId:     enr.student.id,
        marksObtained: existing ? (existing.marksObtained !== null ? String(Number(existing.marksObtained)) : "") : "",
        attendance:    existing ? existing.attendance : "P",
        note:          existing?.note ?? "",
        components:    { ...(componentMarksMap[enr.student.id] ?? {}) },
      };
    }
    return m;
  };

  const [rows,     setRows]     = useState<Record<string, Row>>(initRows);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState("");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // CSV import (Smart School marks_import): the file only FILLS the grid,
  // matched by admission number — nothing is saved until "Save Marks".
  // Columns: adm_no, status (1 present / 0 absent), then marks (single-mark
  // mode) or one column per component (SBA mode), then optional note.
  const csvColumns = ["adm_no", "status",
    ...(sbaMode ? components.map(c => c.name.toLowerCase().replace(/\s+/g, "_")) : ["marks"]),
    "note"];

  function downloadSample() {
    const example = sbaMode
      ? ["1001", "1", ...components.map(c => String(Math.round(c.weight * 0.75))), "Good"]
      : ["1001", "1", "75", "Good"];
    const absent = ["1002", "0", ...(sbaMode ? components.map(() => "0") : ["0"]), "Absent"];
    const csv = csvColumns.join(",") + "\n" + example.join(",") + "\n" + absent.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "marks-import-sample.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(String(reader.result));
        if (parsed.length < 2) { setImportMsg("No data rows found in the file."); return; }
        const dataRows = parsed.slice(1); // skip header (positional mapping, like Smart School)

        const byAdm = new Map<string, string>();
        for (const enr of enrollments) byAdm.set(String(enr.student.admissionNo).trim(), enr.student.id);

        let applied = 0;
        const unmatched: string[] = [];
        setRows(prev => {
          const next = { ...prev };
          for (const cols of dataRows) {
            const adm = (cols[0] ?? "").trim();
            if (!adm) continue;
            const studentId = byAdm.get(adm);
            if (!studentId) { unmatched.push(adm); continue; }
            const present = (cols[1] ?? "1").trim() !== "0";
            const noteIdx = 2 + (sbaMode ? components.length : 1);
            const note = (cols[noteIdx] ?? "").trim();
            const row: Row = { ...next[studentId], attendance: present ? "P" : "A", note: note || next[studentId].note };
            if (!present) {
              row.marksObtained = "";
              row.components = sbaMode ? Object.fromEntries(components.map(c => [c.id, ""])) : row.components;
            } else if (sbaMode) {
              const comps = { ...row.components };
              components.forEach((c, i) => {
                const v = (cols[2 + i] ?? "").trim();
                if (v !== "" && !isNaN(parseFloat(v))) comps[c.id] = String(Math.min(parseFloat(v), c.weight));
              });
              row.components = comps;
            } else {
              const v = (cols[2] ?? "").trim();
              if (v !== "" && !isNaN(parseFloat(v))) row.marksObtained = v;
            }
            next[studentId] = row;
            applied++;
          }
          return next;
        });
        setImportMsg(
          `${applied} row${applied !== 1 ? "s" : ""} filled into the grid` +
          (unmatched.length ? `; ${unmatched.length} admission no${unmatched.length !== 1 ? "s" : ""} not in this class (${unmatched.slice(0, 5).join(", ")}${unmatched.length > 5 ? "…" : ""})` : "") +
          ". Review and press Save Marks."
        );
      } catch { setImportMsg("Could not parse the CSV file."); }
      finally { if (fileRef.current) fileRef.current.value = ""; }
    };
    reader.readAsText(file);
  }

  const ranges = gradingScale?.ranges ?? [];
  const csLabel = schedule.classSection
    ? `${schedule.classSection.class.name} – ${schedule.classSection.section.name}`
    : "—";

  function setRow(studentId: string, field: keyof Row, value: string) {
    setRows(r => ({ ...r, [studentId]: { ...r[studentId], [field]: value } }));
  }

  function setComponent(studentId: string, componentId: string, value: string) {
    setRows(r => ({
      ...r,
      [studentId]: { ...r[studentId], components: { ...r[studentId].components, [componentId]: value } },
    }));
  }

  // Sum of entered component scores (null until at least one is entered)
  function componentTotal(row: Row | undefined, ids: string[]): number | null {
    if (!row) return null;
    let sum = 0, any = false;
    for (const id of ids) {
      const v = parseFloat(row.components[id] ?? "");
      if (!isNaN(v)) { sum += v; any = true; }
    }
    return any ? sum : null;
  }

  function markAllPresent() {
    setRows(r => {
      const next = { ...r };
      for (const id in next) next[id] = { ...next[id], attendance: "P" };
      return next;
    });
  }

  function markAllAbsent() {
    setRows(r => {
      const next = { ...r };
      for (const id in next) next[id] = { ...next[id], attendance: "A", marksObtained: "" };
      return next;
    });
  }

  const allComponentIds = components.map(c => c.id);
  const rowFinal = (r: Row): number | null =>
    sbaMode ? componentTotal(r, allComponentIds)
            : (r.marksObtained !== "" && !isNaN(parseFloat(r.marksObtained)) ? parseFloat(r.marksObtained) : null);

  const counts = {
    present: Object.values(rows).filter(r => r.attendance === "P").length,
    absent:  Object.values(rows).filter(r => r.attendance === "A").length,
    passed:  Object.values(rows).filter(r => {
      const m = rowFinal(r);
      return r.attendance === "P" && m !== null && m >= schedule.passingMarks;
    }).length,
  };

  async function handleSave() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const records = Object.values(rows).map(r => ({
        studentId:     r.studentId,
        marksObtained: r.attendance === "A" ? null : (r.marksObtained !== "" ? r.marksObtained : null),
        attendance:    r.attendance,
        note:          r.note || null,
        ...(sbaMode ? { components: r.components } : {}),
      }));
      const res  = await fetch(`/api/exams/schedules/${schedule.id}/marks`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href={`/exams/${examGroupId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Schedules
        </Link>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onImportFile} />
          <Button variant="outline" size="sm" onClick={downloadSample}>
            <Download className="h-3.5 w-3.5 mr-1" /> Sample CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Import CSV
          </Button>
          <Button variant="outline" size="sm" onClick={markAllPresent}>Mark All Present</Button>
          <Button variant="outline" size="sm" onClick={markAllAbsent}>Mark All Absent</Button>
          <Button disabled={saving} onClick={handleSave} className="min-w-[120px]">
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? "Saving…" : saved ? "Saved ✓" : "Save Marks"}
          </Button>
        </div>
      </div>

      {/* Info bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-6 text-sm">
        <div><p className="text-xs text-gray-400">Exam Group</p><p className="font-medium">{schedule.examGroup.name}</p></div>
        <div><p className="text-xs text-gray-400">Subject</p><p className="font-medium">{schedule.subject.name} <span className="text-gray-400 font-mono text-xs">({schedule.subject.code})</span></p></div>
        <div><p className="text-xs text-gray-400">Class</p><p className="font-medium">{csLabel}</p></div>
        <div><p className="text-xs text-gray-400">Session</p><p className="font-medium">{schedule.session.session}</p></div>
        <div><p className="text-xs text-gray-400">Full / Pass</p><p className="font-medium">{sbaMode ? totalMax : schedule.fullMarks} / {schedule.passingMarks}</p></div>
        {sbaMode && (
          <div><p className="text-xs text-gray-400">Assessment</p><p className="font-medium text-indigo-700">SBA {sbaMax}% + Exam {examComponent?.weight ?? 0}%</p></div>
        )}
        <div><p className="text-xs text-gray-400">Date</p><p className="font-medium">{schedule.dateOfExam ? new Date(schedule.dateOfExam).toLocaleDateString() : "—"}</p></div>
      </div>

      {/* Summary counters */}
      <div className="flex gap-4 text-sm">
        {[
          { label: "Total",   value: enrollments.length, cls: "bg-gray-100 text-gray-700" },
          { label: "Present", value: counts.present,     cls: "bg-green-100 text-green-700" },
          { label: "Absent",  value: counts.absent,      cls: "bg-red-100 text-red-700" },
          { label: "Passed",  value: counts.passed,      cls: "bg-blue-100 text-blue-700" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`px-4 py-2 rounded-lg font-medium ${cls}`}>
            <span className="text-lg font-bold mr-1">{value}</span>{label}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {importMsg && (
        <div className="flex items-center gap-2 text-sm text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
          <CheckCheck className="h-4 w-4 shrink-0" /> {importMsg}
        </div>
      )}

      {/* Mark entry table */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
          <p className="text-sm">No students enrolled in this class for the selected session.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm tabular-nums">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Adm No.</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Attendance</th>
                {sbaMode ? (
                  <>
                    {sbaComponents.map(c => (
                      <th key={c.id} className="text-center px-2 py-3 font-medium text-gray-600">
                        <span className="block leading-tight">{c.name}</span>
                        <span className="text-[10px] font-normal text-gray-400">/ {c.weight}</span>
                      </th>
                    ))}
                    <th className="text-center px-2 py-3 font-medium text-gray-600 bg-indigo-50/60">
                      <span className="block leading-tight">SBA</span>
                      <span className="text-[10px] font-normal text-gray-400">/ {sbaMax}</span>
                    </th>
                    {examComponent && (
                      <th className="text-center px-2 py-3 font-medium text-gray-600">
                        <span className="block leading-tight">{examComponent.name}</span>
                        <span className="text-[10px] font-normal text-gray-400">/ {examComponent.weight}</span>
                      </th>
                    )}
                    <th className="text-center px-2 py-3 font-medium text-gray-600 bg-indigo-50/60">
                      <span className="block leading-tight">Final</span>
                      <span className="text-[10px] font-normal text-gray-400">/ {totalMax}</span>
                    </th>
                  </>
                ) : (
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Marks / {schedule.fullMarks}</th>
                )}
                <th className="text-center px-4 py-3 font-medium text-gray-600">Grade</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {enrollments.map((enr, idx) => {
                const s        = enr.student;
                const row      = rows[s.id];
                const absent   = row?.attendance === "A";
                const sbaTotal  = sbaMode && !absent ? componentTotal(row, sbaComponents.map(c => c.id)) : null;
                const marks    = absent
                  ? null
                  : sbaMode
                    ? componentTotal(row, allComponentIds)
                    : (row?.marksObtained !== "" ? parseFloat(row?.marksObtained) : null);
                const grade    = computeGrade(marks, sbaMode ? totalMax : schedule.fullMarks, ranges);
                const isPassing = marks !== null && marks >= schedule.passingMarks;

                return (
                  <tr key={s.id} className={`hover:bg-gray-50/50 ${absent ? "bg-red-50/30" : ""}`}>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-gray-900">{s.firstName} {s.middleName ? s.middleName + " " : ""}{s.lastName}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{s.admissionNo}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1.5">
                        {(["P", "A"] as const).map(att => (
                          <button key={att} onClick={() => setRow(s.id, "attendance", att)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                              row?.attendance === att
                                ? att === "P"
                                  ? "bg-green-100 text-green-700 border-green-300 ring-2 ring-green-300 ring-offset-1"
                                  : "bg-red-100 text-red-700 border-red-300 ring-2 ring-red-300 ring-offset-1"
                                : "bg-white text-gray-300 border-gray-200 hover:border-gray-400"
                            }`}>{att}</button>
                        ))}
                      </div>
                    </td>
                    {sbaMode ? (
                      <>
                        {sbaComponents.map(c => (
                          <td key={c.id} className="px-2 py-2.5 text-center">
                            {absent ? (
                              <span className="text-xs text-gray-400 italic">—</span>
                            ) : (
                              <Input
                                type="number" min="0" max={c.weight} step="0.5"
                                aria-label={`${c.name} score for ${s.firstName} ${s.lastName}, out of ${c.weight}`}
                                className="w-16 mx-auto text-center h-8"
                                value={row?.components[c.id] ?? ""}
                                onChange={e => setComponent(s.id, c.id, e.target.value)}
                              />
                            )}
                          </td>
                        ))}
                        <td className="px-2 py-2.5 text-center font-semibold text-gray-900 bg-indigo-50/40">
                          {sbaTotal !== null ? sbaTotal : "—"}
                        </td>
                        {examComponent && (
                          <td className="px-2 py-2.5 text-center">
                            {absent ? (
                              <span className="text-xs text-gray-400 italic">—</span>
                            ) : (
                              <Input
                                type="number" min="0" max={examComponent.weight} step="0.5"
                                aria-label={`${examComponent.name} score for ${s.firstName} ${s.lastName}, out of ${examComponent.weight}`}
                                className="w-16 mx-auto text-center h-8"
                                value={row?.components[examComponent.id] ?? ""}
                                onChange={e => setComponent(s.id, examComponent.id, e.target.value)}
                              />
                            )}
                          </td>
                        )}
                        <td className="px-2 py-2.5 text-center font-bold text-gray-900 bg-indigo-50/40">
                          {absent ? "—" : marks !== null ? marks : "—"}
                        </td>
                      </>
                    ) : (
                      <td className="px-4 py-2.5 text-center">
                        {absent ? (
                          <span className="text-xs text-gray-400 italic">Absent</span>
                        ) : (
                          <Input
                            type="number" min="0" max={schedule.fullMarks} step="0.5"
                            className="w-20 mx-auto text-center h-8"
                            value={row?.marksObtained ?? ""}
                            onChange={e => setRow(s.id, "marksObtained", e.target.value)}
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-center font-bold text-indigo-700">
                      {absent ? "—" : (grade ?? (marks !== null ? "—" : ""))}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {absent ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Absent</span>
                      ) : marks !== null ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isPassing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {isPassing ? "Pass" : "Fail"}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5">
                      <input type="text" placeholder="optional"
                        value={row?.note ?? ""}
                        onChange={e => setRow(s.id, "note", e.target.value)}
                        className="w-28 h-7 rounded border border-gray-200 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="border-t bg-gray-50 px-4 py-3 flex justify-between items-center">
            <span className="text-xs text-gray-400">{enrollments.length} students</span>
            <Button disabled={saving} onClick={handleSave}>
              <Save className="h-4 w-4 mr-1.5" />
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save Marks"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
