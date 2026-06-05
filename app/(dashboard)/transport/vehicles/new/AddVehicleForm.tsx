"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddVehicleForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    vehicleNo: "",
    vehicleModel: "",
    manufactureYear: "",
    driverName: "",
    driverContact: "",
    driverLicence: "",
  });

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vehicleNo.trim()) { alert("Vehicle registration number is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/transport/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { alert(d.error ?? "Failed to save vehicle"); return; }
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
      <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Vehicle Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Reg No. *</Label>
              <Input value={form.vehicleNo} onChange={e => set("vehicleNo", e.target.value)} required placeholder="e.g. GR-1234-22" />
            </div>
            <div>
              <Label>Model</Label>
              <Input value={form.vehicleModel} onChange={e => set("vehicleModel", e.target.value)} placeholder="e.g. Toyota Coaster" />
            </div>
            <div>
              <Label>Manufacture Year</Label>
              <Input value={form.manufactureYear} onChange={e => set("manufactureYear", e.target.value)} placeholder="e.g. 2020" />
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input value={form.driverName} onChange={e => set("driverName", e.target.value)} />
            </div>
            <div>
              <Label>Driver Contact</Label>
              <Input value={form.driverContact} onChange={e => set("driverContact", e.target.value)} placeholder="Phone number" />
            </div>
            <div>
              <Label>Driver Licence No.</Label>
              <Input value={form.driverLicence} onChange={e => set("driverLicence", e.target.value)} />
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
