"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, X, ArrowUpRight } from "lucide-react";

type Props = { categories: any[]; suppliers: any[]; stores: any[]; items: any[]; issues: any[]; staff: any[] };
type Tab = "items" | "categories" | "issues";
type Panel = "category" | "stockIn" | "stockOut" | "issueItem" | null;

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

export function InventoryClient({ categories, suppliers, stores, items, issues: initialIssues, staff }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("items");
  const [panel, setPanel] = useState<Panel>(null);

  // Issue item state
  const [issues,     setIssues]     = useState(initialIssues);
  const [issueForm,  setIssueForm]  = useState({ itemId: "", issueType: "staff", issuedToId: "", issuedTo: "", quantity: "1", returnDate: "", note: "" });
  const [issueLoad,  setIssueLoad]  = useState(false);

  // Category panel state
  const [catName, setCatName] = useState("");
  const [catLoad, setCatLoad] = useState(false);

  // Stock movement panel state
  const [stockForm, setStockForm] = useState({ itemId: "", type: "IN", quantity: "1", note: "", issuedTo: "" });
  const [stockLoad, setStockLoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }

  async function saveCategory() {
    if (!catName.trim()) { alert("Category name is required"); return; }
    setCatLoad(true);
    try {
      await post("/api/inventory/categories", { name: catName });
      setCatName("");
      setPanel(null);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setCatLoad(false); }
  }

  async function saveStock() {
    if (!stockForm.itemId || !stockForm.quantity || parseInt(stockForm.quantity) <= 0) {
      alert("Item and positive quantity required"); return;
    }
    setStockLoad(true);
    try {
      await post("/api/inventory/stock", stockForm);
      setStockForm({ itemId: "", type: "IN", quantity: "1", note: "", issuedTo: "" });
      setPanel(null);
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setStockLoad(false); }
  }

  async function saveIssue() {
    if (!issueForm.itemId || parseInt(issueForm.quantity) <= 0) { alert("Item and quantity required"); return; }
    setIssueLoad(true);
    try {
      const staffMember = issueForm.issueType === "staff" ? staff.find((s: any) => s.id === issueForm.issuedToId) : null;
      const res = await fetch("/api/inventory/issues", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId:     issueForm.itemId,
          issueType:  issueForm.issueType,
          issuedToId: issueForm.issuedToId || null,
          issuedTo:   staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : (issueForm.issuedTo || null),
          quantity:   issueForm.quantity,
          returnDate: issueForm.returnDate || null,
          note:       issueForm.note || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const item = items.find((i: any) => i.id === issueForm.itemId);
      setIssues(is => [{ ...data, item: { name: item?.name } }, ...is]);
      setPanel(null);
      setIssueForm({ itemId: "", issueType: "staff", issuedToId: "", issuedTo: "", quantity: "1", returnDate: "", note: "" });
      router.refresh();
    } catch (e: any) { alert(e.message); }
    finally { setIssueLoad(false); }
  }

  function openStock(type: "IN" | "OUT", itemId = "") {
    setStockForm({ itemId, type, quantity: "1", note: "", issuedTo: "" });
    setPanel(type === "IN" ? "stockIn" : "stockOut");
  }

  const lowStockItems = items.filter((i: any) => i.quantity <= i.lowStockAlert);

  return (
    <main className="flex-1 p-6 space-y-5 bg-[#0f1015]">
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong>{lowStockItems.length}</strong> item{lowStockItems.length !== 1 ? "s" : ""} at or below low stock threshold: {lowStockItems.map((i: any) => i.name).join(", ")}
        </div>
      )}

      <div className="flex gap-1 bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm p-1 w-fit">
        {[
          { key: "items"      as Tab, label: `Items (${items.length})` },
          { key: "categories" as Tab, label: `Categories (${categories.length})` },
          { key: "issues"     as Tab, label: `Issues (${issues.filter((i: any) => !i.isReturned).length} active)` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-white/50 hover:bg-white/[0.04]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openStock(panel === "stockIn" ? "OUT" : "IN")}>
                Stock Movement
              </Button>
              <Link href="/inventory/items/new">
                <Button><Plus className="h-4 w-4 mr-1.5" />Add Item</Button>
              </Link>
            </div>
          </div>

          {/* Inline Stock Movement Panel */}
          {(panel === "stockIn" || panel === "stockOut") && (
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white/70">Stock Movement</h3>
                <button onClick={() => setPanel(null)} className="text-white/30 hover:text-white/50"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Item *</label>
                  <select className={SEL} value={stockForm.itemId} onChange={e => setStockForm(f => ({ ...f, itemId: e.target.value }))}>
                    <option value="">— Select —</option>
                    {items.map((i: any) => <option key={i.id} value={i.id}>{i.name} (stock: {i.quantity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Type</label>
                  <div className="flex gap-2">
                    {["IN", "OUT"].map(t => (
                      <button key={t} type="button" onClick={() => setStockForm(f => ({ ...f, type: t }))}
                        className={`px-4 py-1.5 rounded-lg text-sm border font-medium ${stockForm.type === t ? (t === "IN" ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600") : "bg-[#111318] text-white/50 border-white/[0.06]"}`}>
                        {t === "IN" ? "Stock In" : "Stock Out"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Quantity *</label>
                  <Input type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                {stockForm.type === "OUT" && (
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Issued To</label>
                    <Input value={stockForm.issuedTo} onChange={e => setStockForm(f => ({ ...f, issuedTo: e.target.value }))} placeholder="Staff / student name" />
                  </div>
                )}
                <div className={stockForm.type === "OUT" ? "" : "sm:col-span-2"}>
                  <label className="block text-sm font-medium text-white/60 mb-1">Note</label>
                  <Input value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={stockLoad} onClick={saveStock}>{stockLoad ? "Saving…" : "Confirm"}</Button>
              </div>
            </div>
          )}

          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Item","Category","Supplier","Store","Stock","Unit","Alert",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-white/30">No items yet.</td></tr>
                : items.map((i: any) => {
                  const low = i.quantity <= i.lowStockAlert;
                  return (
                    <tr key={i.id} className={`hover:bg-[#0f1015] ${low ? "bg-amber-500/10/30" : ""}`}>
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-white/50">{i.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/40">{i.supplier?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-white/40">{i.store?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${low ? "text-amber-400" : "text-white/80"}`}>{i.quantity}</span>
                        {low && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 inline ml-1" />}
                      </td>
                      <td className="px-4 py-3 text-white/40">{i.unit ?? "—"}</td>
                      <td className="px-4 py-3 text-white/30">{i.lowStockAlert}</td>
                      <td className="px-4 py-3 flex gap-1">
                        <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/20"
                          onClick={() => openStock("IN", i.id)}>
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-400 border-red-500/20"
                          onClick={() => openStock("OUT", i.id)}>
                          <TrendingDown className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "issues" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-white/40">{issues.length} issue record{issues.length !== 1 ? "s" : ""}</p>
            <Button onClick={() => { setPanel(panel === "issueItem" ? null : "issueItem"); setIssueForm({ itemId: "", issueType: "staff", issuedToId: "", issuedTo: "", quantity: "1", returnDate: "", note: "" }); }}>
              <ArrowUpRight className="h-4 w-4 mr-1.5" /> Issue Item
            </Button>
          </div>

          {panel === "issueItem" && (
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white/70">Issue Item to Staff</h3>
                <button onClick={() => setPanel(null)} className="text-white/30 hover:text-white/50"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Item *</label>
                  <select className={SEL} value={issueForm.itemId} onChange={e => setIssueForm(f => ({ ...f, itemId: e.target.value }))}>
                    <option value="">— Select Item —</option>
                    {items.filter((i: any) => i.available > 0).map((i: any) => <option key={i.id} value={i.id}>{i.name} (avail: {i.available})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Issued To (Staff)</label>
                  <select className={SEL} value={issueForm.issuedToId} onChange={e => setIssueForm(f => ({ ...f, issuedToId: e.target.value }))}>
                    <option value="">— Select Staff —</option>
                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Quantity *</label>
                  <Input type="number" min="1" value={issueForm.quantity} onChange={e => setIssueForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Return Date (optional)</label>
                  <input type="date" value={issueForm.returnDate} onChange={e => setIssueForm(f => ({ ...f, returnDate: e.target.value }))}
                    className={SEL} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Note</label>
                  <Input value={issueForm.note} onChange={e => setIssueForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={issueLoad} onClick={saveIssue}>{issueLoad ? "Issuing…" : "Issue"}</Button>
              </div>
            </div>
          )}

          <div className="bg-[#111318] rounded-xl border border-white/[0.06] shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0f1015] border-b">
                <tr>{["Item","Issued To","Qty","Issued","Return By","Status","Note"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-white/50">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {issues.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-white/30">No issue records yet.</td></tr>
                : issues.map((i: any) => {
                    const overdue = !i.isReturned && i.returnDate && new Date(i.returnDate) < new Date();
                    return (
                      <tr key={i.id} className={`hover:bg-[#0f1015] ${overdue ? "bg-red-500/10/30" : ""}`}>
                        <td className="px-4 py-3 font-medium">{i.item?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-white/60">{i.issuedTo ?? "—"}</td>
                        <td className="px-4 py-3 text-center font-medium">{i.quantity}</td>
                        <td className="px-4 py-3 text-xs text-white/40">{new Date(i.issuedAt).toLocaleDateString()}</td>
                        <td className={`px-4 py-3 text-xs ${overdue ? "text-red-400 font-medium" : "text-white/40"}`}>
                          {i.returnDate ? new Date(i.returnDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.isReturned ? "bg-emerald-500/10 text-emerald-400" : overdue ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>
                            {i.isReturned ? "Returned" : overdue ? "Overdue" : "Issued"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-white/30 max-w-[150px] truncate">{i.note ?? "—"}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-white/40">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
            <Button onClick={() => { setCatName(""); setPanel(panel === "category" ? null : "category"); }}>
              <Plus className="h-4 w-4 mr-1.5" />Add Category
            </Button>
          </div>

          {/* Inline Category Panel */}
          {panel === "category" && (
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white/70">Add Category</h3>
                <button onClick={() => setPanel(null)} className="text-white/30 hover:text-white/50"><X className="h-4 w-4" /></button>
              </div>
              <Input
                value={catName}
                onChange={e => setCatName(e.target.value)}
                placeholder="Category name"
                onKeyDown={e => e.key === "Enter" && saveCategory()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={catLoad} onClick={saveCategory}>{catLoad ? "Saving…" : "Add"}</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c: any) => (
              <Card key={c.id}><CardContent className="pt-4">
                <p className="font-medium text-white/80">{c.name}</p>
                <p className="text-xs text-white/30 mt-0.5">{c._count.items} item{c._count.items !== 1 ? "s" : ""}</p>
              </CardContent></Card>
            ))}
            {categories.length === 0 && <p className="text-sm text-white/30 col-span-full text-center py-6">No categories yet.</p>}
          </div>
        </div>
      )}
    </main>
  );
}
