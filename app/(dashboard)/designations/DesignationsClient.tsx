"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layers, Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Desig = { id: string; name: string; isActive: boolean; _count: { staff: number } };

export function DesignationsClient({ designations }: { designations: Desig[] }) {
  const router = useRouter();
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openAdd() {
    setName("");
    setError("");
    setEditItemId(null);
    setShowAddPanel(true);
  }

  function closeAdd() {
    setShowAddPanel(false);
    setName("");
    setError("");
  }

  function openEdit(d: Desig) {
    setEditItemId(d.id);
    setEditName(d.name);
    setError("");
    setShowAddPanel(false);
  }

  function closeEdit() {
    setEditItemId(null);
    setEditName("");
    setError("");
  }

  async function handleAdd() {
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/designations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      closeAdd();
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/designations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      closeEdit();
      router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this designation?")) return;
    const res = await fetch(`/api/designations/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    router.refresh();
  }

  return (
    <main className="flex-1 p-6 space-y-5 max-w-2xl">
      <div className="flex justify-between items-center">
        <p className="text-sm text-white/40">{designations.length} designation{designations.length !== 1 ? "s" : ""}</p>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Designation
        </Button>
      </div>

      {/* Inline Add Panel */}
      {showAddPanel && (
        <div className="border border-blue-500/20 rounded-lg bg-blue-500/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm text-blue-300">Add Designation</h3>
            <button type="button" onClick={closeAdd} className="text-white/30 hover:text-white/50">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Designation Name *</Label>
              <Input
                placeholder="e.g. Head Teacher"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={closeAdd}>Cancel</Button>
              <Button size="sm" disabled={loading} onClick={handleAdd}>
                {loading ? "Adding…" : "Add Designation"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {designations.length === 0 ? (
            <div className="py-16 text-center text-white/30">
              <Layers className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No designations yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-white/50">Designation</th>
                  <th className="text-left px-4 py-3 font-medium text-white/50">Staff</th>
                  <th className="text-left px-4 py-3 font-medium text-white/50">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {designations.map((d) => (
                  <tr key={d.id} className="hover:bg-[#0f1015]">
                    <td className="px-4 py-3 font-medium">
                      {editItemId === d.id ? (
                        <Input
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleEdit(d.id); if (e.key === "Escape") closeEdit(); }}
                          className="h-7 text-sm"
                          autoFocus
                        />
                      ) : d.name}
                    </td>
                    <td className="px-4 py-3 text-white/40">{d._count.staff}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.04] text-white/40"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      {editItemId === d.id ? (
                        <>
                          {error && <span className="text-xs text-red-400 self-center mr-2">{error}</span>}
                          <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
                            disabled={loading} onClick={() => handleEdit(d.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={closeEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleDelete(d.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
