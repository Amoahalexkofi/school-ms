"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SEL = "w-full h-9 rounded-lg border border-white/[0.08] px-3 text-sm bg-[#111318] focus:outline-none focus:ring-2 focus:ring-blue-500";

type Props = { vehicles: any[] };

export function AddRouteForm({ vehicles }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", vehicleId: "" });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { alert("Route title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/transport/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save route"); return; }
      router.push("/transport");
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
      <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Route Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Route Title *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} required placeholder="e.g. Accra North Route" />
            </div>
            <div>
              <Label>Vehicle</Label>
              <select className={SEL} value={form.vehicleId} onChange={e => set("vehicleId", e.target.value)}>
                <option value="">— None —</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>{v.vehicleNo}{v.vehicleModel ? ` (${v.vehicleModel})` : ""}</option>
                ))}
              </select>
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
