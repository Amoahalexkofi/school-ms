"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";

// Toggle fields — mirrors Smart School staff_id_card boolean columns
const TOGGLES: { key: string; label: string }[] = [
  { key: "enableName",             label: "Full Name" },
  { key: "enableStaffId",          label: "Staff ID" },
  { key: "enableStaffRole",        label: "Role / Type" },
  { key: "enableStaffDepartment",  label: "Department" },
  { key: "enableDesignation",      label: "Designation" },
  { key: "enableStaffPhone",       label: "Phone" },
  { key: "enableDateOfJoining",    label: "Date of Joining" },
  { key: "enableStaffDob",         label: "Date of Birth" },
  { key: "enableFathersName",      label: "Father's Name" },
  { key: "enableMothersName",      label: "Mother's Name" },
  { key: "enablePermanentAddress", label: "Permanent Address" },
  { key: "enableVerticalCard",     label: "Vertical layout" },
];

type Template = {
  id: string;
  title: string;
  schoolName: string;
  schoolAddress: string;
  headerColor?: string | null;
  enableVerticalCard: boolean;
  enableStaffRole: boolean;
  enableStaffId: boolean;
  enableStaffDepartment: boolean;
  enableDesignation: boolean;
  enableName: boolean;
  enableFathersName: boolean;
  enableMothersName: boolean;
  enableDateOfJoining: boolean;
  enablePermanentAddress: boolean;
  enableStaffDob: boolean;
  enableStaffPhone: boolean;
};

function blank(): Omit<Template, "id"> {
  return {
    title: "",
    schoolName: "",
    schoolAddress: "",
    headerColor: "#1a56db",
    enableVerticalCard: false,
    enableName: true,
    enableStaffId: true,
    enableStaffRole: true,
    enableStaffDepartment: true,
    enableDesignation: true,
    enableStaffPhone: true,
    enableDateOfJoining: true,
    enableFathersName: false,
    enableMothersName: false,
    enablePermanentAddress: false,
    enableStaffDob: false,
  };
}

export function StaffIdCardSetupClient({ templates: init }: { templates: Template[] }) {
  const [templates, setTemplates] = useState<Template[]>(init);
  const [open,    setOpen]    = useState(false);
  const [edit,    setEdit]    = useState<Template | null>(null);
  const [form,    setForm]    = useState<Omit<Template, "id">>(blank());
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  function set(k: keyof typeof form, v: any) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.title.trim())      { setErr("Title is required"); return; }
    if (!form.schoolName.trim()) { setErr("School name is required"); return; }
    setLoading(true); setErr("");
    try {
      if (edit) {
        const res = await fetch(`/api/staff-id-cards/${edit.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setTemplates(t => t.map(x => x.id === edit.id ? data : x));
      } else {
        const res = await fetch("/api/staff-id-cards", {
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
    const res = await fetch(`/api/staff-id-cards/${id}`, { method: "DELETE" });
    if (res.ok) setTemplates(t => t.filter(x => x.id !== id));
  }

  function openEdit(t: Template) {
    const { id, ...rest } = t;
    setForm(rest);
    setEdit(t);
    setErr("");
    setOpen(true);
  }

  function openNew() {
    setForm(blank());
    setEdit(null);
    setErr("");
    setOpen(true);
  }

  const enabledCount = (t: Template) =>
    TOGGLES.filter(({ key }) => (t as any)[key] && key !== "enableVerticalCard").length;

  return (
    <main className="flex-1 p-6 space-y-5 max-w-4xl mx-auto">
      <Link href="/staff" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Staff
      </Link>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Staff ID Card Templates</h2>
          <p className="text-xs text-gray-400 mt-0.5">Configure what fields appear on printed staff ID cards.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1.5" /> New Template
        </Button>
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-400">
            No templates yet. Create one to enable staff ID card printing.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card key={t.id}>
            <CardContent className="pt-4 space-y-3">
              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden text-xs">
                <div
                  className="px-3 py-2 font-bold text-center text-white"
                  style={{ backgroundColor: t.headerColor ?? "#1a56db" }}
                >
                  {t.schoolName || "School Name"}
                </div>
                <div className="px-3 py-2 bg-gray-50">
                  <p className="font-semibold text-gray-800">{t.title || "Staff Identity Card"}</p>
                  <p className="text-gray-400 mt-0.5">
                    {enabledCount(t)} field{enabledCount(t) !== 1 ? "s" : ""} enabled
                    {t.enableVerticalCard ? " · Vertical" : " · Horizontal"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm" variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => remove(t.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit / Create dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{edit ? "Edit Template" : "New Staff ID Card Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Title *</label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Default Staff Card" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Name *</label>
              <Input value={form.schoolName} onChange={e => set("schoolName", e.target.value)} placeholder="e.g. St. Mary's Academy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
              <Input value={form.schoolAddress} onChange={e => set("schoolAddress", e.target.value)} placeholder="e.g. 123 Main St, Accra" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Header Colour</label>
              <input
                type="color"
                value={form.headerColor ?? "#1a56db"}
                onChange={e => set("headerColor", e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fields to display</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TOGGLES.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean((form as any)[key])}
                      onChange={e => set(key as any, e.target.checked)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {err && <p className="text-sm text-red-600 mt-1">{err}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={save}>{loading ? "Saving…" : "Save Template"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
