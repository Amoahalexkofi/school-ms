"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Plus } from "lucide-react";

async function post(url: string, body: object) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
  return res.json();
}

export function InventoryClient({ items, recentMovements }: any) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemForm, setItemForm] = useState({ name: "", unit: "", quantity: "0", lowStockAlert: "5" });
  const [stockForm, setStockForm] = useState({ quantity: "", note: "", direction: "IN" });

  const lowStock = items.filter((i: any) => i.quantity <= i.lowStockAlert);

  async function submit(url: string, body: object) {
    setLoading(true); setError("");
    try { await post(url, body); setOpen(null); router.refresh(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="flex-1 p-6 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Total Items</p><p className="text-3xl font-bold">{items.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Low Stock</p><p className={`text-3xl font-bold ${lowStock.length > 0 ? "text-yellow-600" : "text-gray-800"}`}>{lowStock.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Out of Stock</p><p className={`text-3xl font-bold ${items.filter((i: any) => i.quantity === 0).length > 0 ? "text-red-600" : "text-gray-800"}`}>{items.filter((i: any) => i.quantity === 0).length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-gray-500 mb-1">Movements</p><p className="text-3xl font-bold">{recentMovements.length}</p></CardContent></Card>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4" /> Low Stock</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((i: any) => (
              <span key={i.id} className="text-xs bg-yellow-100 text-yellow-800 border border-yellow-300 px-2 py-1 rounded">{i.name} — {i.quantity} {i.unit ?? "units"}</span>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4 text-blue-600" /> Items</CardTitle>
          <Button size="sm" onClick={() => { setError(""); setOpen("item"); }}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? <p className="text-sm text-gray-500 text-center py-8">No items yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50"><tr>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Item</th>
                  <th className="text-right px-3 py-2 font-medium text-gray-600">Qty</th>
                  <th className="text-left px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-2"></th>
                </tr></thead>
                <tbody className="divide-y">
                  {items.map((item: any) => {
                    const isLow = item.quantity <= item.lowStockAlert;
                    const isOut = item.quantity === 0;
                    return (
                      <tr key={item.id} className={`hover:bg-gray-50 ${isOut ? "bg-red-50" : isLow ? "bg-yellow-50" : ""}`}>
                        <td className="px-3 py-2.5 font-medium">{item.name}{item.unit && <span className="text-gray-400 font-normal ml-1">({item.unit})</span>}</td>
                        <td className="px-3 py-2.5 text-right font-semibold">{item.quantity}</td>
                        <td className="px-3 py-2.5">
                          {isOut ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Out of Stock</span>
                            : isLow ? <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Low Stock</span>
                            : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">In Stock</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => { setError(""); setSelectedItem(item); setStockForm({ quantity: "", note: "", direction: "IN" }); setOpen("stock"); }}>
                              <TrendingUp className="h-3 w-3 mr-1" />In
                            </Button>
                            {item.quantity > 0 && (
                              <Button size="sm" variant="outline" onClick={() => { setError(""); setSelectedItem(item); setStockForm({ quantity: "", note: "", direction: "OUT" }); setOpen("stock"); }}>
                                <TrendingDown className="h-3 w-3 mr-1" />Out
                              </Button>
                            )}
                          </div>
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

      {/* Add Item Dialog */}
      <Dialog open={open === "item"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input className="mt-1" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unit</Label><Input className="mt-1" placeholder="e.g. pcs, kg" value={itemForm.unit} onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))} /></div>
              <div><Label>Opening Qty</Label><Input className="mt-1" type="number" min="0" value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            </div>
            <div><Label>Low Stock Alert At</Label><Input className="mt-1" type="number" min="0" value={itemForm.lowStockAlert} onChange={e => setItemForm(f => ({ ...f, lowStockAlert: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/inventory/items", { ...itemForm, quantity: Number(itemForm.quantity), lowStockAlert: Number(itemForm.lowStockAlert) })}>
              {loading ? "Adding…" : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Movement Dialog */}
      <Dialog open={open === "stock"} onOpenChange={o => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Stock {stockForm.direction === "IN" ? "In" : "Out"} — {selectedItem?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Quantity *</Label><Input className="mt-1" type="number" min="1" value={stockForm.quantity} onChange={e => setStockForm(f => ({ ...f, quantity: e.target.value }))} /></div>
            <div><Label>Note</Label><Input className="mt-1" value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" disabled={loading} onClick={() => submit("/api/inventory/stock", { itemId: selectedItem?.id, quantity: Number(stockForm.quantity), note: stockForm.note, direction: stockForm.direction })}>
              {loading ? "Updating…" : `Record Stock ${stockForm.direction}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
