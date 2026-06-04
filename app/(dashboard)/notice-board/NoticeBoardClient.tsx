"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Megaphone, Trash2, Plus } from "lucide-react";

const audienceColor: Record<string, string> = { ALL: "bg-blue-100 text-blue-700", STAFF: "bg-purple-100 text-purple-700", STUDENTS: "bg-green-100 text-green-700", PARENTS: "bg-orange-100 text-orange-700" };

export function NoticeBoardClient({ notices }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", content: "", audience: "ALL" });

  async function post() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setOpen(false); setForm({ title: "", content: "", audience: "ALL" }); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function deleteNotice(id: string) {
    if (!confirm("Delete this notice?")) return;
    await fetch("/api/notices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    router.refresh();
  }

  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{notices.length} notice{notices.length !== 1 ? "s" : ""}</p>
        <Button onClick={() => { setError(""); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Post Notice</Button>
      </div>

      {notices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-gray-500">No notices posted yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {notices.map((notice: any) => (
            <Card key={notice.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-blue-600 shrink-0" />
                    <h3 className="font-semibold text-base">{notice.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${audienceColor[notice.audience]}`}>{notice.audience}</span>
                  </div>
                  <button onClick={() => deleteNotice(notice.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notice.content}</p>
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t">
                  {notice.postedBy.firstName} {notice.postedBy.lastName} · {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post Notice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div>
              <Label>Audience</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                <option value="ALL">Everyone</option>
                <option value="STAFF">Staff only</option>
                <option value="STUDENTS">Students only</option>
                <option value="PARENTS">Parents only</option>
              </select>
            </div>
            <div><Label>Content *</Label><textarea className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={post}>{loading ? "Posting…" : "Post Notice"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
