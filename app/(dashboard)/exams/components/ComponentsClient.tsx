"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

type Comp = { id?: string; name: string; weight: number | string; isExam: boolean };

export function ComponentsClient({ initial }: { initial: Comp[] }) {
  const router = useRouter();
  const [comps, setComps] = useState<Comp[]>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const total = comps.reduce((a, c) => a + (parseFloat(String(c.weight)) || 0), 0);
  const totalOk = Math.round(total * 100) / 100 === 100;

  function update(i: number, patch: Partial<Comp>) {
    setComps(cs => cs.map((c, j) => {
      if (j !== i) return c;
      // Only one component can be the end-of-term exam
      return { ...c, ...patch };
    }).map((c, j) => (patch.isExam && j !== i ? { ...c, isExam: false } : c)));
  }

  function add() {
    setComps(cs => [...cs, { name: "", weight: "", isExam: false }]);
  }

  function remove(i: number) {
    setComps(cs => cs.filter((_, j) => j !== i));
  }

  async function post(body: any) {
    setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/exams/components", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setComps((data.components ?? []).map((c: any) => ({
        id: c.id, name: c.name, weight: Number(c.weight), isExam: c.isExam,
      })));
      setMessage({ kind: "ok", text: body.disable ? "Continuous assessment turned off — marks entry is back to a single score." : "Saved. Marks entry now uses these columns." });
      router.refresh();
    } catch (e: any) {
      setMessage({ kind: "err", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  function save() {
    post({ components: comps.map((c, i) => ({ ...c, weight: parseFloat(String(c.weight)), sortOrder: i })) });
  }

  return (
    <main className="flex-1 p-5 md:p-7 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link href="/exams" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Exams
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-[16px] font-semibold text-slate-900">Assessment components</h2>
          <p className="text-[13px] text-slate-600 mt-1 max-w-[65ch]">
            Split each subject&rsquo;s mark into weighted parts — e.g. the Ghana GES structure of
            Class Work&nbsp;20 + Project&nbsp;15 + Quizzes&nbsp;15 (SBA&nbsp;50) and End-of-Term
            Exam&nbsp;50. Teachers enter each part out of its weight; the final mark and grade are
            computed automatically. Weights must add up to 100.
          </p>

          {comps.length === 0 ? (
            <div className="mt-6 border border-dashed border-slate-300 rounded-lg p-8 text-center">
              <p className="text-[14px] text-slate-600">Continuous assessment is off — marks are entered as a single score.</p>
              <div className="mt-4 flex justify-center gap-2">
                <Button onClick={() => post({ seed: "ges" })} disabled={saving}>
                  Use the Ghana GES structure (20 / 15 / 15 / 50)
                </Button>
                <Button variant="outline" onClick={add} disabled={saving}>
                  <Plus className="h-4 w-4 mr-1.5" /> Build my own
                </Button>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full mt-5 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 pr-3 font-medium text-slate-500">Component</th>
                    <th className="py-2 pr-3 font-medium text-slate-500 w-28">Weight (%)</th>
                    <th className="py-2 pr-3 font-medium text-slate-500 w-36">End-of-term exam?</th>
                    <th className="py-2 w-10"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comps.map((c, i) => (
                    <tr key={c.id ?? `new-${i}`}>
                      <td className="py-2 pr-3">
                        <Input
                          value={c.name}
                          placeholder="e.g. Class Work / Home Work"
                          aria-label="Component name"
                          onChange={e => update(i, { name: e.target.value })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <Input
                          type="number" min="1" max="100" step="0.5"
                          value={c.weight}
                          aria-label="Weight percent"
                          onChange={e => update(i, { weight: e.target.value })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <label className="inline-flex items-center gap-2 text-[13px] text-slate-700">
                          <input
                            type="radio" name="examComponent"
                            checked={c.isExam}
                            onChange={() => update(i, { isExam: true })}
                            className="h-4 w-4 accent-indigo-600"
                          />
                          {c.isExam ? "Exam" : "SBA"}
                        </label>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => remove(i)}
                          aria-label={`Remove ${c.name || "component"}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200">
                    <td className="py-3 pr-3 font-semibold text-slate-900">Total</td>
                    <td className={`py-3 pr-3 font-bold tabular-nums ${totalOk ? "text-emerald-700" : "text-rose-700"}`}>
                      {total}%
                    </td>
                    <td colSpan={2} className="py-3 text-[12px] text-slate-500">
                      {totalOk ? "Adds up — ready to save." : "Must add up to exactly 100."}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" onClick={add}>
                  <Plus className="h-4 w-4 mr-1.5" /> Add component
                </Button>
                <Button variant="outline" size="sm" onClick={() => post({ seed: "ges" })} disabled={saving}>
                  Reset to GES defaults
                </Button>
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => post({ disable: true })} disabled={saving}>
                  Turn off
                </Button>
                <Button onClick={save} disabled={saving || !totalOk}>
                  <Save className="h-4 w-4 mr-1.5" /> {saving ? "Saving…" : "Save components"}
                </Button>
              </div>
            </>
          )}

          {message && (
            <div
              role="status"
              className={`mt-4 flex items-center gap-2 text-[13px] rounded-lg px-3 py-2 border ${
                message.kind === "ok"
                  ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                  : "text-rose-700 bg-rose-50 border-rose-200"
              }`}
            >
              {message.kind === "ok" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              {message.text}
            </div>
          )}
        </div>

        <p className="text-[12px] text-slate-500 mt-3 max-w-[65ch]">
          Changing weights only affects marks entered afterwards; past terms keep the scores that
          were saved with them.
        </p>
      </div>
    </main>
  );
}
