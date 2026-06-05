"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";

type Props = { leaveTypes: any[]; staffRequests: any[]; studentRequests: any[]; staff: any[]; students: any[]; leaveBalances: any[] };
type Tab = "types" | "staff" | "students" | "balance";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function LeaveClient({ leaveTypes, staffRequests, studentRequests, staff, students, leaveBalances }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("types");

  // Leave type inline panel state
  const [typePanel, setTypePanel] = useState(false);
  const [typeEdit, setTypeEdit] = useState<any>(null);
  const [typeName, setTypeName] = useState("");
  const [typeDays, setTypeDays] = useState("0");
  const [typeErr,  setTypeErr]  = useState("");
  const [typeLoad, setTypeLoad] = useState(false);

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
      setTypePanel(false); setTypeEdit(null); router.refresh();
    } catch (e: any) { setTypeErr(e.message); } finally { setTypeLoad(false); }
  }
  async function deleteType(id: string) {
    if (!confirm("Delete this leave type?")) return;
    try { await del(`/api/leave/types/${id}`); router.refresh(); } catch (e: any) { alert(e.message); }
  }

  // Approve/Reject handlers
  async function approveStaff(id: string, status: "APPROVED" | "REJECTED") {
    await patch(`/api/leave/staff/${id}`, { status, approvedAt: new Date().toISOString() });
    router.refresh();
  }
  async function approveStudent(id: string, status: "APPROVED" | "REJECTED") {
    await patch(`/api/leave/students/${id}`, { status, approvedAt: new Date().toISOString() });
    router.refresh();
  }

  const TABS = [
    { key: "types"    as Tab, label: "Leave Types" },
    { key: "staff"    as Tab, label: "Staff Leave" },
    { key: "students" as Tab, label: "Student Leave" },
    { key: "balance"  as Tab, label: "Leave Balance" },
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
            <Button onClick={() => { setTypeName(""); setTypeDays("0"); setTypeEdit(null); setTypeErr(""); setTypePanel(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> Add Type
            </Button>
          </div>

          {/* Inline panel for add/edit leave type */}
          {typePanel && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4 space-y-3">
              <p className="font-medium text-gray-800 text-sm">{typeEdit ? "Edit Leave Type" : "New Leave Type"}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <Input value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g. Annual Leave" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days Allowed per Year</label>
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
                <CardContent className="pt-4 flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{lt.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lt.daysAllowed} days allowed / year</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => { setTypeName(lt.name); setTypeDays(String(lt.daysAllowed)); setTypeEdit(lt); setTypeErr(""); setTypePanel(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
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
            <Link href="/leave/new">
              <Button><Plus className="h-4 w-4 mr-1.5" /> New Request</Button>
            </Link>
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
            <Link href="/leave/new">
              <Button><Plus className="h-4 w-4 mr-1.5" /> New Request</Button>
            </Link>
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

      {/* ── Leave Balance ── */}
      {tab === "balance" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Leave balance per staff member — Total Allocated vs Used Days</p>
          {leaveBalances.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-400">
              No leave balances configured. Allocate leave to staff from their profiles.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Staff", "Employee ID", "Leave Type", "Allocated", "Used", "Available", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leaveBalances.map((b: any) => {
                    const available = b.totalDays - b.usedDays;
                    const pct = b.totalDays > 0 ? Math.round((b.usedDays / b.totalDays) * 100) : 0;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{b.staff.firstName} {b.staff.lastName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{b.staff.employeeId}</td>
                        <td className="px-4 py-3 text-gray-600">{b.leaveType.name}</td>
                        <td className="px-4 py-3 text-center">{b.totalDays}</td>
                        <td className="px-4 py-3 text-center text-orange-600">{b.usedDays}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${available <= 0 ? "text-red-600" : available <= 3 ? "text-amber-600" : "text-green-600"}`}>{available}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
                              <div className={`h-1.5 rounded-full ${pct > 80 ? "bg-red-400" : pct > 50 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{pct}% used</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
