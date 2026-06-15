"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2, CalendarDays, Tag, X, Check } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

type HolidayType = { id: string; name: string; isDefault: boolean; _count?: { holidays: number } };
type Holiday = {
  id: string; holidayTypeId: string; holidayType: HolidayType;
  session?: { id: string; session: string };
  sessionId?: string; fromDate: string; toDate: string;
  description?: string; frontSite: boolean;
};

function dayCount(from: string, to: string) {
  const d = Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;
  return `${d} day${d !== 1 ? "s" : ""}`;
}

export function HolidaysClient({
  holidays: initial,
  holidayTypes: initialTypes,
  sessions,
}: {
  holidays: Holiday[];
  holidayTypes: HolidayType[];
  sessions: { id: string; session: string }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"holidays" | "types">("holidays");

  // ── Holidays state ──
  const [holidays, setHolidays] = useState<Holiday[]>(initial);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [hForm, setHForm] = useState({ holidayTypeId: "", sessionId: "", fromDate: "", toDate: "", description: "", frontSite: false });
  const [saving, setSaving] = useState(false);

  // ── Holiday Types state ──
  const [types, setTypes] = useState<HolidayType[]>(initialTypes);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<HolidayType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDefault, setTypeDefault] = useState(false);

  // ── Filtered holidays ──
  const [filterType, setFilterType] = useState("");
  const [filterSession, setFilterSession] = useState("");

  const filtered = holidays.filter((h) => {
    if (filterType && h.holidayTypeId !== filterType) return false;
    if (filterSession && h.sessionId !== filterSession) return false;
    return true;
  });

  function openAddHoliday() {
    setEditingHoliday(null);
    setHForm({ holidayTypeId: types[0]?.id ?? "", sessionId: sessions[0]?.id ?? "", fromDate: "", toDate: "", description: "", frontSite: false });
    setShowHolidayForm(true);
  }

  function openEditHoliday(h: Holiday) {
    setEditingHoliday(h);
    setHForm({
      holidayTypeId: h.holidayTypeId, sessionId: h.sessionId ?? "",
      fromDate: h.fromDate.slice(0, 10), toDate: h.toDate.slice(0, 10),
      description: h.description ?? "", frontSite: h.frontSite,
    });
    setShowHolidayForm(true);
  }

  async function saveHoliday() {
    if (!hForm.holidayTypeId || !hForm.fromDate || !hForm.toDate) return alert("Holiday type, from date, and to date are required");
    if (hForm.toDate < hForm.fromDate) return alert("To date must be on or after from date");
    setSaving(true);
    try {
      const payload = {
        ...hForm,
        sessionId: hForm.sessionId || null,
        fromDate: new Date(hForm.fromDate).toISOString(),
        toDate: new Date(hForm.toDate).toISOString(),
      };
      if (editingHoliday) {
        const res = await fetch(`/api/holidays/${editingHoliday.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch("/api/holidays", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
      }
      setShowHolidayForm(false);
      router.refresh();
    } catch { alert("Failed to save holiday"); }
    finally { setSaving(false); }
  }

  async function deleteHoliday(id: string) {
    if (!confirm("Delete this holiday?")) return;
    await fetch(`/api/holidays/${id}`, { method: "DELETE" });
    setHolidays((hs) => hs.filter((h) => h.id !== id));
  }

  function openAddType() {
    setEditingType(null); setTypeName(""); setTypeDefault(false); setShowTypeForm(true);
  }
  function openEditType(t: HolidayType) {
    setEditingType(t); setTypeName(t.name); setTypeDefault(t.isDefault); setShowTypeForm(true);
  }

  async function saveType() {
    if (!typeName.trim()) return alert("Name required");
    setSaving(true);
    try {
      const payload = { name: typeName.trim(), isDefault: typeDefault };
      if (editingType) {
        const res = await fetch(`/api/holiday-types/${editingType.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error();
        setTypes((ts) => ts.map((t) => (t.id === editingType.id ? { ...t, ...payload } : t)));
      } else {
        const res = await fetch("/api/holiday-types", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
        const created = await res.json();
        setTypes((ts) => [...ts, created]);
      }
      setShowTypeForm(false);
    } catch (e: any) { alert(e.message || "Failed"); }
    finally { setSaving(false); }
  }

  async function deleteType(id: string) {
    if (!confirm("Delete this holiday type?")) return;
    await fetch(`/api/holiday-types/${id}`, { method: "DELETE" });
    setTypes((ts) => ts.filter((t) => t.id !== id));
  }

  return (
    <main className="flex-1 p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {([["holidays", "Holidays", CalendarDays], ["types", "Holiday Types", Tag]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === id ? "border-blue-600 text-blue-400" : "border-transparent text-white/40 hover:text-white/60"}`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* ── HOLIDAYS TAB ── */}
      {tab === "holidays" && (
        <div className="space-y-4">
          {/* Filters + Add button */}
          <div className="flex flex-wrap gap-3 items-end justify-between">
            <div className="flex flex-wrap gap-3">
              <div>
                <Label className="text-xs mb-1 block">Holiday Type</Label>
                <select className={SEL + " w-44"} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">All Types</option>
                  {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs mb-1 block">Session</Label>
                <select className={SEL + " w-44"} value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
                  <option value="">All Sessions</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.session}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={openAddHoliday}><Plus className="h-4 w-4 mr-1" /> Add Holiday</Button>
          </div>

          {/* Add/Edit form */}
          {showHolidayForm && (
            <Card className="border-blue-500/20 bg-blue-500/10/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-blue-300">{editingHoliday ? "Edit Holiday" : "Add Holiday"}</CardTitle>
                  <button onClick={() => setShowHolidayForm(false)}><X className="h-4 w-4 text-white/30" /></button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Holiday Type *</Label>
                  <select className={SEL} value={hForm.holidayTypeId} onChange={(e) => setHForm(f => ({ ...f, holidayTypeId: e.target.value }))}>
                    <option value="">Select type</option>
                    {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Session</Label>
                  <select className={SEL} value={hForm.sessionId} onChange={(e) => setHForm(f => ({ ...f, sessionId: e.target.value }))}>
                    <option value="">All Sessions</option>
                    {sessions.map((s) => <option key={s.id} value={s.id}>{s.session}</option>)}
                  </select>
                </div>
                <div>
                  <Label>From Date *</Label>
                  <Input type="date" value={hForm.fromDate} onChange={(e) => setHForm(f => ({ ...f, fromDate: e.target.value }))} />
                </div>
                <div>
                  <Label>To Date *</Label>
                  <Input type="date" value={hForm.toDate} onChange={(e) => setHForm(f => ({ ...f, toDate: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input value={hForm.description} onChange={(e) => setHForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Independence Day" />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="frontSite" checked={hForm.frontSite}
                    onChange={(e) => setHForm(f => ({ ...f, frontSite: e.target.checked }))} className="h-4 w-4 rounded border-white/[0.08]" />
                  <label htmlFor="frontSite" className="text-sm text-white/60">Show on front site / calendar</label>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={saveHoliday} disabled={saving} size="sm">{saving ? "Saving…" : editingHoliday ? "Update" : "Add Holiday"}</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowHolidayForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Holidays table */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30 border-2 border-dashed rounded-lg">
              <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No holidays found</p>
              <p className="text-sm mt-1">Click "Add Holiday" to create the first holiday</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f1015] border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Description</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">From</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">To</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Duration</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Session</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.map((h, i) => (
                      <tr key={h.id} className="hover:bg-[#0f1015]">
                        <td className="px-4 py-3 text-white/30">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{h.description || "—"}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{h.holidayType?.name}</Badge>
                        </td>
                        <td className="px-4 py-3 text-white/50">{new Date(h.fromDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-white/50">{new Date(h.toDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">{dayCount(h.fromDate, h.toDate)}</td>
                        <td className="px-4 py-3 text-white/30 text-xs">{h.session?.session ?? "All"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => openEditHoliday(h)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteHoliday(h.id)} className="text-red-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── HOLIDAY TYPES TAB ── */}
      {tab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openAddType}><Plus className="h-4 w-4 mr-1" /> Add Type</Button>
          </div>

          {showTypeForm && (
            <Card className="border-orange-500/20 bg-orange-500/10/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-orange-300">{editingType ? "Edit Holiday Type" : "Add Holiday Type"}</CardTitle>
                  <button onClick={() => setShowTypeForm(false)}><X className="h-4 w-4 text-white/30" /></button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type Name *</Label>
                  <Input value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="e.g. Public Holiday, School Holiday" />
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2 h-9">
                    <input type="checkbox" id="isDefault" checked={typeDefault} onChange={(e) => setTypeDefault(e.target.checked)} className="h-4 w-4 rounded border-white/[0.08]" />
                    <label htmlFor="isDefault" className="text-sm text-white/60">Set as default type</label>
                  </div>
                </div>
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={saveType} disabled={saving} size="sm">{saving ? "Saving…" : editingType ? "Update" : "Add Type"}</Button>
                  <Button variant="outline" size="sm" onClick={() => setShowTypeForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {types.length === 0 ? (
            <div className="text-center py-12 text-white/30 border-2 border-dashed rounded-lg">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No holiday types. Add one above.</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f1015] border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Type Name</th>
                      <th className="text-center px-4 py-3 font-medium text-white/50">Default</th>
                      <th className="text-center px-4 py-3 font-medium text-white/50">Holidays</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {types.map((t, i) => (
                      <tr key={t.id} className="hover:bg-[#0f1015]">
                        <td className="px-4 py-3 text-white/30">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{t.name}</td>
                        <td className="px-4 py-3 text-center">
                          {t.isDefault ? <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-medium">Default</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-white/40">{t._count?.holidays ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => openEditType(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteType(t.id)} className="text-red-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </main>
  );
}
