"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePermission } from "@/components/PermissionsProvider";import { Input } from "@/components/ui/input";
import { Plus, TrendingUp, TrendingDown, AlertTriangle, X, ArrowUpRight, Trash2, Pencil } from "lucide-react";

type Props = { categories: any[]; suppliers: any[]; stores: any[]; items: any[]; issues: any[]; staff: any[] };
type Tab = "items" | "categories" | "suppliers" | "stores" | "issues";
type Panel = "category" | "supplier" | "store" | "stockIn" | "stockOut" | "issueItem" | null;

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

export function InventoryClient({ categories, suppliers, stores, items, issues: initialIssues, staff }: Props) {
  const perm = usePermission("inventory");
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

  // Supplier / Store panel state
  const [supForm, setSupForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [storeForm, setStoreForm] = useState({ name: "", location: "" });
  const [miscLoad, setMiscLoad] = useState(false);

  // Item edit dialog
  const [editItem, setEditItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", unit: "", categoryId: "", supplierId: "", storeId: "", lowStockAlert: "5" });
  const [itemSaving, setItemSaving] = useState(false);
  const [itemError, setItemError] = useState("");

  function openEditItem(i: any) {
    setEditItem(i);
    setItemForm({
      name: i.name ?? "", unit: i.unit ?? "", categoryId: i.categoryId ?? "",
      supplierId: i.supplierId ?? "", storeId: i.storeId ?? "", lowStockAlert: String(i.lowStockAlert ?? 5),
    });
    setItemError("");
  }

  async function saveItem() {
    if (!editItem) return;
    if (!itemForm.name.trim()) { setItemError("Item name is required"); return; }
    setItemSaving(true); setItemError("");
    try {
      await post(`/api/inventory/items/${editItem.id}`, itemForm, "PATCH");
      setEditItem(null);
      router.refresh();
    } catch (e: any) {
      setItemError(e.message || "Failed");
    } finally {
      setItemSaving(false);
    }
  }


  async function saveSupplier() {
    if (!supForm.name.trim()) { alert("Supplier name is required"); return; }
    setMiscLoad(true);
    try { await post("/api/inventory/suppliers", supForm); setSupForm({ name: "", phone: "", email: "", address: "" }); setPanel(null); router.refresh(); }
    catch (e: any) { alert(e.message); } finally { setMiscLoad(false); }
  }
  async function saveStore() {
    if (!storeForm.name.trim()) { alert("Store name is required"); return; }
    setMiscLoad(true);
    try { await post("/api/inventory/stores", storeForm); setStoreForm({ name: "", location: "" }); setPanel(null); router.refresh(); }
    catch (e: any) { alert(e.message); } finally { setMiscLoad(false); }
  }
  async function delMisc(url: string) {
    if (!confirm("Delete this record?")) return;
    try { await fetch(url, { method: "DELETE" }); router.refresh(); } catch { alert("Failed"); }
  }

  async function post(url: string, body: object, method: "POST" | "PATCH" = "POST") {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    <main className="flex-1 p-4 md:p-6 space-y-5 bg-gray-50">
      {lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong>{lowStockItems.length}</strong> item{lowStockItems.length !== 1 ? "s" : ""} at or below low stock threshold: {lowStockItems.map((i: any) => i.name).join(", ")}
        </div>
      )}

      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 shadow-sm p-1 w-fit">
        {[
          { key: "items"      as Tab, label: `Items (${items.length})` },
          { key: "categories" as Tab, label: `Categories (${categories.length})` },
          { key: "suppliers"  as Tab, label: `Suppliers (${suppliers.length})` },
          { key: "stores"     as Tab, label: `Stores (${stores.length})` },
          { key: "issues"     as Tab, label: `Issues (${issues.filter((i: any) => !i.isReturned).length} active)` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "items" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{items.length} item{items.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              {perm.canEdit && (
                <Button variant="outline" onClick={() => openStock(panel === "stockIn" ? "OUT" : "IN")}>
                  Stock Movement
                </Button>
              )}
              {perm.canAdd && (
                <Link href="/inventory/items/new">
                  <Button><Plus className="h-4 w-4 mr-1.5" />Add Item</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Inline Stock Movement Panel */}
          {(panel === "stockIn" || panel === "stockOut") && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Stock Movement</h3>
                <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                  <select className={SEL} value={stockForm.itemId} onChange={e => setStockForm(f => ({ ...f, itemId: e.target.value }))}>
                    <option value="">— Select —</option>
                    {items.map((i: any) => <option key={i.id} value={i.id}>{i.name} (stock: {i.quantity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div className="flex gap-2">
                    {["IN", "OUT"].map(t => (
                      <button key={t} type="button" onClick={() => setStockForm(f => ({ ...f, type: t }))}
                        className={`px-4 py-1.5 rounded-lg text-sm border font-medium ${stockForm.type === t ? (t === "IN" ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600") : "bg-white text-gray-600 border-gray-200"}`}>
                        {t === "IN" ? "Stock In" : "Stock Out"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <Input type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                {stockForm.type === "OUT" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issued To</label>
                    <Input value={stockForm.issuedTo} onChange={e => setStockForm(f => ({ ...f, issuedTo: e.target.value }))} placeholder="Staff / student name" />
                  </div>
                )}
                <div className={stockForm.type === "OUT" ? "" : "sm:col-span-2"}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <Input value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={stockLoad} onClick={saveStock}>{stockLoad ? "Saving…" : "Confirm"}</Button>
              </div>
            </div>
          )}

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
                          onClick={() => openStock("IN", i.id)}>
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200"
                          onClick={() => openStock("OUT", i.id)}>
                          <TrendingDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditItem(i)} title="Edit item">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-gray-500"
                          onClick={() => delMisc(`/api/inventory/items/${i.id}`)} title="Delete item">
                          <Trash2 className="h-3.5 w-3.5" />
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
            <p className="text-sm text-gray-500">{issues.length} issue record{issues.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && (
              <Button onClick={() => { setPanel(panel === "issueItem" ? null : "issueItem"); setIssueForm({ itemId: "", issueType: "staff", issuedToId: "", issuedTo: "", quantity: "1", returnDate: "", note: "" }); }}>
                <ArrowUpRight className="h-4 w-4 mr-1.5" /> Issue Item
              </Button>
            )}
          </div>

          {panel === "issueItem" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Issue Item to Staff</h3>
                <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                  <select className={SEL} value={issueForm.itemId} onChange={e => setIssueForm(f => ({ ...f, itemId: e.target.value }))}>
                    <option value="">— Select Item —</option>
                    {items.filter((i: any) => i.quantity > 0).map((i: any) => <option key={i.id} value={i.id}>{i.name} (in stock: {i.quantity})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issued To (Staff)</label>
                  <select className={SEL} value={issueForm.issuedToId} onChange={e => setIssueForm(f => ({ ...f, issuedToId: e.target.value }))}>
                    <option value="">— Select Staff —</option>
                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.employeeId})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <Input type="number" min="1" value={issueForm.quantity} onChange={e => setIssueForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Return Date (optional)</label>
                  <input type="date" value={issueForm.returnDate} onChange={e => setIssueForm(f => ({ ...f, returnDate: e.target.value }))}
                    className={SEL} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <Input value={issueForm.note} onChange={e => setIssueForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button>
                <Button disabled={issueLoad} onClick={saveIssue}>{issueLoad ? "Issuing…" : "Issue"}</Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{["Item","Issued To","Qty","Issued","Return By","Status","Note"].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {issues.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">No issue records yet.</td></tr>
                : issues.map((i: any) => {
                    const overdue = !i.isReturned && i.returnDate && new Date(i.returnDate) < new Date();
                    return (
                      <tr key={i.id} className={`hover:bg-gray-50 ${overdue ? "bg-red-50/30" : ""}`}>
                        <td className="px-4 py-3 font-medium">{i.item?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-700">{i.issuedTo ?? "—"}</td>
                        <td className="px-4 py-3 text-center font-medium">{i.quantity}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{new Date(i.issuedAt).toLocaleDateString()}</td>
                        <td className={`px-4 py-3 text-xs ${overdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                          {i.returnDate ? new Date(i.returnDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.isReturned ? "bg-green-100 text-green-700" : overdue ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {i.isReturned ? "Returned" : overdue ? "Overdue" : "Issued"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate">{i.note ?? "—"}</td>
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
            <Button onClick={() => { setCatName(""); setPanel(panel === "category" ? null : "category"); }}>
              <Plus className="h-4 w-4 mr-1.5" />Add Category
            </Button>
          </div>

          {/* Inline Category Panel */}
          {panel === "category" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800">Add Category</h3>
                <button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
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
                <p className="font-medium text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c._count.items} item{c._count.items !== 1 ? "s" : ""}</p>
              </CardContent></Card>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-6">No categories yet.</p>}
          </div>
        </div>
      )}

      {/* ── Suppliers ── */}
      {tab === "suppliers" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && <Button onClick={() => setPanel(panel === "supplier" ? null : "supplier")}><Plus className="h-4 w-4 mr-1.5" />Add Supplier</Button>}
          </div>
          {panel === "supplier" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="font-medium text-gray-800">Add Supplier</h3><button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={supForm.name} onChange={e => setSupForm(f => ({ ...f, name: e.target.value }))} placeholder="Supplier name *" />
                <Input value={supForm.phone} onChange={e => setSupForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" />
                <Input value={supForm.email} onChange={e => setSupForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" />
                <Input value={supForm.address} onChange={e => setSupForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button><Button disabled={miscLoad} onClick={saveSupplier}>{miscLoad ? "Saving…" : "Add"}</Button></div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {suppliers.length === 0 ? <p className="text-center text-sm text-gray-400 py-10">No suppliers yet.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b"><tr>{["Name","Phone","Email","Address",""].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>)}</tr></thead>
                <tbody className="divide-y">
                  {suppliers.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-gray-500">{s.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{s.address ?? "—"}</td>
                      <td className="px-4 py-3 text-right">{perm.canDelete && <button onClick={() => delMisc(`/api/inventory/suppliers/${s.id}`)} className="text-gray-300 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Stores ── */}
      {tab === "stores" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500">{stores.length} store{stores.length !== 1 ? "s" : ""}</p>
            {perm.canAdd && <Button onClick={() => setPanel(panel === "store" ? null : "store")}><Plus className="h-4 w-4 mr-1.5" />Add Store</Button>}
          </div>
          {panel === "store" && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="font-medium text-gray-800">Add Store</h3><button onClick={() => setPanel(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input value={storeForm.name} onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} placeholder="Store name *" />
                <Input value={storeForm.location} onChange={e => setStoreForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" />
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setPanel(null)}>Cancel</Button><Button disabled={miscLoad} onClick={saveStore}>{miscLoad ? "Saving…" : "Add"}</Button></div>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stores.map((s: any) => (
              <Card key={s.id}><CardContent className="pt-4 flex items-start justify-between">
                <div><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400 mt-0.5">{s.location ?? "—"}</p></div>
                {perm.canDelete && <button onClick={() => delMisc(`/api/inventory/stores/${s.id}`)} className="text-gray-300 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>}
              </CardContent></Card>
            ))}
            {stores.length === 0 && <p className="text-sm text-gray-400 col-span-full text-center py-6">No stores yet.</p>}
          </div>
        </div>
      )}

      <Dialog open={!!editItem} onOpenChange={o => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Input className="mt-1" value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. pcs, kg, box" />
              </div>
              <div>
                <Label>Low Stock Alert</Label>
                <Input className="mt-1" type="number" min="0" value={itemForm.lowStockAlert} onChange={e => setItemForm(f => ({ ...f, lowStockAlert: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <select className={`${SEL} mt-1`} value={itemForm.categoryId} onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">— none —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Supplier</Label>
              <select className={`${SEL} mt-1`} value={itemForm.supplierId} onChange={e => setItemForm(f => ({ ...f, supplierId: e.target.value }))}>
                <option value="">— none —</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Store</Label>
              <select className={`${SEL} mt-1`} value={itemForm.storeId} onChange={e => setItemForm(f => ({ ...f, storeId: e.target.value }))}>
                <option value="">— none —</option>
                {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {itemError && <p className="text-sm text-red-600">{itemError}</p>}
            <Button className="w-full" disabled={itemSaving} onClick={saveItem}>
              {itemSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
