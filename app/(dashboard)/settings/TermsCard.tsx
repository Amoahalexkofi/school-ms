"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarRange, Plus, X, Trash2 } from "lucide-react";

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export function TermsCard({ sessions }: { sessions: any[] }) {
  const activeSession = sessions.find((s: any) => s.isActive) ?? sessions[0] ?? null;
  const [sessionId, setSessionId] = useState<string>(activeSession?.id ?? "");
  const [terms, setTerms] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ termNumber: "1", name: "Term 1", startDate: "", endDate: "", setCurrent: true });

  async function load(sid: string) {
    if (!sid) { setTerms([]); return; }
    const res = await fetch(`/api/terms?sessionId=${sid}`);
    if (res.ok) setTerms(await res.json());
  }
  useEffect(() => { load(sessionId); }, [sessionId]);

  async function create() {
    if (!form.name || !form.startDate || !form.endDate) { setError("Name, start and end dates are required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/terms", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, ...form, termNumber: Number(form.termNumber) }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setAdding(false);
      setForm({ termNumber: String(terms.length + 2), name: `Term ${terms.length + 2}`, startDate: "", endDate: "", setCurrent: false });
      load(sessionId);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function setCurrent(id: string) {
    await fetch(`/api/terms/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ setCurrent: true }) });
    load(sessionId);
  }
  async function remove(id: string) {
    if (!confirm("Delete this term?")) return;
    await fetch(`/api/terms/${id}`, { method: "DELETE" });
    load(sessionId);
  }

  function openAdd() {
    const next = terms.length + 1;
    setForm({ termNumber: String(next), name: `Term ${next}`, startDate: "", endDate: "", setCurrent: terms.length === 0 });
    setError(""); setAdding(true);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-indigo-600" /> Terms
        </CardTitle>
        <div className="flex items-center gap-2">
          {sessions.length > 1 && (
            <select value={sessionId} onChange={e => setSessionId(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <Button size="sm" onClick={openAdd} disabled={!sessionId || terms.length >= 3}>
            <Plus className="h-4 w-4 mr-1" /> Term
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {adding && (
          <div className="mb-4 border border-indigo-200 rounded-lg bg-indigo-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-indigo-800">Add Term</h3>
              <button type="button" onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Term No. *</Label>
                  <select value={form.termNumber} onChange={e => setForm(f => ({ ...f, termNumber: e.target.value, name: `Term ${e.target.value}` }))}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900">
                    <option value="1">1</option><option value="2">2</option><option value="3">3</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Term 1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Start Date *</Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">End Date (vacation) *</Label>
                  <Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.setCurrent} onChange={e => setForm(f => ({ ...f, setCurrent: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-200" />
                Set as current term
              </label>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                <Button size="sm" disabled={loading} onClick={create}>{loading ? "Adding…" : "Add Term"}</Button>
              </div>
            </div>
          </div>
        )}

        {!sessionId ? (
          <p className="text-sm text-gray-500 text-center py-6">Create an academic session first.</p>
        ) : terms.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No terms yet. Add up to three terms to unlock term-by-term context and reports.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Term</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Starts</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Vacation</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
              <th className="px-3 py-2"></th>
            </tr></thead>
            <tbody className="divide-y">
              {terms.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{t.name}</td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums">{fmt(t.startDate)}</td>
                  <td className="px-3 py-2.5 text-gray-500 tabular-nums">{fmt(t.endDate)}</td>
                  <td className="px-3 py-2.5">
                    {t.isCurrent
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">Current</span>
                      : <button onClick={() => setCurrent(t.id)} className="text-xs text-indigo-600 hover:underline">Set current</button>}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button onClick={() => remove(t.id)} aria-label="Delete term" className="text-gray-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
