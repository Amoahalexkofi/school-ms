"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Item = { id: string; name: string; description?: string };

export function SourcesClient({ items: initial, apiPath, title, description }: {
  items: Item[]; entity: string; apiPath: string; title: string; description: string;
}) {
  const [items, setItems] = useState<Item[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!form.name.trim()) return alert("Name is required");
    setSaving(true);
    try {
      const res = await fetch(apiPath, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const created = await res.json();
      setItems((is) => [...is, created]);
      setForm({ name: "", description: "" }); setShowForm(false);
    } catch (e: any) { alert(e.message || "Failed"); }
    finally { setSaving(false); }
  }

  async function update(id: string) {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await fetch(`${apiPath}/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      setItems((is) => is.map((i) => (i.id === id ? { ...i, ...editForm } : i)));
      setEditId(null);
    } catch { alert("Failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    setItems((is) => is.filter((i) => i.id !== id));
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <Button onClick={() => { setShowForm(true); setForm({ name: "", description: "" }); }}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" autoFocus />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={add} disabled={saving} size="sm">{saving ? "Saving…" : "Add"}</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
          <p>No items yet. Click "Add" to create one.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      {editId === item.id ? (
                        <Input value={editForm.name} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 w-40" autoFocus />
                      ) : <span className="font-medium">{item.name}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {editId === item.id ? (
                        <Input value={editForm.description ?? ""} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="h-8 w-48" />
                      ) : item.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {editId === item.id ? (
                          <>
                            <button onClick={() => update(item.id)} className="text-green-600 p-1"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setEditId(null)} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
                          </>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => { setEditId(item.id); setEditForm({ name: item.name, description: item.description ?? "" }); }}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => del(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
