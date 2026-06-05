"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, School, Save } from "lucide-react";

const SEL = "w-full h-9 rounded-lg border border-gray-300 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

const CURRENCIES = ["GHS", "USD", "EUR", "GBP", "NGN", "KES", "ZAR", "INR", "CAD", "AUD"];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];

export function SchoolProfileForm({ profile }: { profile: any }) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    code: profile?.code ?? "",
    address: profile?.address ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    website: profile?.website ?? "",
    motto: profile?.motto ?? "",
    currency: profile?.currency ?? "GHS",
    dateFormat: profile?.dateFormat ?? "DD/MM/YYYY",
    country: profile?.country ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",
    feeDueDays: String(profile?.feeDueDays ?? "30"),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function save() {
    if (!form.name.trim()) return alert("School name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/school-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, feeDueDays: parseInt(form.feeDueDays) || 30 }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed");
      }
      setSaved(true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <School className="h-4 w-4 text-blue-600" /> General Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>School Name *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Novalss Academy" />
          </div>
          <div>
            <Label>School Code</Label>
            <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. NOVA001" />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+233 XX XXX XXXX" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="admin@school.edu" />
          </div>
          <div>
            <Label>Website</Label>
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://school.edu" />
          </div>
          <div>
            <Label>Motto / Tagline</Label>
            <Input value={form.motto} onChange={(e) => set("motto", e.target.value)} placeholder="Excellence in Education" />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Ghana" />
          </div>
          <div>
            <Label>Region / State</Label>
            <Input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Greater Accra" />
          </div>
          <div>
            <Label>City / Town</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Accra" />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">System Preferences</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Currency</Label>
            <select className={SEL} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Date Format</Label>
            <select className={SEL} value={form.dateFormat} onChange={(e) => set("dateFormat", e.target.value)}>
              {DATE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <Label>Fee Due Days</Label>
            <Input
              type="number"
              value={form.feeDueDays}
              onChange={(e) => set("feeDueDays", e.target.value)}
              min={1}
              max={365}
              placeholder="30"
            />
            <p className="text-xs text-gray-400 mt-1">Days after issue before fee is overdue</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save Profile"}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Saved successfully</span>}
      </div>
    </main>
  );
}
