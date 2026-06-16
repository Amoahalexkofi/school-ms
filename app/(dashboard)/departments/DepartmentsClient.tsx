"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Pencil, Trash2, X, Check } from "lucide-react";

type Dept = { id: string; name: string; isActive: boolean; _count: { staff: number } };

export function DepartmentsClient({ departments }: { departments: Dept[] }) {
  const perm = usePermission("system_settings");
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

  function openEdit(d: Dept) {
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
      const res = await fetch("/api/departments", {
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
      const res = await fetch(`/api/departments/${id}`, {
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
    if (!confirm("Delete this department?")) return;
    const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
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
        <p className="text-sm text-gray-500">{departments.length} department{departments.length !== 1 ? "s" : ""}</p>
        {perm.canAdd && (
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Department
          </Button>
        )}
      </div>

      {/* Inline Add Panel */}
      {showAddPanel && (
        <div className="border border-blue-200 rounded-lg bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm text-blue-800">Add Department</h3>
            <button type="button" onClick={closeAdd} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Department Name *</Label>
              <Input
                placeholder="e.g. Science Department"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                autoFocus
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={closeAdd}>Cancel</Button>
              <Button size="sm" disabled={loading} onClick={handleAdd}>
                {loading ? "Adding…" : "Add Department"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {departments.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No departments yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Staff</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-gray-500">{d._count.staff}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      {editItemId === d.id ? (
                        <>
                          {error && <span className="text-xs text-red-600 self-center mr-2">{error}</span>}
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                            disabled={loading} onClick={() => handleEdit(d.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={closeEdit}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {perm.canEdit && (
                            <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {perm.canDelete && (
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDelete(d.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
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
