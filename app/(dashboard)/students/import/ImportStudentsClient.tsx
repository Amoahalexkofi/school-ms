"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

const COLUMNS = [
  "admission_no", "first_name", "middle_name", "last_name", "gender", "date_of_birth",
  "roll_no", "mobile", "guardian_name", "guardian_phone", "guardian_email", "father_name", "mother_name",
];

// Minimal CSV parse with basic quoted-field support.
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim().length);
  if (!lines.length) return [];
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
    return out.map((s) => s.trim());
  };
  const headers = split(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((line) => {
    const vals = split(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = vals[i] ?? ""));
    return row;
  });
}

export function ImportStudentsClient({ sessions, classSections }: { sessions: any[]; classSections: any[] }) {
  const [sessionId, setSessionId] = useState(sessions[0]?.id ?? "");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const classes = Array.from(new Map(classSections.map((cs: any) => [cs.class.id, cs.class])).values()) as any[];
  const sections = classSections.filter((cs: any) => cs.class.id === classId).map((cs: any) => cs.section);
  const classSectionId = classSections.find((cs: any) => cs.class.id === classId && cs.section.id === sectionId)?.id ?? "";

  function downloadSample() {
    const csv = COLUMNS.join(",") + "\n" +
      "ADM/2026/001,Kofi,,Mensah,Male,2015-04-12,1,0244000000,Ama Mensah,0244000001,ama.mensah@example.com,Yaw Mensah,Ama Mensah\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "students-import-sample.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name); setError(""); setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = parseCSV(String(reader.result));
        if (!parsed.length) { setError("No data rows found in the file."); setRows([]); return; }
        setRows(parsed);
      } catch { setError("Could not parse the CSV file."); setRows([]); }
    };
    reader.readAsText(file);
  }

  async function runImport() {
    if (!rows.length) { setError("Upload a CSV first"); return; }
    if (!sessionId || !classSectionId) { setError("Select a session, class and section"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/students/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, classSectionId, rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </Link>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Import Students from CSV</h2>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download Sample
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Columns: {COLUMNS.join(", ")}. <code>first_name</code>, <code>last_name</code> and <code>gender</code> are
            required; admission numbers are auto-generated if blank. If <code>guardian_email</code> is present a
            parent portal login is created (or the student is linked to the existing parent account).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Session *</label>
              <select className={SEL} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Class *</label>
              <select className={SEL} value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}>
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Section *</label>
              <select className={SEL} value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}>
                <option value="">Select section</option>
                {sections.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">CSV File *</label>
            <input type="file" accept=".csv,text/csv" onChange={onFile}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-600 file:text-sm file:font-medium hover:file:bg-indigo-100" />
            {fileName && rows.length > 0 && (
              <p className="text-xs text-green-600 mt-1">{fileName} — {rows.length} row{rows.length !== 1 ? "s" : ""} ready</p>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={runImport} disabled={loading || !rows.length}>
            <Upload className="h-4 w-4 mr-1" /> {loading ? "Importing…" : `Import ${rows.length || ""} Students`}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {result.created} created{result.failed > 0 ? `, ${result.failed} failed` : ""}.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>{["Row", "Name", "Adm No.", "Temp Password", "Parent Login", "Status"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y">
                  {result.results.map((r: any) => (
                    <tr key={r.row}>
                      <td className="px-3 py-1.5 text-gray-500">{r.row}</td>
                      <td className="px-3 py-1.5">{r.name ?? "—"}</td>
                      <td className="px-3 py-1.5 font-mono text-gray-500">{r.admissionNo ?? "—"}</td>
                      <td className="px-3 py-1.5 font-mono">{r.tempPassword ?? "—"}</td>
                      <td className="px-3 py-1.5">
                        {!r.parent ? "—"
                          : r.parent.conflict ? <span className="text-amber-600" title="Email belongs to a non-parent account">email in use</span>
                          : r.parent.existing ? <span className="text-gray-500">linked existing</span>
                          : <span className="font-mono">{r.parent.tempPassword}</span>}
                      </td>
                      <td className="px-3 py-1.5">
                        {r.ok ? <span className="text-green-600">OK</span> : <span className="text-red-600" title={r.error}>{r.error}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400">Copy the temp passwords now — they are shown only once.</p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
