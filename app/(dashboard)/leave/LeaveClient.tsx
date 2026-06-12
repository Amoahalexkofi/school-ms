"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, CheckCircle2, XCircle, Pencil, Trash2, Calendar, Clock } from "lucide-react";

type Props = {
  leaveTypes: any[]; staffRequests: any[]; studentRequests: any[];
  staff: any[]; students: any[]; leaveBalances: any[];
  isAdmin: boolean; myStaffId: string | null;
};
type Tab = "types" | "staff" | "students" | "balance";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

export function LeaveClient({ leaveTypes, staffRequests, studentRequests, staff, students, leaveBalances, isAdmin, myStaffId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(isAdmin ? "types" : "staff");

  // Leave type panel
  const [typePanel, setTypePanel] = useState(false);
  const [typeEdit,  setTypeEdit]  = useState<any>(null);
  const [typeName,  setTypeName]  = useState("");
  const [typeDays,  setTypeDays]  = useState("0");
  const [typeErr,   setTypeErr]   = useState("");
  const [typeLoad,  setTypeLoad]  = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Apply form (self-apply for staff)
  const [applyOpen, setApplyOpen]   = useState(false);
  const [applyForm, setApplyForm]   = useState({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  const [applyErr,  setApplyErr]    = useState("");
  const [applyLoad, setApplyLoad]   = useState(false);

  // Admin apply form (pick any staff/student)
  const [adminApplyOpen, setAdminApplyOpen] = useState(false);
  const [adminApplyType, setAdminApplyType] = useState<"staff" | "student">("staff");
  const [adminForm, setAdminForm] = useState({ staffId: "", studentId: "", leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  const [adminErr,  setAdminErr]  = useState("");
  const [adminLoad, setAdminLoad] = useState(false);

  // Approve with remark dialog
  const [remarkOpen,   setRemarkOpen]   = useState(false);
  const [remarkTarget, setRemarkTarget] = useState<{ id: string; type: "staff" | "student"; newStatus: "APPROVED" | "REJECTED" } | null>(null);
  const [remark,       setRemark]       = useState("");
  const [remarkLoad,   setRemarkLoad]   = useState(false);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  async function apiPost(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error ?? "Error"); return d;
  }
  async function apiPatch(url: string, body: object) {
    const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error ?? "Error"); return d;
  }
  async function apiDel(url: string) {
    const res = await fetch(url, { method: "DELETE" }); if (!res.ok) throw new Error("Delete failed");
  }

  function calcDays(from: string, to: string) {
    if (!from || !to) return 0;
    return Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1);
  }

  // Balance lookup for self-apply
  function getBalance(leaveTypeId: string) {
    const lt = leaveTypes.find((l: any) => l.id === leaveTypeId);
    const bal = leaveBalances.find((b: any) => b.leaveType.id === leaveTypeId);
    if (!lt) return null;
    const total   = bal?.totalDays ?? lt.daysAllowed ?? 0;
    const used    = bal?.usedDays  ?? 0;
    return { total, used, available: total - used };
  }

  // ── Leave type CRUD ──────────────────────────────────────────────────────────
  async function saveType() {
    if (!typeName.trim()) { setTypeErr("Name required"); return; }
    setTypeLoad(true); setTypeErr("");
    try {
      if (typeEdit) await apiPatch(`/api/leave/types/${typeEdit.id}`, { name: typeName, daysAllowed: parseInt(typeDays) || 0 });
      else          await apiPost("/api/leave/types", { name: typeName, daysAllowed: parseInt(typeDays) || 0 });
      setTypePanel(false); setTypeEdit(null); router.refresh();
    } catch (e: any) { setTypeErr(e.message); } finally { setTypeLoad(false); }
  }
  async function deleteType(id: string) {
    if (!confirm("Delete this leave type?")) return;
    try { await apiDel(`/api/leave/types/${id}`); router.refresh(); } catch (e: any) { alert(e.message); }
  }

  // ── Self-apply (staff/teacher) ───────────────────────────────────────────────
  async function submitSelfApply() {
    if (!applyForm.leaveTypeId || !applyForm.fromDate || !applyForm.toDate) {
      setApplyErr("Leave type and dates are required"); return;
    }
    if (!myStaffId) { setApplyErr("Staff record not found. Contact admin."); return; }
    const bal = getBalance(applyForm.leaveTypeId);
    const days = calcDays(applyForm.fromDate, applyForm.toDate);
    if (bal && days > bal.available) {
      setApplyErr(`Only ${bal.available} day(s) available for this leave type`); return;
    }
    setApplyLoad(true); setApplyErr("");
    try {
      await apiPost("/api/leave/staff", { staffId: myStaffId, leaveTypeId: applyForm.leaveTypeId, fromDate: applyForm.fromDate, toDate: applyForm.toDate, reason: applyForm.reason });
      setApplyOpen(false); setApplyForm({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
      router.refresh();
    } catch (e: any) { setApplyErr(e.message); } finally { setApplyLoad(false); }
  }

  // ── Admin apply ──────────────────────────────────────────────────────────────
  async function submitAdminApply() {
    const isStaff = adminApplyType === "staff";
    if (!adminForm.leaveTypeId || !adminForm.fromDate || !adminForm.toDate) {
      setAdminErr("Leave type and dates required"); return;
    }
    if (isStaff && !adminForm.staffId) { setAdminErr("Select a staff member"); return; }
    if (!isStaff && !adminForm.studentId) { setAdminErr("Select a student"); return; }
    setAdminLoad(true); setAdminErr("");
    try {
      const url  = isStaff ? "/api/leave/staff" : "/api/leave/students";
      const body = isStaff
        ? { staffId: adminForm.staffId, leaveTypeId: adminForm.leaveTypeId, fromDate: adminForm.fromDate, toDate: adminForm.toDate, reason: adminForm.reason }
        : { studentId: adminForm.studentId, fromDate: adminForm.fromDate, toDate: adminForm.toDate, reason: adminForm.reason };
      await apiPost(url, body);
      setAdminApplyOpen(false);
      setAdminForm({ staffId: "", studentId: "", leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
      router.refresh();
    } catch (e: any) { setAdminErr(e.message); } finally { setAdminLoad(false); }
  }

  // ── Approve / reject with remark ─────────────────────────────────────────────
  function openRemark(id: string, type: "staff" | "student", newStatus: "APPROVED" | "REJECTED") {
    setRemarkTarget({ id, type, newStatus }); setRemark(""); setRemarkOpen(true);
  }
  async function confirmRemark() {
    if (!remarkTarget) return;
    setRemarkLoad(true);
    try {
      const url = remarkTarget.type === "staff" ? `/api/leave/staff/${remarkTarget.id}` : `/api/leave/students/${remarkTarget.id}`;
      await apiPatch(url, { status: remarkTarget.newStatus, approvedAt: new Date().toISOString(), remark });
      setRemarkOpen(false); router.refresh();
    } catch (e: any) { alert(e.message); } finally { setRemarkLoad(false); }
  }

  // ── Filtered requests ─────────────────────────────────────────────────────────
  const filteredStaff    = statusFilter === "ALL" ? staffRequests    : staffRequests.filter((r: any) => r.status === statusFilter);
  const filteredStudents = statusFilter === "ALL" ? studentRequests  : studentRequests.filter((r: any) => r.status === statusFilter);

  const tabs = isAdmin
    ? [
        { key: "types"    as Tab, label: "Leave Types" },
        { key: "staff"    as Tab, label: "Staff Leave" },
        { key: "students" as Tab, label: "Student Leave" },
        { key: "balance"  as Tab, label: "Leave Balance" },
      ]
    : [
        { key: "staff"   as Tab, label: "My Requests" },
        { key: "balance" as Tab, label: "My Balance" },
      ];

  // ── Balance bar helper ────────────────────────────────────────────────────────
  function BalanceBar({ total, used }: { total: number; used: number }) {
    const avail = total - used;
    const pct   = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
    return (
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div className={`h-2 rounded-full ${pct > 80 ? "bg-rose-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-sm font-bold tabular-nums ${avail <= 0 ? "text-rose-600" : avail <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
          {avail} left
        </span>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">

      {/* Tab bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Status filter — only on request tabs */}
        {(tab === "staff" || tab === "students") && (
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1">
            {["ALL","PENDING","APPROVED","REJECTED"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-gray-800 text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Leave Types (admin only) ─────────────────────────────────────────── */}
      {tab === "types" && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{leaveTypes.length} type{leaveTypes.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setTypeName(""); setTypeDays("0"); setTypeEdit(null); setTypeErr(""); setTypePanel(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Type
            </Button>
          </div>

          {typePanel && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 space-y-3">
              <p className="font-medium text-gray-800 text-sm">{typeEdit ? "Edit" : "New"} Leave Type</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Annual Leave" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Days Allowed / Year</label>
                  <Input type="number" min="0" value={typeDays} onChange={e => setTypeDays(e.target.value)} />
                </div>
              </div>
              {typeErr && <p className="text-sm text-red-600">{typeErr}</p>}
              <div className="flex gap-2">
                <Button disabled={typeLoad} onClick={saveType}>{typeLoad ? "Saving…" : "Save"}</Button>
                <Button variant="outline" onClick={() => { setTypePanel(false); setTypeEdit(null); }}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveTypes.map((lt: any) => (
              <Card key={lt.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{lt.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lt.daysAllowed} days / year</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => { setTypeName(lt.name); setTypeDays(String(lt.daysAllowed)); setTypeEdit(lt); setTypeErr(""); setTypePanel(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => deleteType(lt.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {leaveTypes.length === 0 && <p className="text-sm text-gray-400 col-span-3 py-6 text-center">No leave types yet. Add one above.</p>}
          </div>
        </div>
      )}

      {/* ── Staff / My Leave requests ────────────────────────────────────────── */}
      {tab === "staff" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{filteredStaff.length} request{filteredStaff.length !== 1 ? "s" : ""}</p>
            {isAdmin ? (
              <Button onClick={() => { setAdminApplyType("staff"); setAdminForm({ staffId:"", studentId:"", leaveTypeId:"", fromDate:"", toDate:"", reason:"" }); setAdminErr(""); setAdminApplyOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" /> New Request
              </Button>
            ) : (
              <Button onClick={() => { setApplyForm({ leaveTypeId:"", fromDate:"", toDate:"", reason:"" }); setApplyErr(""); setApplyOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" /> Apply for Leave
              </Button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {(isAdmin ? ["Staff","Dept","Leave Type","Dates","Days","Status","Remark",""] : ["Leave Type","Dates","Days","Status","Remark"])
                    .map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStaff.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">No requests found.</td></tr>
                ) : filteredStaff.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.staff.firstName} {r.staff.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono">{r.staff.employeeId}</p>
                      </td>
                    )}
                    {isAdmin && <td className="px-4 py-3 text-xs text-gray-500">{r.staff.department?.name ?? "—"}</td>}
                    <td className="px-4 py-3 text-gray-700 font-medium">{r.leaveType.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(r.fromDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" })}</div>
                      <div className="text-gray-400 ml-4">→ {new Date(r.toDate).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{r.leaveDays}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{r.remark ?? r.reason ?? "—"}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {r.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button title="Approve" onClick={() => openRemark(r.id, "staff", "APPROVED")} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                            <button title="Reject"  onClick={() => openRemark(r.id, "staff", "REJECTED")} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"><XCircle className="h-4 w-4" /></button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Student Leave (admin only) ───────────────────────────────────────── */}
      {tab === "students" && isAdmin && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">{filteredStudents.length} request{filteredStudents.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setAdminApplyType("student"); setAdminForm({ staffId:"", studentId:"", leaveTypeId:"", fromDate:"", toDate:"", reason:"" }); setAdminErr(""); setAdminApplyOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> New Request
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Student","Dates","Days","Reason","Status",""].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">No requests found.</td></tr>
                ) : filteredStudents.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.student.firstName} {r.student.lastName}</p>
                      <p className="text-xs text-gray-400 font-mono">{r.student.admissionNo}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(r.fromDate).toLocaleDateString("en-GB", { day:"numeric", month:"short" })} → {new Date(r.toDate).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{r.leaveDays ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.reason ?? "—"}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-bold ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                    <td className="px-4 py-3">
                      {r.status === "PENDING" && (
                        <div className="flex gap-1">
                          <button onClick={() => openRemark(r.id, "student", "APPROVED")} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle2 className="h-4 w-4" /></button>
                          <button onClick={() => openRemark(r.id, "student", "REJECTED")} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"><XCircle className="h-4 w-4" /></button>
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

      {/* ── Leave Balance ────────────────────────────────────────────────────── */}
      {tab === "balance" && (
        <div className="space-y-4">
          {leaveBalances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Clock className="h-8 w-8 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No leave balances yet. They are created when leave is approved.</p>
            </div>
          ) : isAdmin ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{["Staff","Leave Type","Allocated","Used","Available / Balance"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaveBalances.map((b: any) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{b.staff.firstName} {b.staff.lastName}</p>
                        <p className="text-xs text-gray-400 font-mono">{b.staff.employeeId}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{b.leaveType.name}</td>
                      <td className="px-4 py-3 text-center">{b.totalDays}</td>
                      <td className="px-4 py-3 text-center text-amber-600 font-medium">{b.usedDays}</td>
                      <td className="px-4 py-3 pr-6"><BalanceBar total={b.totalDays} used={b.usedDays} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Teacher — card view of their own balance */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveTypes.map((lt: any) => {
                const bal = getBalance(lt.id);
                if (!bal) return null;
                const pct = bal.total > 0 ? Math.min(100, Math.round((bal.used / bal.total) * 100)) : 0;
                return (
                  <div key={lt.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="font-bold text-gray-900 mb-1">{lt.name}</p>
                    <div className="flex items-end gap-1 mb-3">
                      <span className={`text-3xl font-black ${bal.available <= 0 ? "text-rose-600" : "text-emerald-600"}`}>{bal.available}</span>
                      <span className="text-sm text-gray-400 mb-1">/ {bal.total} days</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                      <div className={`h-2 rounded-full ${pct > 80 ? "bg-rose-400" : pct > 50 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400">{bal.used} used · {pct}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Self-apply dialog (staff/teacher) ────────────────────────────────── */}
      <Dialog open={applyOpen} onOpenChange={o => !o && setApplyOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Apply for Leave</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Leave Type *</label>
              <select className={SEL} value={applyForm.leaveTypeId} onChange={e => setApplyForm(f => ({ ...f, leaveTypeId: e.target.value }))}>
                <option value="">— Select —</option>
                {leaveTypes.map((lt: any) => {
                  const bal = getBalance(lt.id);
                  return <option key={lt.id} value={lt.id}>{lt.name} ({bal ? bal.available : lt.daysAllowed} days available)</option>;
                })}
              </select>
              {applyForm.leaveTypeId && (() => {
                const bal = getBalance(applyForm.leaveTypeId);
                if (!bal) return null;
                return (
                  <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg ${bal.available <= 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {bal.available} day(s) available · {bal.used} used of {bal.total} allocated
                  </div>
                );
              })()}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From *</label>
                <input type="date" className={SEL} value={applyForm.fromDate} onChange={e => setApplyForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To *</label>
                <input type="date" className={SEL} value={applyForm.toDate} onChange={e => setApplyForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            {applyForm.fromDate && applyForm.toDate && (
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg">
                Duration: <strong>{calcDays(applyForm.fromDate, applyForm.toDate)}</strong> day(s)
              </p>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
              <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={applyForm.reason} onChange={e => setApplyForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional reason…" />
            </div>
            {applyErr && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{applyErr}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setApplyOpen(false)}>Cancel</Button>
            <Button disabled={applyLoad} onClick={submitSelfApply}>{applyLoad ? "Submitting…" : "Submit Request"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Admin new request dialog ─────────────────────────────────────────── */}
      <Dialog open={adminApplyOpen} onOpenChange={o => !o && setAdminApplyOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="flex gap-2">
              {(["staff","student"] as const).map(t => (
                <button key={t} onClick={() => setAdminApplyType(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${adminApplyType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>
                  {t === "staff" ? "Staff" : "Student"}
                </button>
              ))}
            </div>
            {adminApplyType === "staff" ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Staff Member *</label>
                <select className={SEL} value={adminForm.staffId} onChange={e => setAdminForm(f => ({ ...f, staffId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Student *</label>
                <select className={SEL} value={adminForm.studentId} onChange={e => setAdminForm(f => ({ ...f, studentId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNo})</option>)}
                </select>
              </div>
            )}
            {adminApplyType === "staff" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Leave Type *</label>
                <select className={SEL} value={adminForm.leaveTypeId} onChange={e => setAdminForm(f => ({ ...f, leaveTypeId: e.target.value }))}>
                  <option value="">— Select —</option>
                  {leaveTypes.map((lt: any) => <option key={lt.id} value={lt.id}>{lt.name} ({lt.daysAllowed} days/yr)</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">From *</label>
                <input type="date" className={SEL} value={adminForm.fromDate} onChange={e => setAdminForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">To *</label>
                <input type="date" className={SEL} value={adminForm.toDate} onChange={e => setAdminForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason</label>
              <textarea rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={adminForm.reason} onChange={e => setAdminForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            {adminErr && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{adminErr}</p>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAdminApplyOpen(false)}>Cancel</Button>
            <Button disabled={adminLoad} onClick={submitAdminApply}>{adminLoad ? "Saving…" : "Add Request"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Approve / Reject with remark dialog ─────────────────────────────── */}
      <Dialog open={remarkOpen} onOpenChange={o => !o && setRemarkOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className={remarkTarget?.newStatus === "APPROVED" ? "text-emerald-700" : "text-rose-700"}>
              {remarkTarget?.newStatus === "APPROVED" ? "Approve Leave" : "Reject Leave"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Admin Remark (optional)</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={remark} onChange={e => setRemark(e.target.value)} placeholder="Add a note for the staff member…" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setRemarkOpen(false)}>Cancel</Button>
            <Button
              disabled={remarkLoad}
              className={remarkTarget?.newStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
              onClick={confirmRemark}
            >
              {remarkLoad ? "Saving…" : (remarkTarget?.newStatus === "APPROVED" ? "Approve" : "Reject")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </main>
  );
}
