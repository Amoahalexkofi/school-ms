"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

type Dept = { id: string; name: string; isActive: boolean; _count: { staff: number } };

export function DepartmentsClient({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const [addOpen, setAddOpen]   = useState(false);
  const [editItem, setEditItem] = useState<Dept | null>(null);
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

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
      setAddOpen(false); setName(""); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleEdit() {
    if (!editItem || !name.trim()) { setError("Name is required"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/departments/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setEditItem(null); setName(""); router.refresh();
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
        <Button onClick={() => { setName(""); setError(""); setAddOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Add Department
        </Button>
      </div>

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
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-gray-500">{d._count.staff}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {d.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setName(d.name); setError(""); setEditItem(d); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={o => !o && setAddOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Department</DialogTitle></DialogHeader>
          <Input placeholder="Department name" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleAdd}>{loading ? "Adding…" : "Add"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={o => !o && setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Department</DialogTitle></DialogHeader>
          <Input placeholder="Department name" value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleEdit()} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button disabled={loading} onClick={handleEdit}>{loading ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
