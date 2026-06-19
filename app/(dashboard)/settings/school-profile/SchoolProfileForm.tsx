"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, School, Save, MessageCircle } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

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
    whatsappNumber: profile?.whatsappNumber ?? "",
    motto: profile?.motto ?? "",
    currency: profile?.currency ?? "GHS",
    dateFormat: profile?.dateFormat ?? "DD/MM/YYYY",
    country: profile?.country ?? "",
    state: profile?.state ?? "",
    city: profile?.city ?? "",
    feeDueDays: String(profile?.feeDueDays ?? "30"),
    lowAttendanceLimit: String(profile?.lowAttendanceLimit ?? "75"),
    // Admission number
    admPrefix: profile?.admPrefix ?? "",
    admStartFrom: String(profile?.admStartFrom ?? "1"),
    admNoDigit: String(profile?.admNoDigit ?? "4"),
    admAutoInsert: profile?.admAutoInsert ?? true,
    // Staff ID
    staffidPrefix: profile?.staffidPrefix ?? "",
    staffidStartFrom: String(profile?.staffidStartFrom ?? "1"),
    staffidNoDigit: String(profile?.staffidNoDigit ?? "4"),
    staffidAutoInsert: profile?.staffidAutoInsert ?? true,
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
        body: JSON.stringify({
        ...form,
        feeDueDays: parseInt(form.feeDueDays) || 30,
        lowAttendanceLimit: parseInt(form.lowAttendanceLimit) || 75,
        admStartFrom: parseInt(form.admStartFrom) || 1,
        admNoDigit: parseInt(form.admNoDigit) || 4,
        staffidStartFrom: parseInt(form.staffidStartFrom) || 1,
        staffidNoDigit: parseInt(form.staffidNoDigit) || 4,
      }),
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
    <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
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
            <Label className="flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5 text-green-600" /> WhatsApp Number
            </Label>
            <Input value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+233XXXXXXXXX (with country code)" />
            <p className="text-xs text-gray-400 mt-1">Used to generate WhatsApp message links for parents</p>
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
          <CardTitle className="text-[15px] font-bold text-slate-900">Location</CardTitle>
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
          <CardTitle className="text-[15px] font-bold text-slate-900">System Preferences</CardTitle>
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

      {/* Number Auto-generation */}
      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Admission Number Settings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Prefix</Label>
            <Input value={form.admPrefix} onChange={(e) => set("admPrefix", e.target.value)} placeholder="e.g. ADM, STU" />
          </div>
          <div>
            <Label>Start From</Label>
            <Input type="number" value={form.admStartFrom} onChange={(e) => set("admStartFrom", e.target.value)} min={1} />
          </div>
          <div>
            <Label>Number of Digits</Label>
            <Input type="number" value={form.admNoDigit} onChange={(e) => set("admNoDigit", e.target.value)} min={1} max={10} />
            <p className="text-xs text-gray-400 mt-1">e.g. 4 digits → ADM0001</p>
          </div>
          <div className="flex items-center gap-2 h-full pt-5">
            <input type="checkbox" id="admAuto" checked={form.admAutoInsert} onChange={(e) => set("admAutoInsert", e.target.checked as any)} className="h-4 w-4 rounded border-slate-200" />
            <label htmlFor="admAuto" className="text-sm text-gray-700">Auto-generate on new admission</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Staff ID Settings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Prefix</Label>
            <Input value={form.staffidPrefix} onChange={(e) => set("staffidPrefix", e.target.value)} placeholder="e.g. EMP, STF" />
          </div>
          <div>
            <Label>Start From</Label>
            <Input type="number" value={form.staffidStartFrom} onChange={(e) => set("staffidStartFrom", e.target.value)} min={1} />
          </div>
          <div>
            <Label>Number of Digits</Label>
            <Input type="number" value={form.staffidNoDigit} onChange={(e) => set("staffidNoDigit", e.target.value)} min={1} max={10} />
            <p className="text-xs text-gray-400 mt-1">e.g. 4 digits → EMP0001</p>
          </div>
          <div className="flex items-center gap-2 h-full pt-5">
            <input type="checkbox" id="staffAuto" checked={form.staffidAutoInsert} onChange={(e) => set("staffidAutoInsert", e.target.checked as any)} className="h-4 w-4 rounded border-slate-200" />
            <label htmlFor="staffAuto" className="text-sm text-gray-700">Auto-generate on new staff</label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-[15px] font-bold text-slate-900">Other Settings</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Low Attendance Limit (%)</Label>
            <Input type="number" value={form.lowAttendanceLimit} onChange={(e) => set("lowAttendanceLimit", e.target.value)} min={1} max={100} />
            <p className="text-xs text-gray-400 mt-1">Students below this % are flagged in reports</p>
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
