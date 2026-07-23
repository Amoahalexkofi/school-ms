"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Share2, Plus, Pencil, Trash2 } from "lucide-react";

type Content = {
  id: string;
  sendTo: string | null;
  title: string | null;
  shareDate: string | null;
  validUpto: string | null;
  description: string | null;
};

const empty = { sendTo: "", title: "", shareDate: "", validUpto: "", description: "" };

export function ContentShareClient({ contents }: { contents: Content[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Content | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function openNew() {
    setEditing(null);
    setForm({ ...empty, shareDate: new Date().toISOString().slice(0, 10) });
    setError("");
    setOpen(true);
  }

  function openEdit(c: Content) {
    setEditing(c);
    setForm({
      sendTo: c.sendTo ?? "",
      title: c.title ?? "",
      shareDate: c.shareDate ? c.shareDate.slice(0, 10) : "",
      validUpto: c.validUpto ? c.validUpto.slice(0, 10) : "",
      description: c.description ?? "",
    });
    setError("");
    setOpen(true);
  }

  async function save() {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(editing ? `/api/share-contents/${editing.id}` : "/api/share-contents", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this shared content?")) return;
    await fetch(`/api/share-contents/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const today = new Date();

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{contents.length} item{contents.length !== 1 ? "s" : ""} shared</p>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1.5" /> Share Content</Button>
      </div>

      {contents.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-sm text-gray-400">
          <Share2 className="h-8 w-8 mx-auto mb-3 opacity-40" />
          No content shared yet.
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {contents.map((c) => {
            const expired = c.validUpto ? new Date(c.validUpto) < today : false;
            return (
              <Card key={c.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{c.title || "Untitled"}</p>
                        {c.sendTo && <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">{c.sendTo}</span>}
                        {expired && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Expired</span>}
                      </div>
                      {c.description && <p className="text-sm text-gray-600 mt-1.5 whitespace-pre-wrap">{c.description}</p>}
                      <p className="text-xs text-gray-400 mt-2">
                        {c.shareDate && `Shared ${new Date(c.shareDate).toLocaleDateString()}`}
                        {c.validUpto && ` · Valid until ${new Date(c.validUpto).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-gray-600" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Shared Content" : "Share Content"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 4 Study Notes" />
            </div>
            <div>
              <Label>Send To</Label>
              <Input className="mt-1" value={form.sendTo} onChange={(e) => setForm((f) => ({ ...f, sendTo: e.target.value }))} placeholder="e.g. JHS 2 Gold, All Teachers" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Share Date</Label>
                <Input className="mt-1" type="date" value={form.shareDate} onChange={(e) => setForm((f) => ({ ...f, shareDate: e.target.value }))} />
              </div>
              <div>
                <Label>Valid Until</Label>
                <Input className="mt-1" type="date" value={form.validUpto} onChange={(e) => setForm((f) => ({ ...f, validUpto: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving} onClick={save}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Share"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
