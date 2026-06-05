"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, GraduationCap, BookOpen, Layers, School, Users, Plus, X } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

type Props = {
  sessions: any[]; classes: any[]; subjects: any[]; profile: any; staff: any[];
};

function useForm<T extends Record<string, string>>(initial: T) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
  const reset = () => setForm(initial);
  return { form, set, reset, setForm };
}

async function postData(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
  return res.json();
}

export function SettingsClient({ sessions, classes, subjects, profile, staff }: Props) {
  const router = useRouter();
  const [addingType, setAddingType] = useState<"session" | "class" | "section" | "subject" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sessionForm = useForm({ name: "", startDate: "", endDate: "", setActive: "true" });
  const classForm = useForm({ name: "", sessionId: sessions[0]?.id ?? "" });
  const sectionForm = useForm({ name: "", classId: classes[0]?.id ?? "" });
  const subjectForm = useForm({ name: "", code: "", classId: classes[0]?.id ?? "" });

  function openPanel(type: "session" | "class" | "section" | "subject") {
    setError("");
    setAddingType(type);
  }

  function closePanel() {
    setAddingType(null);
    setError("");
    sessionForm.reset();
    classForm.reset();
    sectionForm.reset();
    subjectForm.reset();
  }

  async function submit(url: string, body: object) {
    setLoading(true); setError("");
    try { await postData(url, body); closePanel(); router.refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  const activeSession = sessions.find((s: any) => s.isActive);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Settings" />
      <main className="flex-1 p-6 space-y-8">

        {/* Academic Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-600" /> Academic Sessions
            </CardTitle>
            <Button size="sm" onClick={() => openPanel("session")}>
              <Plus className="h-4 w-4 mr-1" /> New Session
            </Button>
          </CardHeader>
          <CardContent>
            {/* Inline Add Session Panel */}
            {addingType === "session" && (
              <div className="mb-4 border border-blue-200 rounded-lg bg-blue-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-blue-800">Add Session</h3>
                  <button type="button" onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1 block">Name *</Label>
                    <Input placeholder="e.g. 2025/2026" value={sessionForm.form.name} onChange={sessionForm.set("name")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Start Date *</Label>
                      <Input type="date" value={sessionForm.form.startDate} onChange={sessionForm.set("startDate")} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">End Date *</Label>
                      <Input type="date" value={sessionForm.form.endDate} onChange={sessionForm.set("endDate")} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sessionForm.form.setActive === "true"}
                      onChange={e => sessionForm.set("setActive")({ target: { value: String(e.target.checked) } } as any)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Set as active session
                  </label>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={closePanel}>Cancel</Button>
                    <Button size="sm" disabled={loading} onClick={() => submit("/api/sessions", { ...sessionForm.form, setActive: sessionForm.form.setActive === "true" })}>
                      {loading ? "Creating…" : "Create Session"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No sessions yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Start</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">End</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                </tr></thead>
                <tbody className="divide-y">
                  {sessions.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium">{s.name}</td>
                      <td className="px-3 py-2.5 text-gray-500">{new Date(s.startDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5 text-gray-500">{new Date(s.endDate).toLocaleDateString()}</td>
                      <td className="px-3 py-2.5">
                        {s.isActive
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Classes & Sections */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600" /> Classes & Sections
              {activeSession && <span className="text-xs text-gray-400 font-normal">({activeSession.name})</span>}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openPanel("section")}>
                <Plus className="h-4 w-4 mr-1" /> Section
              </Button>
              <Button size="sm" onClick={() => openPanel("class")}>
                <Plus className="h-4 w-4 mr-1" /> Class
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Inline Add Class Panel */}
            {addingType === "class" && (
              <div className="mb-4 border border-purple-200 rounded-lg bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-purple-800">Add Class</h3>
                  <button type="button" onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1 block">Class Name *</Label>
                    <Input placeholder="e.g. Grade 7" value={classForm.form.name} onChange={classForm.set("name")} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Session *</Label>
                    <select className={SEL} value={classForm.form.sessionId} onChange={classForm.set("sessionId")}>
                      {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={closePanel}>Cancel</Button>
                    <Button size="sm" disabled={loading} onClick={() => submit("/api/classes", classForm.form)}>
                      {loading ? "Creating…" : "Create Class"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Add Section Panel */}
            {addingType === "section" && (
              <div className="mb-4 border border-purple-200 rounded-lg bg-purple-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-purple-800">Add Section</h3>
                  <button type="button" onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1 block">Section Name *</Label>
                    <Input placeholder="e.g. A" value={sectionForm.form.name} onChange={sectionForm.set("name")} />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Class *</Label>
                    <select className={SEL} value={sectionForm.form.classId} onChange={sectionForm.set("classId")}>
                      {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.session.name})</option>)}
                    </select>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={closePanel}>Cancel</Button>
                    <Button size="sm" disabled={loading} onClick={() => submit("/api/sections", sectionForm.form)}>
                      {loading ? "Creating…" : "Create Section"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {classes.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No classes yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.map((cls: any) => (
                  <div key={cls.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{cls.name}</p>
                        <p className="text-xs text-gray-500">{cls.session.name} · {cls._count.subjects} subjects</p>
                      </div>
                      <span className="text-xs text-gray-500">{cls.sections.length} section{cls.sections.length !== 1 ? "s" : ""}</span>
                    </div>
                    {cls.sections.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cls.sections.map((sec: any) => (
                          <span key={sec.id} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                            <Layers className="h-3 w-3 inline mr-1" />{sec.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" /> Subjects
            </CardTitle>
            <Button size="sm" onClick={() => openPanel("subject")}>
              <Plus className="h-4 w-4 mr-1" /> Subject
            </Button>
          </CardHeader>
          <CardContent>
            {/* Inline Add Subject Panel */}
            {addingType === "subject" && (
              <div className="mb-4 border border-green-200 rounded-lg bg-green-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm text-green-800">Add Subject</h3>
                  <button type="button" onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Name *</Label>
                      <Input placeholder="e.g. Mathematics" value={subjectForm.form.name} onChange={subjectForm.set("name")} />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Code *</Label>
                      <Input placeholder="e.g. MATH" value={subjectForm.form.code} onChange={subjectForm.set("code")} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Class *</Label>
                    <select className={SEL} value={subjectForm.form.classId} onChange={subjectForm.set("classId")}>
                      {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.session.name})</option>)}
                    </select>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={closePanel}>Cancel</Button>
                    <Button size="sm" disabled={loading} onClick={() => submit("/api/subjects", subjectForm.form)}>
                      {loading ? "Creating…" : "Create Subject"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No subjects yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Code</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Class</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Session</th>
                </tr></thead>
                <tbody className="divide-y">
                  {subjects.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium">{sub.name}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-gray-500">{sub.code}</td>
                      <td className="px-3 py-2.5 text-gray-600">{sub.class.name}</td>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{sub.class.session.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* School Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <School className="h-4 w-4 text-orange-600" /> School Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!profile ? (
              <p className="text-sm text-gray-500 text-center py-6">No profile set. Use <code className="bg-gray-100 px-1 rounded">POST /api/school-profile</code> to configure.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-gray-500">Name</p><p className="font-medium">{(profile as any).name}</p></div>
                {(profile as any).address && <div><p className="text-xs text-gray-500">Address</p><p>{(profile as any).address}</p></div>}
                {(profile as any).phone && <div><p className="text-xs text-gray-500">Phone</p><p>{(profile as any).phone}</p></div>}
                {(profile as any).email && <div><p className="text-xs text-gray-500">Email</p><p>{(profile as any).email}</p></div>}
                {(profile as any).motto && <div className="col-span-2"><p className="text-xs text-gray-500">Motto</p><p className="italic">{(profile as any).motto}</p></div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Salary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" /> Staff Salary Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No staff added yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Staff</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Designation</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Basic</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Allowances</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Deductions</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Net</th>
                </tr></thead>
                <tbody className="divide-y">
                  {staff.map((s: any) => {
                    const basic = Number(s.basicSalary ?? 0);
                    const allow = Number(s.allowances ?? 0);
                    const deduct = Number(s.deductions ?? 0);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{s.firstName} {s.lastName}</td>
                        <td className="px-3 py-2.5 text-gray-500">{s.designation ?? "—"}</td>
                        <td className="px-3 py-2.5 text-right">{basic > 0 ? `₵${basic.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right text-green-600">{allow > 0 ? `+₵${allow.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right text-red-600">{deduct > 0 ? `-₵${deduct.toLocaleString()}` : "—"}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">₵{(basic + allow - deduct).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
