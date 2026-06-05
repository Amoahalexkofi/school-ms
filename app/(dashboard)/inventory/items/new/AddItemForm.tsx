"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

type Props = {
  categories: any[];
  suppliers: any[];
  stores: any[];
};

export function AddItemForm({ categories, suppliers, stores }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    itemCode: "",
    categoryId: "",
    supplierId: "",
    storeId: "",
    unit: "",
    quantity: "0",
    lowStockAlert: "5",
    purchasePrice: "",
    description: "",
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { alert("Item name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/inventory/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save item"); return; }
      router.push("/inventory");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <Link href="/inventory" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Item Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Item Name *</Label>
              <Input value={form.name} onChange={e => set("name", e.target.value)} required />
            </div>
            <div>
              <Label>Item Code</Label>
              <Input value={form.itemCode} onChange={e => set("itemCode", e.target.value)} placeholder="e.g. ITEM-001" />
            </div>
            <div>
              <Label>Unit</Label>
              <Input value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="e.g. pcs, kg, box" />
            </div>
            <div>
              <Label>Category</Label>
              <select className={SEL} value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                <option value="">— None —</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Supplier</Label>
              <select className={SEL} value={form.supplierId} onChange={e => set("supplierId", e.target.value)}>
                <option value="">— None —</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Store</Label>
              <select className={SEL} value={form.storeId} onChange={e => set("storeId", e.target.value)}>
                <option value="">— None —</option>
                {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Initial Quantity</Label>
              <Input type="number" min="0" value={form.quantity} onChange={e => set("quantity", e.target.value)} />
            </div>
            <div>
              <Label>Low Stock Alert</Label>
              <Input type="number" min="0" value={form.lowStockAlert} onChange={e => set("lowStockAlert", e.target.value)} />
            </div>
            <div>
              <Label>Purchase Price (₵)</Label>
              <Input type="number" min="0" step="0.01" value={form.purchasePrice} onChange={e => set("purchasePrice", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={form.description}
                onChange={e => set("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </form>
    </main>
  );
}
