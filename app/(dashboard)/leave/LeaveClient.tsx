"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CheckCircle2, XCircle, Clock, Pencil, Trash2 } from "lucide-react";

type Props = { leaveTypes: any[]; staffRequests: any[]; studentRequests: any[]; staff: any[]; students: any[] };
type Tab = "types" | "staff" | "students";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function LeaveClient({ leaveTypes, staffRequests, studentRequests, staff, students }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("types");

  // Leave type state
  const [typeOpen, setTypeOpen] = useState(false);
  const [typeEdit, setTypeEdit] = useState<any>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDays, setTypeDays] = useState("0");
  const [typeErr,  setTypeErr]  = useState("");
  const [typeLoad, setTypeLoad] = useState(false);

  // Staff request state
  const [staffOpen,    setStaffOpen]    = useState(false);
  const [staffForm,    setStaffForm]    = useState({ staffId: "", leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  const [staffErr,     setStaffErr]     = useState("");
  const [staffLoad,    setStaffLoad]    = useState(false);

  // Student request state
  const [stuOpen,   setStuOpen]   = useState(false);
  const [stuForm,   setStuForm]   = useState({ studentId: "", fromDate: "", toDate: "", reason: "" });
  const [stuErr,    setStuErr]    = useState("");
  const [stuLoad,   setStuLoad]   = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error); return data;
  }
  async function patch(url: string, body: object) {
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json(); if (!res.ok) throw new Error(data.error); return data;
  }
  async function del(url: string) {
    const res = await fetch(url, { method: "DELETE" }); if (!res.ok) throw new Error((await res.json()).error);
  }

  // Type handlers
  async function saveType() {
    if (!typeName.trim()) { setTypeErr("Name required"); return; }
    setTypeLoad(true); setTypeErr("");
    try {
      if (typeEdit) await patch(`/api/leave/types/${typeEdit.id}`, { name: typeName, daysAllowed: parseInt(typeDays) || 0 });
      else          await post("/api/leave/types", { name: typeName, daysAllowed: typeDays });
      setTypeOpen(false); router.refresh();
    } catch (e: any) { setTypeErr(e.message); } finally { setTypeLoad(false); }
  }
  async function deleteType(id: string) {
    if (!confirm("Delete this leave type?")) return;
    try { await del(`/api/leave/types/${id}`); router.refresh(); } catch (e: any) { alert(e.message); }
  }

  // Staff request handlers
  async function submitStaffRequest() {
    if (!staffForm.staffId || !staffForm.leaveTypeId || !staffForm.fromDate || !staffForm.toDate) { setStaffErr("All fields required"); return; }
    setStaffLoad(true); setStaffErr("");
    try { await post("/api/leave/staff", staffForm); setStaffOpen(false); router.refresh(); }
    catch (e: any) { setStaffErr(e.message); } finally { setStaffLoad(false); }
  }
  async function approveStaff(id: string, status: "APPROVED" | "REJECTED") {
    await patch(`/api/leave/staff/${id}`, { status, approvedAt: new Date().toISOString() });
    router.refresh();
  }

  // Student request handlers
  async function submitStudentRequest() {
    if (!stuForm.studentId || !stuForm.fromDate || !stuForm.toDate) { setStuErr("All fields required"); return; }
    setStuLoad(true); setStuErr("");
    try { await post("/api/leave/students", stuForm); setStuOpen(false); router.refresh(); }
    catch (e: any) { setStuErr(e.message); } finally { setStuLoad(false); }
  }
  async function approveStudent(id: string, status: "APPROVED" | "REJECTED") {
    await patch(`/api/leave/students/${id}`, { status, approvedAt: new Date().toISOString() });
    router.refresh();
  }

  const TABS = [
    { key: "types" as Tab,    label: "Leave Types" },
    { key: "staff" as Tab,    label: "Staff Leave" },
    { key: "students" as Tab, label: "Student Leave" },
  ];

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Leave Types ── */}
      {tab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{leaveTypes.length} type{leaveTypes.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setTypeName(""); setTypeDays("0"); setTypeEdit(null); setTypeErr(""); setTypeOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Type
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((lt: any) => (
              <Card key={lt.id}>
                <CardContent className="pt-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{lt.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lt.daysAllowed} days allowed / year</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setTypeName(lt.name); setTypeDays(String(lt.daysAllowed)); setTypeEdit(lt); setTypeErr(""); setTypeOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => deleteType(lt.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Staff Leave ── */}
      {tab === "staff" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{staffRequests.length} request{staffRequests.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setStaffForm({ staffId: "", leaveTypeId: "", fromDate: "", toDate: "", reason: "" }); setStaffErr(""); setStaffOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> New Request
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Staff", "Leave Type", "From", "To", "Days", "Status", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {staffRequests.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No requests yet.</td></tr>
                : staffRequests.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium">{r.staff.firstName} {r.staff.lastName}</div><div className="text-xs text-gray-400 font-mono">{r.staff.employeeId}</div></td>
                    <td className="px-4 py-3 text-gray-600">{r.leaveType.name}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(r.fromDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(r.toDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">{r.leaveDays}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => approveStaff(r.id, "APPROVED")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => approveStaff(r.id, "REJECTED")}><XCircle className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Leave ── */}
      {tab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{studentRequests.length} request{studentRequests.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setStuForm({ studentId: "", fromDate: "", toDate: "", reason: "" }); setStuErr(""); setStuOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> New Request
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Student", "From", "To", "Reason", "Status", ""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {studentRequests.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">No requests yet.</td></tr>
                : studentRequests.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium">{r.student.firstName} {r.student.lastName}</div><div className="text-xs text-gray-400 font-mono">{r.student.admissionNo}</div></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(r.fromDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(r.toDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">{r.reason ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200" onClick={() => approveStudent(r.id, "APPROVED")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => approveStudent(r.id, "REJECTED")}><XCircle className="h-3.5 w-3.5" /></Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Type Dialog */}
      <Dialog open={typeOpen} onOpenChange={o => !o && setTypeOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{typeEdit ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><Input value={typeName} onChange={e => setTypeName(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Days Allowed per Year</label><Input type="number" min="0" value={typeDays} onChange={e => setTypeDays(e.target.value)} /></div>
          </div>
          {typeErr && <p className="text-sm text-red-600">{typeErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setTypeOpen(false)}>Cancel</Button><Button disabled={typeLoad} onClick={saveType}>{typeLoad ? "Saving…" : "Save"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Staff Request Dialog */}
      <Dialog open={staffOpen} onOpenChange={o => !o && setStaffOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Staff Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { label: "Staff *", key: "staffId", options: staff.map((s: any) => ({ value: s.id, label: `${s.firstName} ${s.lastName} (${s.employeeId})` })) },
              { label: "Leave Type *", key: "leaveTypeId", options: leaveTypes.map((lt: any) => ({ value: lt.id, label: lt.name })) },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={(staffForm as any)[key]} onChange={e => setStaffForm(f => ({ ...f, [key]: e.target.value }))}>
                  <option value="">— Select —</option>
                  {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">From *</label><Input type="date" value={staffForm.fromDate} onChange={e => setStaffForm(f => ({ ...f, fromDate: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">To *</label><Input type="date" value={staffForm.toDate} onChange={e => setStaffForm(f => ({ ...f, toDate: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={staffForm.reason} onChange={e => setStaffForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          {staffErr && <p className="text-sm text-red-600">{staffErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setStaffOpen(false)}>Cancel</Button><Button disabled={staffLoad} onClick={submitStaffRequest}>{staffLoad ? "Submitting…" : "Submit"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Student Request Dialog */}
      <Dialog open={stuOpen} onOpenChange={o => !o && setStuOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Student Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={stuForm.studentId} onChange={e => setStuForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">— Select —</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">From *</label><Input type="date" value={stuForm.fromDate} onChange={e => setStuForm(f => ({ ...f, fromDate: e.target.value }))} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">To *</label><Input type="date" value={stuForm.toDate} onChange={e => setStuForm(f => ({ ...f, toDate: e.target.value }))} /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Reason</label><textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" value={stuForm.reason} onChange={e => setStuForm(f => ({ ...f, reason: e.target.value }))} /></div>
          </div>
          {stuErr && <p className="text-sm text-red-600">{stuErr}</p>}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setStuOpen(false)}>Cancel</Button><Button disabled={stuLoad} onClick={submitStudentRequest}>{stuLoad ? "Submitting…" : "Submit"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
