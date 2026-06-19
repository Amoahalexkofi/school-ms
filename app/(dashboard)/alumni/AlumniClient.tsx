"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Pencil, Trash2, GraduationCap, Calendar, X, User, Send, Mail } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type AlumniRecord = {
  id: string;
  studentId: string;
  currentEmail?: string;
  currentPhone?: string;
  occupation?: string;
  address?: string;
  createdAt: string;
  student: {
    id: string; firstName: string; lastName: string; admissionNo: string;
    gender?: string;
    sessions: { session: { id: string; session: string }; classSection: { class: { name: string }; section: { name: string } } }[];
  };
};

const emptyForm = { studentId: "", currentEmail: "", currentPhone: "", occupation: "", address: "", note: "" };
const emptyMail = { subject: "", message: "", channel: "IN_APP" };

export function AlumniClient({ alumni: initial, sessions, classes, students }: {
  alumni: AlumniRecord[];
  sessions: { id: string; session: string }[];
  classes: { id: string; name: string }[];
  students: any[];
}) {
  const perm = usePermission("alumni");
  const router = useRouter();
  const [alumni, setAlumni] = useState<AlumniRecord[]>(initial);
  const [search, setSearch] = useState("");
  const [filterSession, setFilterSession] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showMail, setShowMail] = useState(false);
  const [editing, setEditing] = useState<AlumniRecord | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [mail, setMail] = useState<any>(emptyMail);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const filtered = useMemo(() => {
    return alumni.filter((a) => {
      const name = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase()) || a.student.admissionNo.toLowerCase().includes(search.toLowerCase());
      const sess = a.student.sessions?.[0];
      const matchSession = !filterSession || sess?.session?.id === filterSession;
      const matchClass = !filterClass || sess?.classSection?.class?.name === classes.find(c => c.id === filterClass)?.name;
      return matchSearch && matchSession && matchClass;
    });
  }, [alumni, search, filterSession, filterClass, classes]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setShowMail(false);
  }

  function openEdit(a: AlumniRecord) {
    setEditing(a);
    setForm({ studentId: a.studentId, currentEmail: a.currentEmail ?? "", currentPhone: a.currentPhone ?? "", occupation: a.occupation ?? "", address: a.address ?? "", note: "" });
    setShowForm(true);
    setShowMail(false);
  }

  function openMail() {
    setShowMail(true);
    setShowForm(false);
    setMail(emptyMail);
  }

  function set(k: string, v: string) { setForm((f: any) => ({ ...f, [k]: v })); }
  function setM(k: string, v: string) { setMail((m: any) => ({ ...m, [k]: v })); }

  async function save() {
    if (!form.studentId) return alert("Select a student");
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/alumni/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentEmail: form.currentEmail, currentPhone: form.currentPhone, occupation: form.occupation, address: form.address }),
        });
        if (!res.ok) throw new Error();
        router.refresh();
      } else {
        const res = await fetch("/api/alumni", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        router.refresh();
      }
      setShowForm(false);
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  async function sendMail() {
    if (!mail.subject.trim()) return alert("Subject is required");
    if (!mail.message.trim()) return alert("Message is required");
    setSending(true);
    try {
      const res = await fetch("/api/alumni/mail", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: mail.subject,
          message: mail.message,
          channel: mail.channel,
          sessionId: filterSession || null,
          classId: filterClass || null,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      alert(`Message sent to ${data.recipientCount} alumni.`);
      setShowMail(false);
    } catch { alert("Failed to send message"); }
    finally { setSending(false); }
  }

  async function del(id: string) {
    if (!confirm("Remove this alumni record? The student will no longer be marked as alumni.")) return;
    await fetch(`/api/alumni/${id}`, { method: "DELETE" });
    setAlumni((as) => as.filter((a) => a.id !== id));
  }

  const mailLabel = filterSession || filterClass
    ? `${classes.find(c => c.id === filterClass)?.name ?? ""}${filterClass && filterSession ? " · " : ""}${sessions.find(s => s.id === filterSession)?.session ?? ""}`.trim().replace(/^·\s*|·\s*$/, "").trim()
    : "All Alumni";

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Alumni</p><p className="text-3xl font-bold">{alumni.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">This Year</p><p className="text-3xl font-bold">{alumni.filter(a => new Date(a.createdAt).getFullYear() === new Date().getFullYear()).length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Male</p><p className="text-3xl font-bold">{alumni.filter(a => a.student.gender === "Male").length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Female</p><p className="text-3xl font-bold">{alumni.filter(a => a.student.gender === "Female").length}</p></CardContent></Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input placeholder="Search by name or admission no…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-56" />
          </div>
          <div>
            <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Pass-out Session</Label>
            <select className={SEL + " w-44"} value={filterSession} onChange={(e) => setFilterSession(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.session}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-[13px] font-semibold text-slate-700 mb-1.5 block">Class</Label>
            <select className={SEL + " w-36"} value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
              <option value="">All Classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openMail}>
            <Mail className="h-4 w-4 mr-1" /> Mail Alumni
            {(filterSession || filterClass) && <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">{mailLabel}</span>}
          </Button>
          <Link href="/alumni/events">
            <Button variant="outline"><Calendar className="h-4 w-4 mr-1" /> Events</Button>
          </Link>
          {perm.canAdd && <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Alumni</Button>}
        </div>
      </div>

      {/* Mail Alumni compose panel */}
      {showMail && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-indigo-800 flex items-center gap-2">
                <Send className="h-4 w-4" />
                Mail Alumni
                <span className="font-normal text-indigo-500">— {mailLabel} ({filtered.length} recipients)</span>
              </CardTitle>
              <button onClick={() => setShowMail(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Subject *</Label>
              <Input value={mail.subject} onChange={e => setM("subject", e.target.value)} placeholder="e.g. Annual Alumni Meet Invitation" />
            </div>
            <div className="md:col-span-2">
              <Label>Message *</Label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                value={mail.message}
                onChange={e => setM("message", e.target.value)}
                placeholder="Write your message to the alumni…"
              />
            </div>
            <div>
              <Label>Channel</Label>
              <select className={SEL} value={mail.channel} onChange={e => setM("channel", e.target.value)}>
                <option value="IN_APP">In-App Notification</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={sendMail} disabled={sending} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-3.5 w-3.5 mr-1" />
                {sending ? "Sending…" : `Send to ${filtered.length} Alumni`}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowMail(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-800">{editing ? "Edit Alumni Record" : "Add Alumni"}</CardTitle>
              <button onClick={() => setShowForm(false)}><X className="h-4 w-4 text-gray-400" /></button>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editing && (
              <div className="md:col-span-2">
                <Label>Student *</Label>
                <select className={SEL} value={form.studentId} onChange={(e) => set("studentId", e.target.value)}>
                  <option value="">Select a student to mark as alumni</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) — {s.sessions?.[0]?.classSection?.class?.name ?? "No class"} · {s.sessions?.[0]?.session?.session ?? ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Shows inactive students eligible to be promoted to alumni</p>
              </div>
            )}
            <div>
              <Label>Current Email</Label>
              <Input type="email" value={form.currentEmail} onChange={(e) => set("currentEmail", e.target.value)} placeholder="current@email.com" />
            </div>
            <div>
              <Label>Current Phone</Label>
              <Input value={form.currentPhone} onChange={(e) => set("currentPhone", e.target.value)} placeholder="+233 XX XXX XXXX" />
            </div>
            <div>
              <Label>Occupation</Label>
              <Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} placeholder="e.g. Software Engineer, Doctor" />
            </div>
            <div>
              <Label>Current Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Current city / address" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              {(editing ? perm.canEdit : perm.canAdd) && (
                <Button onClick={save} disabled={saving} size="sm">{saving ? "Saving…" : editing ? "Update" : "Add Alumni"}</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alumni table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-lg">
          <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No alumni records yet</p>
          <p className="text-sm mt-1">Click "Add Alumni" to mark a student as an alumnus</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Admission No</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Session</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Gender</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Current Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Current Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Occupation</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((a, i) => {
                    const sess = a.student.sessions?.[0];
                    return (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs">{a.student.admissionNo}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                              <User className="h-3.5 w-3.5 text-indigo-600" />
                            </div>
                            <Link href={`/alumni/${a.id}`} className="font-medium text-blue-600 hover:underline">
                              {a.student.firstName} {a.student.lastName}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{sess?.classSection?.class?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{sess?.session?.session ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{a.student.gender ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{a.currentEmail || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{a.currentPhone || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{a.occupation || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-1 justify-end">
                            {perm.canEdit && <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>}
                            {perm.canDelete && <Button size="sm" variant="ghost" onClick={() => del(a.id)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
