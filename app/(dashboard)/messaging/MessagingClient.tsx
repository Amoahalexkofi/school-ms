"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, MessageSquare, Mail, Phone, Plus } from "lucide-react";

const channelColor: Record<string, string> = { SMS: "bg-emerald-500/10 text-emerald-400", EMAIL: "bg-blue-500/10 text-blue-400", IN_APP: "bg-violet-500/10 text-violet-400" };
const recipientLabel: Record<string, string> = { ALL_PARENTS: "All Parents", ALL_STAFF: "All Staff", ALL_STUDENTS: "All Students", ALL: "Everyone" };

export function MessagingClient({ logs, parentCount, staffCount, studentCount }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ subject: "", message: "", channel: "IN_APP", recipientType: "ALL" });

  const totalSent = logs.reduce((s: number, l: any) => s + l.recipientCount, 0);

  async function send() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/messaging", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setOpen(false); setForm({ subject: "", message: "", channel: "IN_APP", recipientType: "ALL" }); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const recipientCount: Record<string, number> = { ALL_PARENTS: parentCount, ALL_STAFF: staffCount, ALL_STUDENTS: studentCount, ALL: parentCount + staffCount + studentCount };

  return (
    <main className="flex-1 p-6 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-white/40 mb-1">Parents</p><p className="text-3xl font-bold">{parentCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-white/40 mb-1">Staff</p><p className="text-3xl font-bold">{staffCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-white/40 mb-1">Students</p><p className="text-3xl font-bold">{studentCount}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center justify-between w-full">
            <span className="flex items-center gap-2"><Send className="h-4 w-4 text-blue-400" /> Message Log</span>
            <Button size="sm" onClick={() => { setError(""); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Compose</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? <p className="text-sm text-white/40 text-center py-8">No messages sent yet.</p> : (
            <div className="space-y-3">
              {logs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{log.subject}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelColor[log.channel]}`}>{log.channel}</span>
                      </div>
                      <p className="text-sm text-white/50 mb-2">{log.message}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-white/30">
                        <span>To: <span className="text-white/50 font-medium">{recipientLabel[log.recipientType] ?? log.recipientType}</span></span>
                        <span>{log.recipientCount} recipients</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-blue-400">{log.recipientCount}</p>
                      <p className="text-xs text-white/30">sent</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Compose Message</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Channel</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                <option value="IN_APP">In-App Notification</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>
            <div>
              <Label>Recipients</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={form.recipientType} onChange={e => setForm(f => ({ ...f, recipientType: e.target.value }))}>
                <option value="ALL">Everyone ({recipientCount.ALL})</option>
                <option value="ALL_PARENTS">All Parents ({parentCount})</option>
                <option value="ALL_STAFF">All Staff ({staffCount})</option>
                <option value="ALL_STUDENTS">All Students ({studentCount})</option>
              </select>
            </div>
            <div><Label>Subject *</Label><Input className="mt-1" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
            <div><Label>Message *</Label><textarea className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={send}>{loading ? "Sending…" : `Send to ${recipientLabel[form.recipientType]}`}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
