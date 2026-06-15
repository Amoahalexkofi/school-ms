"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Home, X, Check } from "lucide-react";

type House = { id: string; name: string; isActive: boolean; _count?: { students: number } };

export function SchoolHousesClient({ houses: initial }: { houses: House[] }) {
  const router = useRouter();
  const [houses, setHouses] = useState<House[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<House | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function add() {
    if (!name.trim()) return alert("House name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/school-houses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const created = await res.json();
      setHouses((hs) => [...hs, { ...created, _count: { students: 0 } }]);
      setName(""); setShowForm(false);
    } catch (e: any) { alert(e.message || "Failed"); }
    finally { setSaving(false); }
  }

  async function save(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await fetch(`/api/school-houses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName.trim() }) });
      setHouses((hs) => hs.map((h) => (h.id === id ? { ...h, name: editName.trim() } : h)));
      setEditRowId(null);
    } catch { alert("Failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this house?")) return;
    await fetch(`/api/school-houses/${id}`, { method: "DELETE" });
    setHouses((hs) => hs.filter((h) => h.id !== id));
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">School Houses</h2>
          <p className="text-sm text-white/40 mt-0.5">Manage the school houses students are assigned to.</p>
        </div>
        <Button onClick={() => { setShowForm(true); setName(""); }}><Plus className="h-4 w-4 mr-1" /> Add House</Button>
      </div>

      {showForm && (
        <Card className="border-blue-500/20 bg-blue-500/10/30">
          <CardContent className="pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>House Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Red House, Phoenix, Lions" autoFocus />
              </div>
              <Button onClick={add} disabled={saving} size="sm">{saving ? "Saving…" : "Add"}</Button>
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {houses.length === 0 ? (
        <div className="text-center py-16 text-white/30 border-2 border-dashed rounded-lg">
          <Home className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No school houses yet</p>
          <p className="text-sm mt-1">Click "Add House" to create the first house.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                  <th className="text-left px-4 py-3 font-medium text-white/50">House Name</th>
                  <th className="text-center px-4 py-3 font-medium text-white/50">Students</th>
                  <th className="text-right px-4 py-3 font-medium text-white/50">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {houses.map((h, i) => (
                  <tr key={h.id} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-3 text-white/30">{i + 1}</td>
                    <td className="px-4 py-3">
                      {editRowId === h.id ? (
                        <div className="flex items-center gap-2">
                          <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-48" autoFocus />
                          <button onClick={() => save(h.id)} className="text-emerald-400 hover:text-emerald-400"><Check className="h-4 w-4" /></button>
                          <button onClick={() => setEditRowId(null)} className="text-white/30"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <span className="font-medium">{h.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-white/40">{h._count?.students ?? 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setEditRowId(h.id); setEditName(h.name); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => del(h.id)} className="text-red-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
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
