"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Bell, Plus, Trash2 } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

type Reminder = { id: string; reminderType: "before" | "after"; day: number; isActive: boolean };

export function FeeRemindersClient({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ reminderType: "before" as "before" | "after", day: "3" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addReminder() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/fees/reminders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderType: form.reminderType, day: form.day, isActive: true }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setForm({ reminderType: "before", day: "3" });
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(r: Reminder) {
    await fetch(`/api/fees/reminders/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this reminder rule?")) return;
    await fetch(`/api/fees/reminders/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl mx-auto w-full">
      <Link href="/fees" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Fees
      </Link>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-600" /> Reminder Rules
          </h2>
          <p className="text-xs text-gray-500">
            A daily job sends SMS/WhatsApp to guardians for any fee item due on the
            target date computed by each active rule — e.g. &quot;3 days before due date&quot;.
            An empty list means no reminders ever go out.
          </p>

          {reminders.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No reminder rules yet — add one below.</p>
          ) : (
            <div className="divide-y divide-gray-100 border rounded-lg">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {r.day} day{r.day !== 1 ? "s" : ""} {r.reminderType === "before" ? "before" : "after"} due date
                    </p>
                    <p className="text-xs text-gray-400">{r.isActive ? "Active" : "Paused"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(r)}>
                      {r.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => remove(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add a rule</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">When</Label>
                <select className={SEL} value={form.reminderType} onChange={e => setForm(f => ({ ...f, reminderType: e.target.value as "before" | "after" }))}>
                  <option value="before">Before due date</option>
                  <option value="after">After due date</option>
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1 block">Days</Label>
                <Input type="number" min="1" value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))} />
              </div>
              <Button disabled={loading} onClick={addReminder}>
                <Plus className="h-4 w-4 mr-1" /> {loading ? "Adding…" : "Add Rule"}
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
