"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2, GripVertical, Users, UserCheck } from "lucide-react";

type CustomField = {
  id: string;
  tableName: string;
  fieldLabel: string;
  fieldType: string;
  options?: string;
  isRequired: boolean;
  order: number;
};

const FIELD_TYPES = ["TEXT", "NUMBER", "DATE", "SELECT", "TEXTAREA"];
const TYPE_LABELS: Record<string, string> = {
  TEXT: "Text", NUMBER: "Number", DATE: "Date", SELECT: "Dropdown", TEXTAREA: "Textarea",
};
const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

const emptyForm = {
  tableName: "students",
  fieldLabel: "",
  fieldType: "TEXT",
  options: "",
  isRequired: false,
};

export function CustomFieldsClient({ fields: initial }: { fields: CustomField[] }) {
  const [fields, setFields] = useState<CustomField[]>(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [editing, setEditing] = useState<CustomField | null>(null);
  const [saving, setSaving] = useState(false);

  const studentFields = fields.filter((f) => f.tableName === "students").sort((a, b) => a.order - b.order);
  const staffFields = fields.filter((f) => f.tableName === "staff").sort((a, b) => a.order - b.order);

  function set(k: string, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  function openAdd(tableName = "students") {
    setEditing(null);
    setForm({ ...emptyForm, tableName });
    setShowAdd(true);
  }

  function openEdit(field: CustomField) {
    setEditing(field);
    setForm({
      tableName: field.tableName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      options: field.options ?? "",
      isRequired: field.isRequired,
    });
    setShowAdd(true);
  }

  async function save() {
    if (!form.fieldLabel.trim()) return alert("Field label is required");
    if (form.fieldType === "SELECT" && !form.options.trim()) return alert("Options required for dropdown type");
    setSaving(true);
    try {
      const payload = {
        tableName: form.tableName,
        fieldLabel: form.fieldLabel.trim(),
        fieldType: form.fieldType,
        options: form.fieldType === "SELECT" ? form.options.trim() : null,
        isRequired: form.isRequired,
      };

      if (editing) {
        const res = await fetch(`/api/custom-fields/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const updated = await res.json();
        setFields((fs) => fs.map((f) => (f.id === editing.id ? { ...f, ...updated } : f)));
      } else {
        const res = await fetch("/api/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const created = await res.json();
        setFields((fs) => [...fs, created]);
      }
      setShowAdd(false);
      setEditing(null);
      setForm(emptyForm);
    } catch {
      alert("Failed to save field");
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this custom field? All values stored for this field will also be deleted.")) return;
    try {
      await fetch(`/api/custom-fields/${id}`, { method: "DELETE" });
      setFields((fs) => fs.filter((f) => f.id !== id));
    } catch {
      alert("Failed to delete");
    }
  }

  function FieldTable({ items, tableName }: { items: CustomField[]; tableName: string }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {tableName === "students"
              ? <Users className="h-4 w-4 text-blue-600" />
              : <UserCheck className="h-4 w-4 text-purple-600" />}
            <h3 className="font-semibold text-sm">
              {tableName === "students" ? "Student Fields" : "Staff Fields"}
            </h3>
            <Badge variant="outline" className="text-xs">{items.length}</Badge>
          </div>
          <Button size="sm" onClick={() => openAdd(tableName)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Field
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center border border-dashed rounded-lg">
            No custom fields yet. Click "Add Field" to create one.
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-8 px-3 py-2.5" />
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Field Label</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Options</th>
                  <th className="text-center px-4 py-2.5 font-medium text-gray-600">Required</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-gray-300">
                      <GripVertical className="h-4 w-4" />
                    </td>
                    <td className="px-4 py-2.5 font-medium">{field.fieldLabel}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-xs">{TYPE_LABELS[field.fieldType]}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs max-w-[200px] truncate">
                      {field.fieldType === "SELECT" ? (field.options ?? "—") : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {field.isRequired
                        ? <span className="text-xs text-red-600 font-medium">Yes</span>
                        : <span className="text-xs text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(field)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => del(field.id)} className="text-red-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">Custom Fields</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Add extra data fields to student and staff profiles. Fields appear in the "Other" section of each profile.
          </p>
        </div>
      </div>

      {/* Add / Edit panel */}
      {showAdd && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">
              {editing ? "Edit Custom Field" : "Add Custom Field"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>For</Label>
              <select className={SEL} value={form.tableName} onChange={(e) => set("tableName", e.target.value)} disabled={!!editing}>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div>
              <Label>Field Label *</Label>
              <Input
                value={form.fieldLabel}
                onChange={(e) => set("fieldLabel", e.target.value)}
                placeholder="e.g. Previous School, Medical Condition"
              />
            </div>
            <div>
              <Label>Field Type</Label>
              <select className={SEL} value={form.fieldType} onChange={(e) => set("fieldType", e.target.value)}>
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            {form.fieldType === "SELECT" && (
              <div>
                <Label>Options (comma-separated) *</Label>
                <Input
                  value={form.options}
                  onChange={(e) => set("options", e.target.value)}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                id="isRequired"
                checked={form.isRequired}
                onChange={(e) => set("isRequired", e.target.checked)}
                className="h-4 w-4 rounded border-slate-200"
              />
              <label htmlFor="isRequired" className="text-sm text-gray-700">Required field</label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={save} disabled={saving} size="sm">
                {saving ? "Saving…" : editing ? "Update" : "Add Field"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setEditing(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Fields */}
      <Card>
        <CardContent className="pt-6">
          <FieldTable items={studentFields} tableName="students" />
        </CardContent>
      </Card>

      {/* Staff Fields */}
      <Card>
        <CardContent className="pt-6">
          <FieldTable items={staffFields} tableName="staff" />
        </CardContent>
      </Card>

      <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-500">
        <p className="font-medium text-gray-700 mb-1">How custom fields work</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Fields added here appear in student and staff profiles under the "Other" section.</li>
          <li>For <strong>Dropdown</strong> type, enter options separated by commas.</li>
          <li>Deleting a field also removes all values stored for it.</li>
        </ul>
      </div>
    </main>
  );
}
