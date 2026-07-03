"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Star } from "lucide-react";

// Field toggles mirror Smart School's student_id_card enable_* columns.
const FIELDS = [
  { key: "enableAdmissionNo",      label: "Admission No." },
  { key: "enableStudentRollno",    label: "Roll No." },
  { key: "enableClass",            label: "Class / Section" },
  { key: "enableDob",              label: "Date of Birth" },
  { key: "enableBloodGroup",       label: "Blood Group" },
  { key: "enableFathersName",      label: "Father's Name" },
  { key: "enableMothersName",      label: "Mother's Name" },
  { key: "enablePhone",            label: "Phone" },
  { key: "enableAddress",          label: "Address" },
  { key: "enableStudentHouseName", label: "House" },
  { key: "enableStudentBarcode",   label: "Barcode" },
] as const;

type Template = {
  id: string;
  title: string;
  schoolName: string;
  schoolAddress?: string | null;
  headerColor?: string | null;
  status: number;
} & Record<string, any>;

type Props = { templates: Template[] };

function blank() {
  return {
    schoolName: "",
    title: "Student Identity Card",
    schoolAddress: "",
    headerColor: "#1a56db",
    enableAdmissionNo: true,
    enableStudentRollno: false,
    enableClass: true,
    enableDob: true,
    enableBloodGroup: true,
    enableFathersName: true,
    enableMothersName: false,
    enablePhone: true,
    enableAddress: true,
    enableStudentHouseName: false,
    enableStudentBarcode: false,
  };
}

export function IdCardSetupClient({ templates: init }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(init);
  const [open,   setOpen]   = useState(false);
  const [edit,   setEdit]   = useState<Template | null>(null);
  const [form,   setForm]   = useState<Record<string, any>>(blank());
  const [loading, setLoading] = useState(false);
  const [err,    setErr]    = useState("");

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.schoolName.trim()) { setErr("School name is required"); return; }
    if (!form.title.trim()) { setErr("Card title is required"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(edit ? `/api/id-card/${edit.id}` : "/api/id-card", {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTemplates(t => edit ? t.map(x => x.id === edit.id ? data : x) : [...t, data]);
      setOpen(false);
      router.refresh();
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/id-card/${id}`, { method: "DELETE" });
    setTemplates(t => t.filter(x => x.id !== id));
    router.refresh();
  }

  async function setActive(id: string) {
    // Smart School: status=1 marks the active/default template
    await fetch(`/api/id-card/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: 1 }),
    });
    for (const t of templates.filter(x => x.id !== id && x.status === 1)) {
      await fetch(`/api/id-card/${t.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: 0 }),
      });
    }
    setTemplates(ts => ts.map(t => ({ ...t, status: t.id === id ? 1 : 0 })));
    router.refresh();
  }

  function openEdit(t: Template) {
    const f: Record<string, any> = blank();
    for (const k of Object.keys(f)) if (k in t && t[k] !== null) f[k] = t[k];
    setForm(f); setEdit(t); setErr(""); setOpen(true);
  }

  const enabledLabels = (t: Template) =>
    FIELDS.filter(f => t[f.key]).map(f => f.label);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <Link href="/students" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Students
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">ID Card Templates</h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure what fields appear on printed student ID cards.</p>
        </div>
        <Button onClick={() => { setForm(blank()); setEdit(null); setErr(""); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" /> New Template
        </Button>
      </div>

      {templates.length === 0 && (
        <Card><CardContent className="py-10 text-center text-sm text-gray-400">No templates yet. Create one to enable ID card printing.</CardContent></Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card key={t.id} className={t.status === 1 ? "ring-2 ring-blue-500" : ""}>
            <CardContent className="pt-4 space-y-3">
              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden text-xs border border-slate-200">
                <div className="px-3 py-2 font-bold text-center text-white" style={{ backgroundColor: t.headerColor || "#1a56db" }}>
                  {t.schoolName || "School Name"}
                </div>
                <div className="px-3 py-2 bg-slate-50">
                  <p className="font-semibold text-gray-800">{t.title || "Student ID Card"}</p>
                  <p className="text-gray-500 mt-0.5">{enabledLabels(t).slice(0, 4).join(" · ") || "(no fields)"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {t.status === 1
                  ? <span className="text-xs font-medium text-blue-600 flex items-center gap-1"><Star className="h-3 w-3" /> Default</span>
                  : <button onClick={() => setActive(t.id)} className="text-xs text-gray-400 hover:text-blue-600">Set as default</button>
                }
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => remove(t.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{edit ? "Edit Template" : "New ID Card Template"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School name (header line) *</label>
              <Input value={form.schoolName} onChange={e => set("schoolName", e.target.value)} placeholder="e.g. St. Mary's Academy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card title *</label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Student Identity Card" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School address</label>
              <Input value={form.schoolAddress ?? ""} onChange={e => set("schoolAddress", e.target.value)} placeholder="optional — shown under the school name" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Header color</label>
              <input type="color" value={form.headerColor ?? "#1a56db"} onChange={e => set("headerColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fields to display</label>
              <div className="grid grid-cols-2 gap-1">
                {FIELDS.map(f => (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={!!form[f.key]} onChange={() => set(f.key, !form[f.key])} className="rounded" />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={save}>{loading ? "Saving…" : "Save Template"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
