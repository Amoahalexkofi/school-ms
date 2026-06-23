"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Upload, CheckCircle2, AlertCircle } from "lucide-react";

const COLUMNS = ["title", "author", "isbn", "book_no", "subject", "publisher", "rack_no", "quantity", "cost"];

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

export function ImportBooksClient() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  function downloadSample() {
    const csv = COLUMNS.join(",") + "\n" +
      "The Very Hungry Caterpillar,Eric Carle,978-0241003008,BK001,General,Penguin,R1,5,25\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "books-import-sample.csv"; a.click();
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
        if (!parsed.length) { setError("No data rows found."); setRows([]); return; }
        setRows(parsed);
      } catch { setError("Could not parse the CSV file."); setRows([]); }
    };
    reader.readAsText(file);
  }

  async function runImport() {
    if (!rows.length) { setError("Upload a CSV first"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/library/books/import", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto space-y-5">
      <Link href="/library" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </Link>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Import Books from CSV</h2>
            <Button variant="outline" size="sm" onClick={downloadSample}>
              <Download className="h-3.5 w-3.5 mr-1" /> Download Sample
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Columns: {COLUMNS.join(", ")}. <code>title</code> and <code>author</code> are required; duplicate book numbers / ISBNs are skipped.
          </p>

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
            <Upload className="h-4 w-4 mr-1" /> {loading ? "Importing…" : `Import ${rows.length || ""} Books`}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4" /> {result.created} added{result.failed > 0 ? `, ${result.failed} skipped` : ""}.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>{["Row", "Title", "Status"].map((h) => <th key={h} className="text-left px-3 py-2 font-medium text-gray-600">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {result.results.map((r: any) => (
                    <tr key={r.row}>
                      <td className="px-3 py-1.5 text-gray-500">{r.row}</td>
                      <td className="px-3 py-1.5">{r.title ?? "—"}</td>
                      <td className="px-3 py-1.5">{r.ok ? <span className="text-green-600">Added</span> : <span className="text-red-600">{r.error}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
