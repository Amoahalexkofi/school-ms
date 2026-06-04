"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Plus, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

type Props = { categories: any[]; suppliers: any[]; stores: any[]; items: any[] };
type Tab = "items" | "categories";

export function InventoryClient({ categories, suppliers, stores, items }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("items");

  const [itemOpen, setItemOpen] = useState(false);
  const [itemForm, setItemForm] = useState({ name: "", categoryId: "", supplierId: "", storeId: "", quantity: "0", lowStockAlert: "5", unit: "" });
  const [itemErr, setItemErr] = useState(""); const [itemLoad, setItemLoad] = useState(false);

  const [catOpen, setCatOpen] = useState(false); const [catName, setCatName] = useState(""); const [catErr, setCatErr] = useState(""); const [catLoad, setCatLoad] = useState(false);

  const [stockOpen, setStockOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ itemId: "", type: "IN", quantity: "1", note: "", issuedTo: "" });
  const [stockErr, setStockErr] = useState(""); const [stockLoad, setStockLoad] = useState(false);

  async function post(url: string, body: object) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json(); if (!res.ok) throw new Error(d.error); return d;
  }
  async function del(url: string) {
    const res = await fetch(url, { method: "DELETE" }); if (!res.ok) throw new Error((await res.json()).error);
  }

  async function saveItem() {
    if (!itemForm.name.trim()) { setItemErr("Name required"); return; }
    setItemLoad(true); setItemErr("");
    try { await post("/api/inventory/items", itemForm); setItemOpen(false); router.refresh(); }
    catch (e: any) { setItemErr(e.message); } finally { setItemLoad(false); }
  }

  async function saveCategory() {
    if (!catName.trim()) { setCatErr("Name required"); return; }
    setCatLoad(true); setCatErr("");
    try { await post("/api/inventory/categories", { name: catName }); setCatOpen(false); router.refresh(); }
    catch (e: any) { setCatErr(e.message); } finally { setCatLoad(false); }
  }

  async function saveStock() {
    if (!stockForm.itemId || !stockForm.quantity || parseInt(stockForm.quantity) <= 0) { setStockErr("Item and positive quantity required"); return; }
    setStockLoad(true); setStockErr("");
    try { await post("/api/inventory/stock", stockForm); setStockOpen(false); router.refresh(); }
    catch (e: any) { setStockErr(e.message); } finally { setStockLoad(false); }
  }

  const lowStockItems = items.filter((i: any) => i.quantity <= i.lowStockAlert);

  return (
    <main className="flex-1 p-6 space-y-5 bg-gray-50">
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong>{lowStockItems.length}</strong> item{lowStockItems.length !== 1 ? "s" : ""} at or below low stock threshold: {lowStockItems.map((i: any) => i.name).join(", ")}
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {[{ key: "items" as Tab, label: `Items (${items.length})` }, { key: "categories" as Tab, label: `Categories (${categories.length})` }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setStockForm({ itemId: "", type: "IN", quantity: "1", note: "", issuedTo: "" }); setStockErr(""); setStockOpen(true); }}>
                Stock Movement
              </Button>
              <Button onClick={() => { setItemForm({ name: "", categoryId: "", supplierId: "", storeId: "", quantity: "0", lowStockAlert: "5", unit: "" }); setItemErr(""); setItemOpen(true); }}>
                <Plus className="h-4 w-4 mr-1.5" />Add Item
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Item","Category","Supplier","Store","Stock","Unit","Alert",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {items.length === 0 ? <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">No items yet.</td></tr>
                : items.map((i: any) => {
                  const low = i.quantity <= i.lowStockAlert;
                  return (
                    <tr key={i.id} className={`hover:bg-gray-50 ${low ? "bg-amber-50/30" : ""}`}>
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-gray-600">{i.category?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{i.supplier?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{i.store?.name ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${low ? "text-amber-700" : "text-gray-900"}`}>{i.quantity}</span>
                        {low && <AlertTriangle className="h-3.5 w-3.5 text-amber-500 inline ml-1" />}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{i.unit ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-400">{i.lowStockAlert}</td>
                      <td className="px-4 py-3 flex gap-1">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200"
                          onClick={() => { setStockForm({ itemId: i.id, type: "IN", quantity: "1", note: "", issuedTo: "" }); setStockErr(""); setStockOpen(true); }}>
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200"
                          onClick={() => { setStockForm({ itemId: i.id, type: "OUT", quantity: "1", note: "", issuedTo: "" }); setStockErr(""); setStockOpen(true); }}>
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

      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
            <Button onClick={() => { setCatName(""); setCatErr(""); setCatOpen(true); }}><Plus className="h-4 w-4 mr-1.5" />Add Category</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((c: any) => (
              <Card key={c.id}><CardContent className="pt-4">
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c._count.items} item{c._count.items !== 1 ? "s" : ""}</p>
              </CardContent></Card>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-6">No categories yet.</p>}
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={itemOpen} onOpenChange={o => !o && setItemOpen(false)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><Input value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
          {[["Category","categoryId",categories],["Supplier","supplierId",suppliers],["Store","storeId",stores]].map(([label, key, opts]: any) => (
            <div key={key}><label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(itemForm as any)[key]} onChange={e => setItemForm(f => ({ ...f, [key]: e.target.value }))}>
                <option value="">— None —</option>
                {opts.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          ))}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Initial Qty</label><Input type="number" min="0" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label><Input type="number" min="0" value={itemForm.lowStockAlert} onChange={e => setItemForm(f => ({ ...f, lowStockAlert: e.target.value }))} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label><Input value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. pcs, kg, box" /></div>
        </div>
        {itemErr && <p className="text-sm text-red-600 mt-1">{itemErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setItemOpen(false)}>Cancel</Button><Button disabled={itemLoad} onClick={saveItem}>{itemLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catOpen} onOpenChange={o => !o && setCatOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
        <Input value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category name" onKeyDown={e => e.key === "Enter" && saveCategory()} />
        {catErr && <p className="text-sm text-red-600">{catErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCatOpen(false)}>Cancel</Button><Button disabled={catLoad} onClick={saveCategory}>{catLoad ? "Saving…" : "Add"}</Button></div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={stockOpen} onOpenChange={o => !o && setStockOpen(false)}>
        <DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Stock Movement</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
            <select className="w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={stockForm.itemId} onChange={e => setStockForm(f => ({ ...f, itemId: e.target.value }))}>
              <option value="">— Select —</option>
              {items.map((i: any) => <option key={i.id} value={i.id}>{i.name} (stock: {i.quantity})</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            {["IN","OUT"].map(t => <button key={t} onClick={() => setStockForm(f => ({ ...f, type: t }))}
              className={`px-4 py-1.5 rounded-lg text-sm border font-medium ${stockForm.type === t ? (t === "IN" ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600") : "bg-white text-gray-600 border-gray-200"}`}>{t === "IN" ? "Stock In" : "Stock Out"}</button>)}
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label><Input type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} /></div>
          {stockForm.type === "OUT" && <div><label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label><Input value={stockForm.issuedTo} onChange={e => setStockForm(f => ({ ...f, issuedTo: e.target.value }))} placeholder="Staff / student name" /></div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Note</label><Input value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" /></div>
        </div>
        {stockErr && <p className="text-sm text-red-600">{stockErr}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setStockOpen(false)}>Cancel</Button><Button disabled={stockLoad} onClick={saveStock}>{stockLoad ? "Saving…" : "Confirm"}</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
