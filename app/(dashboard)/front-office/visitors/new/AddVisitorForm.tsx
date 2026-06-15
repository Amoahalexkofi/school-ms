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
  purposes: any[];
  staff: any[];
};

export function AddVisitorForm({ purposes, staff }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purposeId: "",
    host: "",
    numVisitors: "1",
    idProof: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit() {
    if (!form.name.trim()) {
      alert("Visitor name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/front-office/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to log visitor");
      router.push("/front-office");
      router.refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/front-office" className="text-sm text-blue-600 hover:underline">
        ← Back to Front Office
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Log Visitor</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Visitor Name *</Label>
            <Input value={form.name} onChange={set("name")} placeholder="Full name" />
          </div>

          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={set("phone")} placeholder="Phone number" />
          </div>

          <div>
            <Label>Purpose of Visit</Label>
            <select className={SEL} value={form.purposeId} onChange={set("purposeId")}>
              <option value="">— None —</option>
              {purposes.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Host / Person to See</Label>
            <select className={SEL} value={form.host} onChange={set("host")}>
              <option value="">— Select Staff —</option>
              {staff.map((s: any) => (
                <option key={s.id} value={`${s.firstName} ${s.lastName}`}>
                  {s.firstName} {s.lastName} ({s.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Number of Visitors</Label>
            <Input type="number" min="1" value={form.numVisitors} onChange={set("numVisitors")} />
          </div>

          <div>
            <Label>ID Proof</Label>
            <Input value={form.idProof} onChange={set("idProof")} placeholder="e.g. Passport, Driver's License" />
          </div>

          <div className="md:col-span-2">
            <Label>Notes</Label>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              value={form.note}
              onChange={set("note")}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? "Logging…" : "Log Visitor"}
            </Button>
            <Link href="/front-office">
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
