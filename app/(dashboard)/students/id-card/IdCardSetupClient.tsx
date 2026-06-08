"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Star } from "lucide-react";

const FIELDS = [
  { key: "admissionNo",  label: "Admission No." },
  { key: "rollNo",       label: "Roll No." },
  { key: "class",        label: "Class / Section" },
  { key: "dob",          label: "Date of Birth" },
  { key: "gender",       label: "Gender" },
  { key: "bloodGroup",   label: "Blood Group" },
  { key: "fatherName",   label: "Father Name" },
  { key: "phone",        label: "Phone" },
  { key: "address",      label: "Address" },
  { key: "houseNo",      label: "House" },
  { key: "session",      label: "Session" },
];

type Template = {
  id: string; heading: string; title?: string;
  bgColor: string; fontColor: string; bodyColor: string;
  schoolName?: string; fieldList?: string[]; status: number;
};

type Props = { templates: Template[] };

function blank(): Omit<Template, "id" | "status"> {
  return { heading: "", title: "", bgColor: "#1a56db", fontColor: "#ffffff", bodyColor: "#f9fafb", schoolName: "", fieldList: [] };
}

export function IdCardSetupClient({ templates: init }: Props) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>(init);
  const [open,   setOpen]   = useState(false);
  const [edit,   setEdit]   = useState<Template | null>(null);
  const [form,   setForm]   = useState(blank());
  const [loading, setLoading] = useState(false);
  const [err,    setErr]    = useState("");

  function set(k: keyof typeof form, v: any) { setForm(f => ({ ...f, [k]: v })); }

  function toggleField(key: string) {
    const list = form.fieldList ?? [];
    set("fieldList", list.includes(key) ? list.filter(k => k !== key) : [...list, key]);
  }

  async function save() {
    if (!form.heading.trim()) { setErr("Heading is required"); return; }
    setLoading(true); setErr("");
    try {
      if (edit) {
        const res = await fetch(`/api/id-card/${edit.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTemplates(t => t.map(x => x.id === edit.id ? data : x));
      } else {
        const res = await fetch("/api/id-card", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTemplates(t => [...t, data]);
      }
      setOpen(false);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/id-card/${id}`, { method: "DELETE" });
    setTemplates(t => t.filter(x => x.id !== id));
  }

  async function setActive(id: string) {
    // Smart School: status=1 marks the active/default template
    await fetch(`/api/id-card/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: 1 }),
    });
    // Set all others to status 0
    for (const t of templates.filter(x => x.id !== id && x.status === 1)) {
      await fetch(`/api/id-card/${t.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: 0 }),
      });
    }
    router.refresh();
  }

  return (
    <main className="flex-1 p-6 space-y-5 max-w-4xl mx-auto">
      <Link href="/students" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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
              <div className="rounded-lg overflow-hidden text-xs" style={{ backgroundColor: t.bgColor, color: t.fontColor }}>
                <div className="px-3 py-2 font-bold text-center">{t.heading || "School Name"}</div>
                <div style={{ backgroundColor: t.bodyColor, color: "#111" }} className="px-3 py-2">
                  <p className="font-semibold">{t.title || "Student ID Card"}</p>
                  <p className="text-gray-400 mt-0.5">{(t.fieldList ?? []).slice(0, 3).join(" · ")||"(no fields)"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                {t.status === 1
                  ? <span className="text-xs font-medium text-blue-600 flex items-center gap-1"><Star className="h-3 w-3" /> Default</span>
                  : <button onClick={() => setActive(t.id)} className="text-xs text-gray-400 hover:text-blue-600">Set as default</button>
                }
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => { setForm({ heading: t.heading, title: t.title??"", bgColor: t.bgColor, fontColor: t.fontColor, bodyColor: t.bodyColor, schoolName: t.schoolName??"", fieldList: t.fieldList??[] }); setEdit(t); setErr(""); setOpen(true); }}>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Heading (school name line) *</label>
              <Input value={form.heading} onChange={e => set("heading", e.target.value)} placeholder="e.g. St. Mary's Academy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sub-title</label>
              <Input value={form.title??""} onChange={e => set("title", e.target.value)} placeholder="e.g. Student Identity Card" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Header BG</label>
                <input type="color" value={form.bgColor} onChange={e => set("bgColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Header Text</label>
                <input type="color" value={form.fontColor} onChange={e => set("fontColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Body BG</label>
                <input type="color" value={form.bodyColor} onChange={e => set("bodyColor", e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fields to display</label>
              <div className="grid grid-cols-2 gap-1">
                {FIELDS.map(f => (
                  <label key={f.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={(form.fieldList??[]).includes(f.key)} onChange={() => toggleField(f.key)} className="rounded" />
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
