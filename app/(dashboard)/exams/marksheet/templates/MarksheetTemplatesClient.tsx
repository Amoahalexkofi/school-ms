"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Pencil, X, FileText } from "lucide-react";

type Tpl = {
  id: string; template?: string; title?: string; heading?: string;
  leftSign?: string; middleSign?: string; rightSign?: string;
  isName: boolean; isFatherName: boolean; isMotherName: boolean;
  isDob: boolean; isAdmissionNo: boolean; isRollNo: boolean;
};

const empty = {
  template: "", title: "REPORT CARD / MARKSHEET", heading: "",
  leftSign: "Class Teacher", middleSign: "", rightSign: "Principal",
  isName: true, isFatherName: true, isMotherName: true, isDob: true, isAdmissionNo: true, isRollNo: true,
};

const TOGGLES: { key: keyof typeof empty; label: string }[] = [
  { key: "isName", label: "Student Name" }, { key: "isFatherName", label: "Father's Name" },
  { key: "isMotherName", label: "Mother's Name" }, { key: "isDob", label: "Date of Birth" },
  { key: "isAdmissionNo", label: "Admission No." }, { key: "isRollNo", label: "Roll No." },
];

export function MarksheetTemplatesClient({ templates: initial }: { templates: Tpl[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Tpl[]>(initial);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  function openNew() { setEditId(null); setForm(empty); setOpen(true); }
  function openEdit(t: Tpl) {
    setEditId(t.id);
    setForm({ ...empty, ...t });
    setOpen(true);
  }
  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.template?.trim()) { alert("Template name is required"); return; }
    setSaving(true);
    try {
      const url = editId ? `/api/marksheets/${editId}` : "/api/marksheets";
      const res = await fetch(url, { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await res.json(); if (!res.ok) throw new Error(d.error);
      setOpen(false); router.refresh();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }
  async function del(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/marksheets/${id}`, { method: "DELETE" });
    setTemplates((t) => t.filter((x) => x.id !== id)); router.refresh();
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/exams/marksheet" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft className="h-4 w-4" /> Back to Marksheets
        </Link>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> New Template</Button>
      </div>

      <p className="text-sm text-gray-500">
        Design report-card templates — choose a title/heading, signature labels, and which student fields appear.
        Pick a template when generating marksheets.
      </p>

      {templates.length === 0 ? (
        <Card><CardContent className="py-14 text-center text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No templates yet. The default layout is used until you create one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{t.template || "Untitled"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="text-gray-300 hover:text-indigo-600" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(t.id)} className="text-gray-300 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {TOGGLES.filter((x) => (t as any)[x.key]).map((x) => (
                    <span key={x.key} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{x.label}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Template" : "New Template"}</h3>
              <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Template Name *</label>
                <Input value={form.template} onChange={(e) => set("template", e.target.value)} placeholder="e.g. Term Report" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Report Card Title</label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="REPORT CARD / MARKSHEET" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Heading / Sub-text</label>
                <Input value={form.heading} onChange={(e) => set("heading", e.target.value)} placeholder="e.g. Continuous Assessment Report" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Show fields</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOGGLES.map((x) => (
                    <label key={x.key} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={!!form[x.key]} onChange={(e) => set(x.key, e.target.checked)} /> {x.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Left signature</label><Input value={form.leftSign} onChange={(e) => set("leftSign", e.target.value)} /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Middle signature</label><Input value={form.middleSign} onChange={(e) => set("middleSign", e.target.value)} placeholder="(optional)" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Right signature</label><Input value={form.rightSign} onChange={(e) => set("rightSign", e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Template"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
