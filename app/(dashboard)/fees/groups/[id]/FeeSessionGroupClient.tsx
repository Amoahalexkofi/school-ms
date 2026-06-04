"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, DollarSign } from "lucide-react";

const FINE_TYPES = ["NONE", "PERCENTAGE", "AMOUNT"];

type Item = {
  id: string; amount: number; dueDate: string | null;
  fineType: string; finePercentage: number; fineAmount: number; finePerDay: number;
  feeType: { name: string; code: string };
};

type Props = { sg: any; feeTypes: any[] };

export function FeeSessionGroupClient({ sg, feeTypes }: Props) {
  const router = useRouter();
  const [open,     setOpen]     = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form,     setForm]     = useState({ feeTypeId: "", amount: "", dueDate: "", fineType: "NONE", finePercentage: "", fineAmount: "", finePerDay: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function openAdd() {
    setForm({ feeTypeId: "", amount: "", dueDate: "", fineType: "NONE", finePercentage: "", fineAmount: "", finePerDay: "" });
    setEditItem(null); setError(""); setOpen(true);
  }

  function openEdit(item: Item) {
    setForm({
      feeTypeId:      item.feeType.code, // not used in edit
      amount:         String(item.amount),
      dueDate:        item.dueDate ? item.dueDate.slice(0, 10) : "",
      fineType:       item.fineType,
      finePercentage: String(item.finePercentage),
      fineAmount:     String(item.fineAmount),
      finePerDay:     String(item.finePerDay),
    });
    setEditItem(item); setError(""); setOpen(true);
  }

  async function handleSave() {
    if (!editItem && !form.feeTypeId) { setError("Select a fee type"); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount"); return; }
    setLoading(true); setError("");
    try {
      if (editItem) {
        const res = await fetch(`/api/fees/items/${editItem.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: form.amount, dueDate: form.dueDate || null, fineType: form.fineType, finePercentage: form.finePercentage || 0, fineAmount: form.fineAmount || 0, finePerDay: form.finePerDay || 0 }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/fees/items", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feeSessionGroupId: sg.id, feeTypeId: form.feeTypeId, amount: form.amount, dueDate: form.dueDate || null, fineType: form.fineType, finePercentage: form.finePercentage || 0, fineAmount: form.fineAmount || 0, finePerDay: form.finePerDay || 0 }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      setOpen(false); router.refresh();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this fee item?")) return;
    const res = await fetch(`/api/fees/items/${id}`, { method: "DELETE" });
    if (!res.ok) { alert((await res.json()).error); return; }
    router.refresh();
  }

  const totalAmount = sg.items.reduce((s: number, i: any) => s + Number(i.amount), 0);
  const availableTypes = feeTypes.filter((t: any) => !sg.items.some((i: any) => i.feeType.code === t.code));

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      <div className="flex items-center gap-3">
        <Link href="/fees/setup" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Setup
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{sg.feeGroup.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">Session: {sg.session.session}</p>
          <p className="text-xs text-gray-400 mt-1">{sg._count.studentFeesMasters} student(s) assigned · {sg.items.length} fee item(s)</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₵{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" /> Fee Items
          </CardTitle>
          <Button size="sm" onClick={openAdd} disabled={availableTypes.length === 0}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {sg.items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No items yet. Add fee types with amounts.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-t border-b">
                <tr>
                  {["Fee Type", "Code", "Amount (₵)", "Due Date", "Fine", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sg.items.map((item: Item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.feeType.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.feeType.code}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">₵{Number(item.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {item.fineType === "NONE" ? "—"
                        : item.fineType === "PERCENTAGE" ? `${item.finePercentage}%`
                        : `₵${item.fineAmount}`}
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t">
                  <td colSpan={2} className="px-4 py-2.5 font-semibold text-gray-700">Total</td>
                  <td className="px-4 py-2.5 font-bold text-green-700">₵{totalAmount.toLocaleString()}</td>
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Quick assign link */}
      <div className="text-sm text-gray-500">
        Ready to assign?{" "}
        <Link href={`/fees/assign?sgId=${sg.id}`} className="text-blue-600 hover:underline font-medium">
          Assign this fee group to a class →
        </Link>
      </div>

      {/* Add/Edit Item Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? "Edit Fee Item" : "Add Fee Item"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
                <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.feeTypeId} onChange={set("feeTypeId")}>
                  <option value="">— Select —</option>
                  {availableTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₵) *</label>
              <Input type="number" min="0" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <Input type="date" value={form.dueDate} onChange={set("dueDate")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fine Type</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.fineType} onChange={set("fineType")}>
                {FINE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            {form.fineType === "PERCENTAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fine %</label>
                <Input type="number" min="0" step="0.01" value={form.finePercentage} onChange={set("finePercentage")} />
              </div>
            )}
            {form.fineType === "AMOUNT" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fine Amount (₵)</label>
                <Input type="number" min="0" step="0.01" value={form.fineAmount} onChange={set("fineAmount")} />
              </div>
            )}
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={loading} onClick={handleSave}>{loading ? "Saving…" : "Save"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
