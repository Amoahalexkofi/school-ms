"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Props = {
  incomeHeads: any[];
  expenseHeads: any[];
};

export function AddTransactionForm({ incomeHeads, expenseHeads }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    type: "INCOME",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    headId: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const heads = form.type === "INCOME" ? incomeHeads : expenseHeads;

  async function handleSubmit() {
    if (!form.amount || !form.date) {
      alert("Amount and date are required");
      return;
    }
    if (!form.headId) {
      alert("Please select an account head");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to record transaction");
      router.push("/finance");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/finance" className="text-sm text-blue-600 hover:underline">
        ← Back to Finance
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Record Transaction</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Transaction Type</Label>
            <select
              className={SEL}
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value, headId: "" }))}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <Label>Account Head *</Label>
            <select className={SEL} value={form.headId} onChange={set("headId")}>
              <option value="">— Select Head —</option>
              {heads.map((h: any) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Amount (₵) *</Label>
            <Input type="number" min="0.01" step="0.01" value={form.amount} onChange={set("amount")} placeholder="0.00" />
          </div>

          <div>
            <Label>Date *</Label>
            <Input type="date" value={form.date} onChange={set("date")} />
          </div>

          <div className="md:col-span-2">
            <Label>Note</Label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={form.note}
              onChange={set("note")}
              placeholder="Optional note or description..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Recording…" : "Record Transaction"}
            </Button>
            <Link href="/finance">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
