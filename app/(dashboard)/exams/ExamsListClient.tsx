"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookOpen, Plus, ChevronRight, Pencil, Trash2, Globe, Lock, FileText, CreditCard, SlidersHorizontal } from "lucide-react";
import { usePermission } from "@/components/PermissionsProvider";

const EXAM_TYPES = ["TERM", "MIDTERM", "FINAL", "UNIT_TEST", "MOCK", "OTHER"];

type Group = {
  id: string; name: string; examType: string | null; description: string | null;
  isPublished: boolean; isActive: boolean; createdAt: string;
  _count: { schedules: number };
};

export function ExamsListClient({ groups }: { groups: Group[] }) {
  const perm = usePermission("examination");
  const router = useRouter();
  const [open,    setOpen]    = useState(false);
  const [edit,    setEdit]    = useState<Group | null>(null);
  const [form,    setForm]    = useState({ name: "", examType: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSave() {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!edit) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/exams/${edit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOpen(false); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function togglePublish(g: Group) {
    await fetch(`/api/exams/${g.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !g.isPublished }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this exam group? All schedules will also be removed.")) return;
    const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
    if (!res.ok) { alert((await res.json()).error); return; }
    router.refresh();
  }

  function openEdit(g: Group) {
    setForm({ name: g.name, examType: g.examType ?? "", description: g.description ?? "" });
    setEdit(g); setError(""); setOpen(true);
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500">{groups.length} exam group{groups.length !== 1 ? "s" : ""}</p>
        <div className="flex gap-2 flex-wrap">
          <Link href="/exams/admit-card">
            <Button variant="outline"><CreditCard className="h-4 w-4 mr-1.5" /> Admit Cards</Button>
          </Link>
          <Link href="/exams/components">
            <Button variant="outline"><SlidersHorizontal className="h-4 w-4 mr-1.5" /> CA Setup</Button>
          </Link>
          <Link href="/exams/marksheet">
            <Button variant="outline"><FileText className="h-4 w-4 mr-1.5" /> Marksheets</Button>
          </Link>
          {perm.canAdd && (
            <Link href="/exams/new">
              <Button><Plus className="h-4 w-4 mr-1.5" /> New Exam Group</Button>
            </Link>
          )}
        </div>
      </div>

      {groups.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-gray-400">
          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No exam groups yet. Create one to get started.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{g.name}</h3>
                  {g.examType && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{g.examType.replace(/_/g, " ")}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${g.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {g.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{g._count.schedules} subject schedule{g._count.schedules !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {perm.canEdit && (
                  <Button size="sm" variant="outline" onClick={() => togglePublish(g)} title={g.isPublished ? "Unpublish" : "Publish"}>
                    {g.isPublished ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                  </Button>
                )}
                {perm.canEdit && (
                  <Button size="sm" variant="outline" onClick={() => openEdit(g)}><Pencil className="h-3.5 w-3.5" /></Button>
                )}
                {perm.canDelete && (
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(g.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Link href={`/exams/${g.id}`}>
                  <Button size="sm">
                    Schedules <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Exam Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input value={form.name} onChange={set("name")} placeholder="e.g. Term 1 Exams 2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                value={form.examType} onChange={set("examType")}>
                <option value="">— Select —</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={2} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                value={form.description} onChange={set("description")} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleSave}>{loading ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
