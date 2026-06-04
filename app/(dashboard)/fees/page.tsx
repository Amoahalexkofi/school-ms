"use client";

import { useState, useEffect, useCallback } from "react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Plus, Layers, Tag, FileText, Trash2 } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  UNPAID: "bg-red-100 text-red-700 border-red-200",
  PARTIAL: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
};

const FEE_CATEGORIES = ["MONTHLY", "QUARTERLY", "ANNUAL", "ONE_TIME"];

async function apiFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

async function apiPost(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Failed");
  return data;
}

type Tab = "types" | "groups" | "invoices";

export default function FeesPage() {
  const [tab, setTab] = useState<Tab>("invoices");
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [feeGroups, setFeeGroups] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  // Fee Type form
  const [typeForm, setTypeForm] = useState({ name: "", category: "ANNUAL", amount: "" });
  // Fee Group form
  const [groupForm, setGroupForm] = useState({ name: "", sessionId: "" });
  // Add item to group
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [addItemTypeId, setAddItemTypeId] = useState("");
  // Invoice form
  const [invForm, setInvForm] = useState({ studentId: "", feeGroupId: "", dueDate: "" });
  // Payment form
  const [payDialog, setPayDialog] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");

  const reload = useCallback(async () => {
    setLoading(true);
    const [t, g, i, s, sess] = await Promise.all([
      apiFetch("/api/fees/types"),
      apiFetch("/api/fees/groups"),
      apiFetch("/api/fees/invoices"),
      apiFetch("/api/students"),
      apiFetch("/api/sessions"),
    ]);
    setFeeTypes(t); setFeeGroups(g); setInvoices(i); setStudents(s); setSessions(sess);
    if (sess.length > 0 && !groupForm.sessionId) setGroupForm(f => ({ ...f, sessionId: sess[0].id }));
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  async function submit(fn: () => Promise<any>) {
    setSaving(true); setError("");
    try { await fn(); setOpen(null); await reload(); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  const totalInvoiced = invoices.reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paidAmount), 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Fee Management" />
      <main className="flex-1 p-6 space-y-6">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Invoiced</p><p className="text-2xl font-bold">₵{totalInvoiced.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Collected</p><p className="text-2xl font-bold text-green-600">₵{totalPaid.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Outstanding</p><p className="text-2xl font-bold text-red-600">₵{(totalInvoiced - totalPaid).toLocaleString()}</p></CardContent></Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {([["invoices", "Invoices", FileText], ["groups", "Fee Groups", Layers], ["types", "Fee Types", Tag]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* ── Fee Types tab ── */}
        {tab === "types" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Fee Types</CardTitle>
              <Button size="sm" onClick={() => { setError(""); setOpen("type"); }}><Plus className="h-4 w-4 mr-1" /> New Type</Button>
            </CardHeader>
            <CardContent>
              {feeTypes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No fee types yet. Create one to get started.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Name</th>
                    <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                    <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {feeTypes.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium">{t.name}</td>
                        <td className="px-3 py-2.5"><span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{t.category}</span></td>
                        <td className="px-3 py-2.5 text-right font-semibold">₵{Number(t.amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Fee Groups tab ── */}
        {tab === "groups" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => { setError(""); setOpen("group"); }}><Plus className="h-4 w-4 mr-1" /> New Group</Button>
            </div>
            {feeGroups.length === 0 ? (
              <Card><CardContent className="text-center py-8 text-sm text-gray-500">No fee groups yet.</CardContent></Card>
            ) : feeGroups.map((g: any) => {
              const total = g.items.reduce((s: number, item: any) => s + Number(item.feeType.amount), 0);
              return (
                <Card key={g.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{g.name}</p>
                        <p className="text-xs text-gray-500">{g.session.name} · {g._count.invoices} invoices issued</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₵{total.toLocaleString()}</p>
                        <p className="text-xs text-gray-400">total</p>
                      </div>
                    </div>

                    {/* Items */}
                    {g.items.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {g.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
                            <span>{item.feeType.name} <span className="text-xs text-gray-400">({item.feeType.category})</span></span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">₵{Number(item.feeType.amount).toLocaleString()}</span>
                              <button onClick={() => submit(() => fetch(`/api/fees/groups/${g.id}/items`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feeTypeId: item.feeTypeId }) }).then(r => { if (!r.ok) throw new Error("Failed"); }))}
                                className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button size="sm" variant="outline" onClick={() => { setSelectedGroup(g); setAddItemTypeId(""); setError(""); setOpen("addItem"); }}>
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Fee Type
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Invoices tab ── */}
        {tab === "invoices" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Invoices</CardTitle>
              <Button size="sm" onClick={() => { setError(""); setInvForm({ studentId: "", feeGroupId: feeGroups[0]?.id ?? "", dueDate: "" }); setOpen("invoice"); }}>
                <Plus className="h-4 w-4 mr-1" /> Generate Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-gray-500 text-center py-8">Loading…</p>
                : invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No invoices yet.</p>
                    {feeGroups.length === 0 && <p className="text-xs mt-1 text-orange-500">Create a fee group first.</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50"><tr>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Fee Group</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Paid</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Balance</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                        <th />
                      </tr></thead>
                      <tbody className="divide-y">
                        {invoices.map((inv: any) => {
                          const balance = Number(inv.totalAmount) - Number(inv.paidAmount);
                          const overdue = new Date(inv.dueDate) < new Date() && inv.status !== "PAID";
                          return (
                            <tr key={inv.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50" : ""}`}>
                              <td className="px-4 py-3 font-medium">{inv.student?.firstName} {inv.student?.lastName}</td>
                              <td className="px-4 py-3 text-gray-600">{inv.feeGroup?.name ?? "—"}</td>
                              <td className="px-4 py-3 text-right">₵{Number(inv.totalAmount).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right text-green-600">₵{Number(inv.paidAmount).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-medium text-red-600">₵{balance.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[inv.status]}`}>{inv.status}</span>
                                {overdue && <span className="ml-1 text-xs text-red-600 font-medium">OVERDUE</span>}
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inv.dueDate).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                {inv.status !== "PAID" && (
                                  <Button size="sm" variant="outline" onClick={() => { setPayDialog(inv); setPayAmount(""); setError(""); }}>Pay</Button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* New Fee Type */}
      <Dialog open={open === "type"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Fee Type</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input className="mt-1" placeholder="e.g. Tuition Fee" value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Category</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={typeForm.category} onChange={e => setTypeForm(f => ({ ...f, category: e.target.value }))}>
                {FEE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
              </select>
            </div>
            <div><Label>Amount (₵) *</Label><Input className="mt-1" type="number" min="0.01" step="0.01" value={typeForm.amount} onChange={e => setTypeForm(f => ({ ...f, amount: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving} onClick={() => submit(() => apiPost("/api/fees/types", typeForm))}>
              {saving ? "Creating…" : "Create Fee Type"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Fee Group */}
      <Dialog open={open === "group"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Fee Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input className="mt-1" placeholder="e.g. Term 1 Fees 2026" value={groupForm.name} onChange={e => setGroupForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div>
              <Label>Session *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={groupForm.sessionId} onChange={e => setGroupForm(f => ({ ...f, sessionId: e.target.value }))}>
                <option value="">Select session</option>
                {sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {sessions.length === 0 && <p className="text-xs text-orange-500">No sessions found — create one in Settings first.</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving} onClick={() => submit(() => apiPost("/api/fees/groups", groupForm))}>
              {saving ? "Creating…" : "Create Fee Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Fee Type to Group */}
      <Dialog open={open === "addItem"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fee Type to "{selectedGroup?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fee Type *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={addItemTypeId} onChange={e => setAddItemTypeId(e.target.value)}>
                <option value="">Select fee type</option>
                {feeTypes
                  .filter(t => !selectedGroup?.items?.some((i: any) => i.feeTypeId === t.id))
                  .map((t: any) => <option key={t.id} value={t.id}>{t.name} — ₵{Number(t.amount).toLocaleString()}</option>)}
              </select>
            </div>
            {feeTypes.length === 0 && <p className="text-xs text-orange-500">No fee types yet — create one in the Fee Types tab first.</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving || !addItemTypeId} onClick={() => submit(() => apiPost(`/api/fees/groups/${selectedGroup.id}/items`, { feeTypeId: addItemTypeId }))}>
              {saving ? "Adding…" : "Add to Group"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Invoice */}
      <Dialog open={open === "invoice"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate Invoice</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Student *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={invForm.studentId} onChange={e => setInvForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">Select student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.admissionNumber})</option>)}
              </select>
            </div>
            <div>
              <Label>Fee Group *</Label>
              <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={invForm.feeGroupId} onChange={e => setInvForm(f => ({ ...f, feeGroupId: e.target.value }))}>
                <option value="">Select fee group</option>
                {feeGroups.map((g: any) => {
                  const total = g.items.reduce((s: number, i: any) => s + Number(i.feeType.amount), 0);
                  return <option key={g.id} value={g.id}>{g.name} — ₵{total.toLocaleString()}</option>;
                })}
              </select>
              {feeGroups.length === 0 && <p className="text-xs text-orange-500 mt-1">No fee groups yet — create one first.</p>}
            </div>
            <div><Label>Due Date *</Label><Input className="mt-1" type="date" value={invForm.dueDate} onChange={e => setInvForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={saving || !invForm.studentId || !invForm.feeGroupId || !invForm.dueDate}
              onClick={() => submit(() => apiPost("/api/fees/invoices", invForm))}>
              {saving ? "Generating…" : "Generate Invoice"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Record Payment */}
      <Dialog open={!!payDialog} onOpenChange={o => !o && setPayDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          {payDialog && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium">{payDialog.student?.firstName} {payDialog.student?.lastName}</p>
                <p className="text-gray-500">{payDialog.feeGroup?.name}</p>
                <p className="mt-1">Balance due: <strong className="text-red-600">₵{(Number(payDialog.totalAmount) - Number(payDialog.paidAmount)).toLocaleString()}</strong></p>
              </div>
              <div><Label>Amount (₵) *</Label><Input className="mt-1" type="number" min="0.01" step="0.01" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="0.00" /></div>
              <div>
                <Label>Payment Method</Label>
                <select className="mt-1 w-full border rounded-md px-3 py-2 text-sm" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="ONLINE">Online</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" disabled={saving || !payAmount}
                onClick={() => submit(async () => {
                  await apiPost("/api/fees/payments", { invoiceId: payDialog.id, amount: Number(payAmount), method: payMethod });
                  setPayDialog(null);
                })}>
                {saving ? "Saving…" : "Record Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
