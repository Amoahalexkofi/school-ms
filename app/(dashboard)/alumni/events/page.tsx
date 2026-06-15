"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Plus, Pencil, Trash2, Calendar, X, Globe,
} from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

type AlumniEvent = {
  id: string;
  title: string;
  eventFor: string;
  fromDate: string;
  toDate: string;
  note?: string;
  showOnWebsite: boolean;
  isActive: boolean;
  session?: { id: string; session: string };
  class?: { id: string; name: string };
};

const emptyForm = {
  title: "", eventFor: "all", sessionId: "", classId: "", section: "",
  fromDate: "", toDate: "", note: "", showOnWebsite: false,
  eventNotificationMessage: "",
};

export default function AlumniEventsPage() {
  const [events, setEvents] = useState<AlumniEvent[]>([]);
  const [sessions, setSessions] = useState<{ id: string; session: string }[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AlumniEvent | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/alumni/events").then(r => r.json()).then(setEvents);
    fetch("/api/sessions").then(r => r.json()).then(setSessions).catch(() => {});
    fetch("/api/classes").then(r => r.json()).then(setClasses).catch(() => {});
  }, []);

  function set(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(e: AlumniEvent) {
    setEditing(e);
    setForm({
      title: e.title, eventFor: e.eventFor,
      sessionId: e.session?.id ?? "", classId: e.class?.id ?? "", section: "",
      fromDate: e.fromDate.slice(0, 10), toDate: e.toDate.slice(0, 10),
      note: e.note ?? "", showOnWebsite: e.showOnWebsite, eventNotificationMessage: "",
    });
    setShowForm(true);
  }

  async function save() {
    if (!form.title || !form.fromDate || !form.toDate) return alert("Title and dates are required");
    setSaving(true);
    try {
      const payload = {
        title: form.title, eventFor: form.eventFor,
        sessionId: form.sessionId || null, classId: form.classId || null,
        section: form.section || null,
        fromDate: new Date(form.fromDate).toISOString(),
        toDate: new Date(form.toDate).toISOString(),
        note: form.note || null,
        showOnWebsite: form.showOnWebsite,
        eventNotificationMessage: form.eventNotificationMessage || null,
      };
      if (editing) {
        await fetch(`/api/alumni/events/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/alumni/events", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const updated = await fetch("/api/alumni/events").then(r => r.json());
      setEvents(updated);
      setShowForm(false);
    } catch { alert("Failed to save event"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/alumni/events/${id}`, { method: "DELETE" });
    setEvents(ev => ev.filter(e => e.id !== id));
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Alumni Events" />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/alumni" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Alumni
          </Link>
          <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Event</Button>
        </div>

        {showForm && (
          <Card className="border-blue-500/20 bg-blue-500/10/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-blue-300">{editing ? "Edit Event" : "Add Alumni Event"}</CardTitle>
                <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-white/30" /></button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Event Title *</Label>
                <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Annual Alumni Meet 2025" />
              </div>
              <div>
                <Label>Event For</Label>
                <select className={SEL} value={form.eventFor} onChange={e => set("eventFor", e.target.value)}>
                  <option value="all">All Alumni</option>
                  <option value="class">Specific Class (Pass-out)</option>
                </select>
              </div>
              {form.eventFor === "class" && (
                <>
                  <div>
                    <Label>Session</Label>
                    <select className={SEL} value={form.sessionId} onChange={e => set("sessionId", e.target.value)}>
                      <option value="">All Sessions</option>
                      {sessions.map(s => <option key={s.id} value={s.id}>{s.session}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Class</Label>
                    <select className={SEL} value={form.classId} onChange={e => set("classId", e.target.value)}>
                      <option value="">All Classes</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </>
              )}
              <div>
                <Label>From Date *</Label>
                <Input type="date" value={form.fromDate} onChange={e => set("fromDate", e.target.value)} />
              </div>
              <div>
                <Label>To Date *</Label>
                <Input type="date" value={form.toDate} onChange={e => set("toDate", e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label>Event Note / Description</Label>
                <textarea
                  className="w-full rounded-lg border border-white/[0.08] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={form.note}
                  onChange={e => set("note", e.target.value)}
                  placeholder="Details about the event…"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Notification Message</Label>
                <Input value={form.eventNotificationMessage} onChange={e => set("eventNotificationMessage", e.target.value)} placeholder="Optional message to send to alumni" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showOnWebsite"
                  checked={form.showOnWebsite}
                  onChange={e => set("showOnWebsite", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="showOnWebsite">Show on Website</Label>
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button onClick={save} disabled={saving} size="sm">{saving ? "Saving…" : editing ? "Update Event" : "Add Event"}</Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16 text-white/30 border-2 border-dashed rounded-lg">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No alumni events yet</p>
            <p className="text-sm mt-1">Click "Add Event" to schedule a reunion or gathering</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#0f1015] border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-white/50">#</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">From</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">To</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">For</th>
                      <th className="text-left px-4 py-3 font-medium text-white/50">Website</th>
                      <th className="text-right px-4 py-3 font-medium text-white/50">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {events.map((e, i) => (
                      <tr key={e.id} className="hover:bg-[#0f1015]">
                        <td className="px-4 py-3 text-white/30">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{e.title}</td>
                        <td className="px-4 py-3 text-white/50">{new Date(e.fromDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-white/50">{new Date(e.toDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {e.eventFor === "all"
                            ? <Badge variant="secondary">All Alumni</Badge>
                            : <Badge variant="outline">{e.class?.name ?? "Class"} · {e.session?.session ?? ""}</Badge>
                          }
                        </td>
                        <td className="px-4 py-3">
                          {e.showOnWebsite
                            ? <Globe className="h-4 w-4 text-green-500" />
                            : <span className="text-white/30 text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => del(e.id)} className="text-red-400 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
