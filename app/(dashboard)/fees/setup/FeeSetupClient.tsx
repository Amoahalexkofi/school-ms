"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";

type Props = { categories: any[]; types: any[]; groups: any[]; sessions: any[]; discounts: any[] };
type Tab = "categories" | "types" | "groups" | "discounts";

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function FeeSetupClient({ categories, types, groups, sessions, discounts: initialDiscounts }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("categories");

  // ── Category state ──
  const [catOpen, setCatOpen]     = useState(false);
  const [catEdit, setCatEdit]     = useState<any>(null);
  const [catName, setCatName]     = useState("");
  const [catDesc, setCatDesc]     = useState("");
  const [catErr,  setCatErr]      = useState("");
  const [catLoad, setCatLoad]     = useState(false);

  // ── Fee Type state ──
  const [typeOpen, setTypeOpen]       = useState(false);
  const [typeEdit, setTypeEdit]       = useState<any>(null);
  const [typeName, setTypeName]       = useState("");
  const [typeCode, setTypeCode]       = useState("");
  const [typeCatId, setTypeCatId]     = useState("");
  const [typeDesc, setTypeDesc]       = useState("");
  const [typeErr,  setTypeErr]        = useState("");
  const [typeLoad, setTypeLoad]       = useState(false);

  // ── Discount state ──
  const [discounts,    setDiscounts]    = useState<any[]>(initialDiscounts);
  const [discOpen,     setDiscOpen]     = useState(false);
  const [discEdit,     setDiscEdit]     = useState<any>(null);
  const [discName,     setDiscName]     = useState("");
  const [discCode,     setDiscCode]     = useState("");
  const [discType,     setDiscType]     = useState("percentage");
  const [discPct,      setDiscPct]      = useState("");
  const [discAmt,      setDiscAmt]      = useState("");
  const [discDesc,     setDiscDesc]     = useState("");
  const [discExpiry,   setDiscExpiry]   = useState("");
  const [discErr,      setDiscErr]      = useState("");
  const [discLoad,     setDiscLoad]     = useState(false);

  // ── Group state ──
  const [grpOpen,    setGrpOpen]    = useState(false);
  const [grpEdit,    setGrpEdit]    = useState<any>(null);
  const [grpName,    setGrpName]    = useState("");
  const [grpDesc,    setGrpDesc]    = useState("");
  const [grpErr,     setGrpErr]     = useState("");
  const [grpLoad,    setGrpLoad]    = useState(false);
  const [sgOpen,     setSgOpen]     = useState(false);
  const [sgGroupId,  setSgGroupId]  = useState("");
  const [sgSession,  setSgSession]  = useState(sessions[0]?.id ?? "");
  const [sgErr,      setSgErr]      = useState("");
  const [sgLoad,     setSgLoad]     = useState(false);

  async function post(url: string, body: object) {
    const res  = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  async function patch(url: string, body: object) {
    const res  = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  }
  async function del(url: string) {
    const res  = await fetch(url, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
  }

  // ── Category handlers ──
  async function saveCategory() {
    if (!catName.trim()) { setCatErr("Name is required"); return; }
    setCatLoad(true); setCatErr("");
    try {
      if (catEdit) await patch(`/api/fees/categories/${catEdit.id}`, { name: catName, description: catDesc || null });
      else         await post("/api/fees/categories", { name: catName, description: catDesc || null });
      setCatOpen(false); router.refresh();
    } catch (e: any) { setCatErr(e.message); }
    finally { setCatLoad(false); }
  }
  async function deleteCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    try { await del(`/api/fees/categories/${id}`); router.refresh(); }
    catch (e: any) { alert(e.message); }
  }

  // ── Type handlers ──
  async function saveType() {
    if (!typeName.trim() || !typeCode.trim()) { setTypeErr("Name and code are required"); return; }
    setTypeLoad(true); setTypeErr("");
    try {
      if (typeEdit) await patch(`/api/fees/types/${typeEdit.id}`, { name: typeName, code: typeCode.toUpperCase(), feeCategoryId: typeCatId || null, description: typeDesc || null });
      else          await post("/api/fees/types", { name: typeName, code: typeCode, feeCategoryId: typeCatId || null, description: typeDesc || null });
      setTypeOpen(false); router.refresh();
    } catch (e: any) { setTypeErr(e.message); }
    finally { setTypeLoad(false); }
  }
  async function deleteType(id: string) {
    if (!confirm("Delete this fee type?")) return;
    try { await del(`/api/fees/types/${id}`); router.refresh(); }
    catch (e: any) { alert(e.message); }
  }

  // ── Discount handlers ──
  async function saveDiscount() {
    if (!discName.trim() || !discCode.trim()) { setDiscErr("Name and code are required"); return; }
    setDiscLoad(true); setDiscErr("");
    try {
      if (discEdit) {
        const updated = await patch(`/api/fees/discounts/${discEdit.id}`, {
          name: discName, code: discCode.toUpperCase(), type: discType,
          percentage: discPct ? parseFloat(discPct) : 0,
          amount:     discAmt ? parseFloat(discAmt) : 0,
          description: discDesc || null, expireDate: discExpiry ? new Date(discExpiry) : null,
        });
        setDiscounts(prev => prev.map(d => d.id === discEdit.id ? updated : d));
      } else {
        const res = await fetch("/api/fees/discounts", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: discName, code: discCode, type: discType,
            percentage: discPct, amount: discAmt,
            description: discDesc || null, expireDate: discExpiry || null,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDiscounts(prev => [...prev, data]);
      }
      setDiscOpen(false);
    } catch (e: any) { setDiscErr(e.message); }
    finally { setDiscLoad(false); }
  }
  async function deleteDiscount(id: string) {
    if (!confirm("Deactivate this discount?")) return;
    try {
      await del(`/api/fees/discounts/${id}`);
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (e: any) { alert(e.message); }
  }

  // ── Group handlers ──
  async function saveGroup() {
    if (!grpName.trim()) { setGrpErr("Name is required"); return; }
    setGrpLoad(true); setGrpErr("");
    try {
      if (grpEdit) await patch(`/api/fees/groups/${grpEdit.id}`, { name: grpName, description: grpDesc || null });
      else         await post("/api/fees/groups", { name: grpName, description: grpDesc || null });
      setGrpOpen(false); router.refresh();
    } catch (e: any) { setGrpErr(e.message); }
    finally { setGrpLoad(false); }
  }
  async function deleteGroup(id: string) {
    if (!confirm("Delete this fee group?")) return;
    try { await del(`/api/fees/groups/${id}`); router.refresh(); }
    catch (e: any) { alert(e.message); }
  }
  async function addSessionGroup() {
    if (!sgSession) { setSgErr("Select a session"); return; }
    setSgLoad(true); setSgErr("");
    try {
      await post("/api/fees/session-groups", { feeGroupId: sgGroupId, sessionId: sgSession });
      setSgOpen(false); router.refresh();
    } catch (e: any) { setSgErr(e.message); }
    finally { setSgLoad(false); }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "categories", label: "Fee Categories" },
    { key: "types",      label: "Fee Types" },
    { key: "groups",     label: "Fee Groups" },
    { key: "discounts",  label: "Discounts" },
  ];

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Fees
      </Link>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Categories ── */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
            <Button onClick={() => { setCatName(""); setCatDesc(""); setCatEdit(null); setCatErr(""); setCatOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Category
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c: any) => (
              <Card key={c.id}>
                <CardContent className="pt-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
                    <p className="text-xs text-blue-600 mt-1">{c._count.feeTypes} fee type{c._count.feeTypes !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setCatName(c.name); setCatDesc(c.description ?? ""); setCatEdit(c); setCatErr(""); setCatOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteCategory(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Fee Types ── */}
      {tab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{types.length} fee type{types.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setTypeName(""); setTypeCode(""); setTypeCatId(""); setTypeDesc(""); setTypeEdit(null); setTypeErr(""); setTypeOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Fee Type
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Code", "Category", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {types.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">No fee types yet.</td></tr>
                ) : types.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.code}</td>
                    <td className="px-4 py-3 text-gray-500">{t.feeCategory?.name ?? "—"}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setTypeName(t.name); setTypeCode(t.code); setTypeCatId(t.feeCategoryId ?? ""); setTypeDesc(t.description ?? ""); setTypeEdit(t); setTypeErr(""); setTypeOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteType(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Fee Groups ── */}
      {tab === "groups" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{groups.length} group{groups.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setGrpName(""); setGrpDesc(""); setGrpEdit(null); setGrpErr(""); setGrpOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Fee Group
            </Button>
          </div>
          <div className="space-y-3">
            {groups.length === 0 && (
              <Card><CardContent className="py-10 text-center text-sm text-gray-400">No fee groups yet.</CardContent></Card>
            )}
            {groups.map((g: any) => (
              <Card key={g.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{g.name}</p>
                      {g.description && <p className="text-xs text-gray-400">{g.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSgGroupId(g.id); setSgSession(sessions[0]?.id ?? ""); setSgErr(""); setSgOpen(true); }}>
                        + Session
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setGrpName(g.name); setGrpDesc(g.description ?? ""); setGrpEdit(g); setGrpErr(""); setGrpOpen(true); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteGroup(g.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {g.sessionGroups.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {g.sessionGroups.map((sg: any) => (
                        <Link key={sg.id} href={`/fees/groups/${sg.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{sg.session.session}</p>
                                <p className="text-xs text-gray-400">{sg._count.items} items · {sg._count.studentFeesMasters} students assigned</p>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Discounts ── */}
      {tab === "discounts" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{discounts.length} discount{discounts.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setDiscName(""); setDiscCode(""); setDiscType("percentage"); setDiscPct(""); setDiscAmt(""); setDiscDesc(""); setDiscExpiry(""); setDiscEdit(null); setDiscErr(""); setDiscOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Discount
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Name", "Code", "Type", "Value", "Expires", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {discounts.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No discounts yet.</td></tr>
                ) : discounts.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{d.code}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{d.type}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {d.type === "percentage" ? `${d.percentage}%` : `₵${Number(d.amount).toLocaleString()}`}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {d.expireDate ? new Date(d.expireDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => {
                        setDiscName(d.name); setDiscCode(d.code); setDiscType(d.type);
                        setDiscPct(String(d.percentage ?? "")); setDiscAmt(String(d.amount ?? ""));
                        setDiscDesc(d.description ?? ""); setDiscExpiry(d.expireDate ? d.expireDate.slice(0, 10) : "");
                        setDiscEdit(d); setDiscErr(""); setDiscOpen(true);
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteDiscount(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category dialog */}
      <Dialog open={catOpen} onOpenChange={o => !o && setCatOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{catEdit ? "Edit Category" : "Add Fee Category"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name *" value={catName} onChange={setCatName} placeholder="e.g. Academic Fees" />
            <Field label="Description" value={catDesc} onChange={setCatDesc} placeholder="Optional" />
          </div>
          {catErr && <p className="text-sm text-red-600">{catErr}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button>
            <Button disabled={catLoad} onClick={saveCategory}>{catLoad ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee Type dialog */}
      <Dialog open={typeOpen} onOpenChange={o => !o && setTypeOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{typeEdit ? "Edit Fee Type" : "Add Fee Type"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name *" value={typeName} onChange={setTypeName} placeholder="e.g. Tuition Fee" />
            <Field label="Code *" value={typeCode} onChange={setTypeCode} placeholder="e.g. TUI" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                value={typeCatId} onChange={e => setTypeCatId(e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="Description" value={typeDesc} onChange={setTypeDesc} />
          </div>
          {typeErr && <p className="text-sm text-red-600">{typeErr}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setTypeOpen(false)}>Cancel</Button>
            <Button disabled={typeLoad} onClick={saveType}>{typeLoad ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fee Group dialog */}
      <Dialog open={grpOpen} onOpenChange={o => !o && setGrpOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{grpEdit ? "Edit Fee Group" : "Add Fee Group"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name *" value={grpName} onChange={setGrpName} placeholder="e.g. Grade 1 Fees 2026" />
            <Field label="Description" value={grpDesc} onChange={setGrpDesc} />
          </div>
          {grpErr && <p className="text-sm text-red-600">{grpErr}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setGrpOpen(false)}>Cancel</Button>
            <Button disabled={grpLoad} onClick={saveGroup}>{grpLoad ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Session Group dialog */}
      <Dialog open={sgOpen} onOpenChange={o => !o && setSgOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Link to Session</DialogTitle></DialogHeader>
          <p className="text-xs text-gray-500">Select the academic session this fee group applies to.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session *</label>
            <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={sgSession} onChange={e => setSgSession(e.target.value)}>
              {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          {sgErr && <p className="text-sm text-red-600">{sgErr}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setSgOpen(false)}>Cancel</Button>
            <Button disabled={sgLoad} onClick={addSessionGroup}>{sgLoad ? "Linking…" : "Link Session"}</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Discount dialog */}
      <Dialog open={discOpen} onOpenChange={o => !o && setDiscOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{discEdit ? "Edit Discount" : "Add Discount"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Field label="Name *" value={discName} onChange={setDiscName} placeholder="e.g. Staff Child Discount" />
            <Field label="Code *" value={discCode} onChange={v => setDiscCode(v.toUpperCase())} placeholder="e.g. STAFF10" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                value={discType} onChange={e => setDiscType(e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="amount">Fixed Amount</option>
              </select>
            </div>
            {discType === "percentage"
              ? <Field label="Percentage %" value={discPct} onChange={setDiscPct} placeholder="e.g. 10" />
              : <Field label="Amount (₵)" value={discAmt} onChange={setDiscAmt} placeholder="e.g. 500" />}
            <Field label="Description" value={discDesc} onChange={setDiscDesc} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
              <input type="date" value={discExpiry} onChange={e => setDiscExpiry(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />
            </div>
          </div>
          {discErr && <p className="text-sm text-red-600">{discErr}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDiscOpen(false)}>Cancel</Button>
            <Button disabled={discLoad} onClick={saveDiscount}>{discLoad ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
