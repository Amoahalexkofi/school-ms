"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Plus, Search, Trash2, X, Sparkles } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

const todayISO = () => new Date().toISOString().slice(0, 10);

function PointsChip({ points }: { points: number }) {
  return points < 0 ? (
    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full tabular-nums">{points} demerit</span>
  ) : (
    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full tabular-nums">+{points} merit</span>
  );
}

export function BehaviourClient({ types, recent, watchList }: { types: any[]; recent: any[]; watchList: any[] }) {
  const router = useRouter();
  const perm = usePermission("behaviour");

  // ── log an incident ──
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [student, setStudent] = useState<any | null>(null);
  const [typeId, setTypeId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2 || student) { setResults([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const res = await fetch(`/api/students?isActive=true&limit=8&search=${encodeURIComponent(term)}`, { signal: ctrl.signal }).catch(() => null);
      if (res?.ok) setResults(await res.json());
    }, 250);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [q, student]);

  async function logIncident() {
    if (!student || !typeId || !date) { setError("Pick a student, an incident type and a date"); return; }
    setSaving(true); setError(""); setSaved("");
    try {
      const res = await fetch("/api/behaviour/incidents", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, incidentTypeId: typeId, date, note }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setSaved(`Logged: ${d.incidentType?.title} for ${student.firstName} ${student.lastName}`);
      setStudent(null); setQ(""); setTypeId(""); setNote(""); setDate(todayISO());
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function removeIncident(id: string) {
    if (!confirm("Delete this behaviour record?")) return;
    await fetch(`/api/behaviour/incidents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  // ── types manager ──
  const [addingType, setAddingType] = useState(false);
  const [typeForm, setTypeForm] = useState({ title: "", points: "-2" });
  const [typeBusy, setTypeBusy] = useState(false);

  async function createType() {
    if (!typeForm.title.trim()) return;
    setTypeBusy(true);
    try {
      const res = await fetch("/api/behaviour/types", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typeForm),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setAddingType(false); setTypeForm({ title: "", points: "-2" });
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setTypeBusy(false); }
  }

  async function seedTypes() {
    setTypeBusy(true);
    try {
      const res = await fetch("/api/behaviour/types", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setTypeBusy(false); }
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5">
      <div className="grid grid-cols-12 gap-4 items-start">

        {/* ── Main column ── */}
        <div className="col-span-12 lg:col-span-8 space-y-4">

          {/* Log an incident */}
          {perm.canAdd && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-600" /> Log an incident
              </CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {types.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500 mb-3">No incident types yet — start with a Ghanaian-school starter set, then adjust.</p>
                    <Button size="sm" onClick={seedTypes} disabled={typeBusy}>
                      <Sparkles className="h-4 w-4 mr-1" /> {typeBusy ? "Seeding…" : "Add starter types"}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Student *</Label>
                        {student ? (
                          <div className="flex items-center justify-between h-10 rounded-lg border border-indigo-200 bg-indigo-50 px-3">
                            <span className="text-[14px] font-medium text-slate-900 truncate">
                              {student.firstName} {student.lastName}
                              <span className="text-xs text-slate-500 ml-2 font-mono">{student.admissionNo}</span>
                            </span>
                            <button onClick={() => { setStudent(null); setQ(""); }} aria-label="Clear student"
                              className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-9" placeholder="Search name or admission no…" value={q} onChange={e => setQ(e.target.value)} />
                            </div>
                            {results.length > 0 && (
                              <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                                {results.map((s: any) => (
                                  <button key={s.id} onClick={() => { setStudent(s); setResults([]); }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center justify-between">
                                    <span>{s.firstName} {s.lastName}</span>
                                    <span className="text-xs text-slate-400 font-mono">{s.admissionNo}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Incident *</Label>
                        <select className={SEL} value={typeId} onChange={e => setTypeId(e.target.value)}>
                          <option value="">— Select —</option>
                          {types.map((t: any) => (
                            <option key={t.id} value={t.id}>{t.title} ({t.points > 0 ? "+" : ""}{t.points})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Date *</Label>
                        <Input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Note</Label>
                        <Input placeholder="Optional context…" value={note} onChange={e => setNote(e.target.value)} />
                      </div>
                    </div>
                    {error && <p className="text-sm text-rose-600">{error}</p>}
                    {saved && <p className="text-sm text-emerald-700">{saved}</p>}
                    <Button onClick={logIncident} disabled={saving}>
                      <Plus className="h-4 w-4 mr-1" /> {saving ? "Logging…" : "Log incident"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent incidents */}
          <Card>
            <CardHeader><CardTitle className="text-base">Recent incidents</CardTitle></CardHeader>
            <CardContent>
              {recent.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">Nothing logged yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-[11px] text-slate-500 font-medium uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left py-2 pr-3">Date</th>
                      <th className="text-left py-2 pr-3">Student</th>
                      <th className="text-left py-2 pr-3">Class</th>
                      <th className="text-left py-2 pr-3">Incident</th>
                      <th className="text-left py-2 pr-3">Note</th>
                      <th className="py-2"></th>
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {recent.map((i: any) => {
                        const cs = i.student?.sessions?.[0]?.classSection;
                        return (
                          <tr key={i.id} className="hover:bg-slate-50">
                            <td className="py-2.5 pr-3 text-slate-500 tabular-nums whitespace-nowrap">{fmt(i.date)}</td>
                            <td className="py-2.5 pr-3">
                              <Link href={`/students/${i.student?.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                                {i.student?.firstName} {i.student?.lastName}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-3 text-slate-500">{cs ? `${cs.class.name} ${cs.section.name}` : "—"}</td>
                            <td className="py-2.5 pr-3"><span className="flex items-center gap-2">{i.incidentType?.title} <PointsChip points={i.incidentType?.points ?? 0} /></span></td>
                            <td className="py-2.5 pr-3 text-slate-500 max-w-[200px] truncate">{i.note || "—"}</td>
                            <td className="py-2.5 text-right">
                              {perm.canDelete && (
                                <button onClick={() => removeIncident(i.id)} aria-label="Delete record"
                                  className="text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Side column ── */}
        <div className="col-span-12 lg:col-span-4 space-y-4">

          {/* Conduct watch list */}
          {watchList.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Conduct watch list</CardTitle></CardHeader>
              <CardContent className="space-y-1">
                <p className="text-[12px] text-slate-500 mb-2">Lowest net conduct points this session.</p>
                {watchList.map((w: any) => (
                  <Link key={w.id} href={`/students/${w.id}`}
                    className="flex items-center justify-between py-2 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="text-[13.5px] font-medium text-slate-800">{w.firstName} {w.lastName}</span>
                    <span className={`text-[12.5px] font-semibold tabular-nums ${w.points < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {w.points > 0 ? "+" : ""}{w.points} pts
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Incident types */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Incident types</CardTitle>
              {perm.canAdd && types.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setAddingType(a => !a)}>
                  <Plus className="h-4 w-4 mr-1" /> Type
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {addingType && (
                <div className="mb-3 border border-indigo-200 rounded-lg bg-indigo-50 p-3 space-y-2">
                  <Input placeholder="Title, e.g. Lateness" value={typeForm.title}
                    onChange={e => setTypeForm(f => ({ ...f, title: e.target.value }))} />
                  <div className="flex gap-2">
                    <Input type="number" className="w-24" value={typeForm.points}
                      onChange={e => setTypeForm(f => ({ ...f, points: e.target.value }))} />
                    <Button size="sm" onClick={createType} disabled={typeBusy}>{typeBusy ? "Adding…" : "Add"}</Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingType(false)}>Cancel</Button>
                  </div>
                  <p className="text-[11px] text-slate-500">Negative points = demerit · positive = merit</p>
                </div>
              )}
              {types.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">None yet.</p>
              ) : (
                <div className="space-y-1">
                  {types.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between py-1.5">
                      <span className="text-[13px] text-slate-700">{t.title}
                        <span className="text-[11px] text-slate-400 ml-1.5">({t._count?.incidents ?? 0})</span>
                      </span>
                      <PointsChip points={t.points} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
