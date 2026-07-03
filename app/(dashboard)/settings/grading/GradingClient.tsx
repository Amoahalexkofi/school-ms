"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, GraduationCap, Award, Pencil, Check, X } from "lucide-react";

type Range = { id: string; grade: string; gradePoint: number; markFrom: number; markTo: number };
type Div = { id: string; name: string; percentageFrom: number; percentageTo: number };

const IN = "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

export function GradingClient({ scaleName, ranges: initRanges, divisions: initDivs }: {
  scaleName: string; ranges: Range[]; divisions: Div[];
}) {
  const router = useRouter();
  const [ranges, setRanges] = useState(initRanges);
  const [divs, setDivs]     = useState(initDivs);
  const [gForm, setGForm]   = useState({ grade: "", gradePoint: "", markFrom: "", markTo: "" });
  const [dForm, setDForm]   = useState({ name: "", percentageFrom: "", percentageTo: "" });
  const [busy, setBusy]     = useState(false);

  async function addGrade() {
    if (!gForm.grade.trim() || gForm.markFrom === "" || gForm.markTo === "") { alert("Grade, From and To are required"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/grade-ranges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(gForm) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setRanges((r) => [...r, { id: d.id, grade: d.grade, gradePoint: Number(d.gradePoint), markFrom: Number(d.markFrom), markTo: Number(d.markTo) }]
        .sort((a, b) => b.markFrom - a.markFrom));
      setGForm({ grade: "", gradePoint: "", markFrom: "", markTo: "" });
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  }
  async function delGrade(id: string) {
    if (!confirm("Remove this grade?")) return;
    await fetch(`/api/grade-ranges/${id}`, { method: "DELETE" });
    setRanges((r) => r.filter((x) => x.id !== id)); router.refresh();
  }

  // Inline edit (Smart School Grade::edit / Marksdivision::edit)
  const [editGrade, setEditGrade] = useState<{ id: string; grade: string; gradePoint: string; markFrom: string; markTo: string } | null>(null);
  const [editDiv, setEditDiv]     = useState<{ id: string; name: string; percentageFrom: string; percentageTo: string } | null>(null);

  async function saveGrade() {
    if (!editGrade) return;
    if (!editGrade.grade.trim() || editGrade.markFrom === "" || editGrade.markTo === "") { alert("Grade, From and To are required"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/grade-ranges/${editGrade.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: editGrade.grade, gradePoint: editGrade.gradePoint, markFrom: editGrade.markFrom, markTo: editGrade.markTo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setRanges((r) => r.map((x) => x.id === editGrade.id
        ? { ...x, grade: d.grade, gradePoint: Number(d.gradePoint), markFrom: Number(d.markFrom), markTo: Number(d.markTo) }
        : x).sort((a, b) => b.markFrom - a.markFrom));
      setEditGrade(null);
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  }

  async function saveDiv() {
    if (!editDiv) return;
    if (!editDiv.name.trim() || editDiv.percentageFrom === "" || editDiv.percentageTo === "") { alert("Name, From and To are required"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/mark-divisions/${editDiv.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editDiv.name, percentageFrom: editDiv.percentageFrom, percentageTo: editDiv.percentageTo }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDivs((v) => v.map((x) => x.id === editDiv.id
        ? { ...x, name: d.name, percentageFrom: Number(d.percentageFrom), percentageTo: Number(d.percentageTo) }
        : x).sort((a, b) => b.percentageFrom - a.percentageFrom));
      setEditDiv(null);
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  }

  async function addDiv() {
    if (!dForm.name.trim() || dForm.percentageFrom === "" || dForm.percentageTo === "") { alert("Name, From and To are required"); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/mark-divisions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dForm) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setDivs((v) => [...v, { id: d.id, name: d.name, percentageFrom: Number(d.percentageFrom), percentageTo: Number(d.percentageTo) }]
        .sort((a, b) => b.percentageFrom - a.percentageFrom));
      setDForm({ name: "", percentageFrom: "", percentageTo: "" });
      router.refresh();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  }
  async function delDiv(id: string) {
    if (!confirm("Remove this division?")) return;
    await fetch(`/api/mark-divisions/${id}`, { method: "DELETE" });
    setDivs((v) => v.filter((x) => x.id !== id)); router.refresh();
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" /> Back to Settings
      </Link>

      {/* Grade scale */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-800">Grading Scale — {scaleName}</h2>
          </div>
          <p className="text-xs text-gray-500">Grades are assigned from a student&apos;s percentage in each subject when marks are saved.</p>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b">
              <tr><th className="text-left py-2">Grade</th><th className="text-left py-2">Grade Point</th><th className="text-left py-2">From %</th><th className="text-left py-2">To %</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ranges.map((r) => editGrade?.id === r.id ? (
                <tr key={r.id} className="bg-indigo-50/40">
                  <td className="py-2 pr-2"><Input className={IN} value={editGrade.grade} onChange={(e) => setEditGrade((f) => f && ({ ...f, grade: e.target.value }))} /></td>
                  <td className="py-2 pr-2"><Input className={IN} type="number" step="0.1" value={editGrade.gradePoint} onChange={(e) => setEditGrade((f) => f && ({ ...f, gradePoint: e.target.value }))} /></td>
                  <td className="py-2 pr-2"><Input className={IN} type="number" value={editGrade.markFrom} onChange={(e) => setEditGrade((f) => f && ({ ...f, markFrom: e.target.value }))} /></td>
                  <td className="py-2 pr-2"><Input className={IN} type="number" value={editGrade.markTo} onChange={(e) => setEditGrade((f) => f && ({ ...f, markTo: e.target.value }))} /></td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={saveGrade} disabled={busy} className="text-green-600 hover:text-green-700 mr-2" title="Save"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditGrade(null)} className="text-gray-400 hover:text-gray-600" title="Cancel"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={r.id}>
                  <td className="py-2 font-medium">{r.grade}</td>
                  <td className="py-2 text-gray-600">{r.gradePoint}</td>
                  <td className="py-2 text-gray-600">{r.markFrom}</td>
                  <td className="py-2 text-gray-600">{r.markTo}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={() => setEditGrade({ id: r.id, grade: r.grade, gradePoint: String(r.gradePoint), markFrom: String(r.markFrom), markTo: String(r.markTo) })}
                      className="text-gray-400 hover:text-indigo-600 mr-2" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => delGrade(r.id)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
              {ranges.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-400 text-xs">No grades yet.</td></tr>}
              <tr className="bg-slate-50/50">
                <td className="py-2 pr-2"><Input className={IN} placeholder="A1" value={gForm.grade} onChange={(e) => setGForm((f) => ({ ...f, grade: e.target.value }))} /></td>
                <td className="py-2 pr-2"><Input className={IN} type="number" step="0.1" placeholder="1.0" value={gForm.gradePoint} onChange={(e) => setGForm((f) => ({ ...f, gradePoint: e.target.value }))} /></td>
                <td className="py-2 pr-2"><Input className={IN} type="number" placeholder="80" value={gForm.markFrom} onChange={(e) => setGForm((f) => ({ ...f, markFrom: e.target.value }))} /></td>
                <td className="py-2 pr-2"><Input className={IN} type="number" placeholder="100" value={gForm.markTo} onChange={(e) => setGForm((f) => ({ ...f, markTo: e.target.value }))} /></td>
                <td className="py-2 text-right"><Button size="sm" disabled={busy} onClick={addGrade}><Plus className="h-3.5 w-3.5" /></Button></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mark divisions */}
      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold text-gray-800">Mark Divisions</h2>
          </div>
          <p className="text-xs text-gray-500">Overall divisions shown on results and marksheets, based on a student&apos;s total percentage.</p>
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b">
              <tr><th className="text-left py-2">Division</th><th className="text-left py-2">From %</th><th className="text-left py-2">To %</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {divs.map((d) => editDiv?.id === d.id ? (
                <tr key={d.id} className="bg-indigo-50/40">
                  <td className="py-2 pr-2"><Input className={IN} value={editDiv.name} onChange={(e) => setEditDiv((f) => f && ({ ...f, name: e.target.value }))} /></td>
                  <td className="py-2 pr-2"><Input className={IN} type="number" value={editDiv.percentageFrom} onChange={(e) => setEditDiv((f) => f && ({ ...f, percentageFrom: e.target.value }))} /></td>
                  <td className="py-2 pr-2"><Input className={IN} type="number" value={editDiv.percentageTo} onChange={(e) => setEditDiv((f) => f && ({ ...f, percentageTo: e.target.value }))} /></td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={saveDiv} disabled={busy} className="text-green-600 hover:text-green-700 mr-2" title="Save"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditDiv(null)} className="text-gray-400 hover:text-gray-600" title="Cancel"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={d.id}>
                  <td className="py-2 font-medium">{d.name}</td>
                  <td className="py-2 text-gray-600">{d.percentageFrom}</td>
                  <td className="py-2 text-gray-600">{d.percentageTo}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <button onClick={() => setEditDiv({ id: d.id, name: d.name, percentageFrom: String(d.percentageFrom), percentageTo: String(d.percentageTo) })}
                      className="text-gray-400 hover:text-indigo-600 mr-2" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => delDiv(d.id)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </td>
                </tr>
              ))}
              {divs.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-400 text-xs">No divisions yet.</td></tr>}
              <tr className="bg-slate-50/50">
                <td className="py-2 pr-2"><Input className={IN} placeholder="First Class" value={dForm.name} onChange={(e) => setDForm((f) => ({ ...f, name: e.target.value }))} /></td>
                <td className="py-2 pr-2"><Input className={IN} type="number" placeholder="60" value={dForm.percentageFrom} onChange={(e) => setDForm((f) => ({ ...f, percentageFrom: e.target.value }))} /></td>
                <td className="py-2 pr-2"><Input className={IN} type="number" placeholder="79.99" value={dForm.percentageTo} onChange={(e) => setDForm((f) => ({ ...f, percentageTo: e.target.value }))} /></td>
                <td className="py-2 text-right"><Button size="sm" disabled={busy} onClick={addDiv}><Plus className="h-3.5 w-3.5" /></Button></td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
