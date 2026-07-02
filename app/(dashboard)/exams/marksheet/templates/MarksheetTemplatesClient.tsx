"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, Pencil, X, FileText, Upload } from "lucide-react";

type Tpl = {
  id: string; template?: string; title?: string; heading?: string;
  leftSign?: string; middleSign?: string; rightSign?: string;
  leftLogo?: string | null; rightLogo?: string | null;
  headerColor?: string | null; footerText?: string | null; watermark?: boolean;
  isName: boolean; isFatherName: boolean; isMotherName: boolean;
  isDob: boolean; isAdmissionNo: boolean; isRollNo: boolean;
};

type School = { name: string; address: string | null; logo: string | null; motto: string | null };

const empty = {
  template: "", title: "TERMINAL REPORT SHEET", heading: "",
  leftSign: "Class Teacher", middleSign: "", rightSign: "Head Teacher",
  leftLogo: "", rightLogo: "", headerColor: "#1d4ed8", footerText: "", watermark: false,
  isName: true, isFatherName: true, isMotherName: true, isDob: true, isAdmissionNo: true, isRollNo: true,
};

const TOGGLES: { key: keyof typeof empty; label: string }[] = [
  { key: "isName", label: "Student Name" }, { key: "isFatherName", label: "Father's Name" },
  { key: "isMotherName", label: "Mother's Name" }, { key: "isDob", label: "Date of Birth" },
  { key: "isAdmissionNo", label: "Admission No." }, { key: "isRollNo", label: "Roll No." },
];

// Common school colors — deep, print-friendly
const COLOR_PRESETS = ["#1d4ed8", "#166534", "#7f1d1d", "#7c2d12", "#581c87", "#0e7490", "#111827", "#a16207"];

function LogoField({ label, value, onChange }: { label: string; value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="" className="w-9 h-9 rounded object-contain border border-slate-200 bg-white" />
        ) : (
          <div className="w-9 h-9 rounded border border-dashed border-slate-300" aria-hidden />
        )}
        <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" /> {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-xs text-slate-500 hover:text-rose-600">
            Remove
          </button>
        )}
        <input
          ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden" aria-label={`${label} file`}
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
        />
      </div>
    </div>
  );
}

/** HTML approximation of the printed report — updates as the form changes. */
function Preview({ form, school }: { form: any; school: School }) {
  const leftLogo = form.leftLogo || school.logo || "";
  const headerColor = /^#[0-9a-fA-F]{3,8}$/.test(form.headerColor ?? "") ? form.headerColor : "#1d4ed8";
  const footer = form.footerText || school.motto || "";
  const rows = [
    { subject: "English Language", cs: 41, es: 38, total: 79, grade: "B", pos: 3, remark: "Very Good" },
    { subject: "Mathematics", cs: 44, es: 42, total: 86, grade: "A", pos: 1, remark: "Excellent" },
    { subject: "Science", cs: 35, es: 33, total: 68, grade: "C", pos: 6, remark: "Good" },
  ];

  return (
    <div className="relative bg-white border border-slate-200 rounded-lg p-4 text-[10px] leading-tight overflow-hidden" aria-label="Report card preview">
      {form.watermark && leftLogo && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={leftLogo} alt="" className="absolute inset-0 m-auto w-48 h-48 object-contain opacity-5 pointer-events-none" />
      )}

      {/* Header */}
      <div className="rounded flex items-center gap-2 px-3 py-2.5 text-white" style={{ backgroundColor: headerColor }}>
        {leftLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={leftLogo} alt="" className="w-8 h-8 object-contain" />
        ) : <div className="w-8" />}
        <div className="flex-1 text-center">
          <p className="font-bold text-[12px]">{school.name}</p>
          {school.address && <p className="opacity-80 text-[8px]">{school.address}</p>}
          <p className="font-bold tracking-[0.2em] text-[9px] mt-0.5">{form.title || "TERMINAL REPORT SHEET"}</p>
          {form.heading && <p className="opacity-80 text-[8px]">{form.heading}</p>}
          <p className="opacity-80 text-[8px]">End of Term 1 Examination</p>
        </div>
        {form.rightLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={form.rightLogo} alt="" className="w-8 h-8 object-contain" />
        ) : <div className="w-8" />}
      </div>

      {/* Student info */}
      <div className="border border-t-0 border-slate-200 px-3 py-2 grid grid-cols-3 gap-1.5">
        {form.isName && <div><p className="text-slate-400 text-[7px]">Student Name</p><p>Ekow Mensah</p></div>}
        {form.isAdmissionNo && <div><p className="text-slate-400 text-[7px]">Admission No</p><p>STM-0042</p></div>}
        {form.isRollNo && <div><p className="text-slate-400 text-[7px]">Roll No</p><p>7</p></div>}
        <div><p className="text-slate-400 text-[7px]">Class</p><p>Basic 4 – A</p></div>
        {form.isFatherName && <div><p className="text-slate-400 text-[7px]">Father&rsquo;s Name</p><p>Kofi Mensah</p></div>}
        {form.isMotherName && <div><p className="text-slate-400 text-[7px]">Mother&rsquo;s Name</p><p>Ama Mensah</p></div>}
        {form.isDob && <div><p className="text-slate-400 text-[7px]">Date of Birth</p><p>12/03/2015</p></div>}
        <div><p className="text-slate-400 text-[7px]">Rank</p><p>#2</p></div>
      </div>

      {/* Subject table */}
      <table className="w-full mt-2 border border-slate-200 tabular-nums">
        <thead>
          <tr className="bg-slate-100 text-[8px]">
            <th className="text-left px-1.5 py-1 font-bold">Subject</th>
            <th className="px-1 py-1 font-bold">Class (50%)</th>
            <th className="px-1 py-1 font-bold">Exam (50%)</th>
            <th className="px-1 py-1 font-bold">Total</th>
            <th className="px-1 py-1 font-bold">Grade</th>
            <th className="px-1 py-1 font-bold">Pos.</th>
            <th className="text-left px-1.5 py-1 font-bold">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.subject} className="border-t border-slate-100">
              <td className="px-1.5 py-1">{r.subject}</td>
              <td className="text-center">{r.cs}</td>
              <td className="text-center">{r.es}</td>
              <td className="text-center">{r.total}</td>
              <td className="text-center">{r.grade}</td>
              <td className="text-center">{r.pos}</td>
              <td className="px-1.5">{r.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Wrapper */}
      <div className="border border-slate-200 mt-2 px-3 py-2 grid grid-cols-4 gap-1.5">
        <div><p className="text-slate-400 text-[7px]">Attendance</p><p>58 out of 60</p></div>
        <div><p className="text-slate-400 text-[7px]">Position in Class</p><p>#2 of 32</p></div>
        <div><p className="text-slate-400 text-[7px]">Conduct</p><p>Very Good</p></div>
        <div><p className="text-slate-400 text-[7px]">Promoted To</p><p>Basic 5</p></div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between mt-4 px-2">
        {[form.leftSign, form.middleSign, form.rightSign].filter(Boolean).map((label: string, k: number) => (
          <div key={k} className="border-t border-slate-400 pt-0.5 w-24 text-center text-slate-500 text-[8px]">{label}</div>
        ))}
      </div>

      {footer && <p className="text-center text-slate-500 text-[8px] mt-2 italic">{footer}</p>}
    </div>
  );
}

export function MarksheetTemplatesClient({ templates: initial, school }: { templates: Tpl[]; school: School }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Tpl[]>(initial);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);

  function openNew() { setEditId(null); setForm({ ...empty, footerText: school.motto ?? "" }); setOpen(true); }
  function openEdit(t: Tpl) {
    setEditId(t.id);
    setForm({ ...empty, ...t, headerColor: t.headerColor || "#1d4ed8", leftLogo: t.leftLogo ?? "", rightLogo: t.rightLogo ?? "", footerText: t.footerText ?? "" });
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

      <p className="text-sm text-gray-500 max-w-[65ch]">
        Design your school&rsquo;s report card — crest, colors, motto, titles, signatures and which
        student fields appear. The preview updates as you edit. Pick a template when generating marksheets.
      </p>

      {templates.length === 0 ? (
        <Card><CardContent className="py-14 text-center text-gray-400">
          <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No templates yet. The default layout (with your school logo) is used until you create one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: t.headerColor || "#1d4ed8" }}
                      aria-hidden
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{t.template || "Untitled"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.title}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="text-gray-300 hover:text-indigo-600" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => del(t.id)} className="text-gray-300 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(t.leftLogo || t.rightLogo) && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">Logo</span>}
                  {t.watermark && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">Watermark</span>}
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
          <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <h3 className="font-semibold text-gray-800">{editId ? "Edit Template" : "New Template"}</h3>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4 text-gray-400" /></button>
            </div>

            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Template Name *</label>
                  <Input value={form.template} onChange={(e) => set("template", e.target.value)} placeholder="e.g. Term Report" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Report Card Title</label>
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="TERMINAL REPORT SHEET" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Heading / Sub-text</label>
                  <Input value={form.heading} onChange={(e) => set("heading", e.target.value)} placeholder="e.g. Continuous Assessment Report" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <LogoField label="Left logo (school crest)" value={form.leftLogo} onChange={(url) => set("leftLogo", url)} />
                  <LogoField label="Right logo (optional)" value={form.rightLogo} onChange={(url) => set("rightLogo", url)} />
                </div>
                {!form.leftLogo && school.logo && (
                  <p className="text-[11px] text-slate-500">No left logo set — your school profile logo is used automatically.</p>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Header color</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c} type="button" onClick={() => set("headerColor", c)}
                        aria-label={`Header color ${c}`}
                        className={`w-7 h-7 rounded-full border transition-transform ${form.headerColor === c ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "border-black/10 hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.headerColor ?? "") ? form.headerColor : "#1d4ed8"}
                      onChange={(e) => set("headerColor", e.target.value)}
                      aria-label="Custom header color"
                      className="w-7 h-7 rounded-full border border-black/10 cursor-pointer p-0 bg-transparent"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={!!form.watermark} onChange={(e) => set("watermark", e.target.checked)} />
                  Faint crest watermark behind the page
                </label>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Footer text</label>
                  <Input value={form.footerText} onChange={(e) => set("footerText", e.target.value)} placeholder={school.motto ?? "e.g. Knowledge is Light"} />
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
              </div>

              {/* Live preview */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1.5">Preview</p>
                <div className="sticky top-16">
                  <Preview form={form} school={school} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 py-3 border-t sticky bottom-0 bg-white rounded-b-xl">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Template"}</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
