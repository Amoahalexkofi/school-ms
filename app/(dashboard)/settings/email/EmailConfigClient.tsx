"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Save, Eye, EyeOff } from "lucide-react";

const SEL = "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";

export function EmailConfigClient({ config }: { config: any }) {
  const [form, setForm] = useState({
    smtpHost: config?.smtpHost ?? "",
    smtpPort: String(config?.smtpPort ?? "587"),
    smtpUsername: config?.smtpUsername ?? "",
    smtpPassword: config?.smtpPassword ?? "",
    smtpSecure: config?.smtpSecure ?? "tls",
    fromEmail: config?.fromEmail ?? "",
    fromName: config?.fromName ?? "",
    isActive: config?.isActive ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })); setSaved(false); }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, smtpPort: parseInt(form.smtpPort) || 587 }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-600" /> SMTP Configuration
          </CardTitle>
          <p className="text-sm text-gray-500">Configure the outgoing email server for notifications and alerts.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>SMTP Host *</Label>
            <Input value={form.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} placeholder="smtp.gmail.com" />
          </div>
          <div>
            <Label>SMTP Port</Label>
            <Input type="number" value={form.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} placeholder="587" />
          </div>
          <div>
            <Label>SMTP Username</Label>
            <Input value={form.smtpUsername} onChange={(e) => set("smtpUsername", e.target.value)} placeholder="your@email.com" />
          </div>
          <div>
            <Label>SMTP Password</Label>
            <div className="relative">
              <Input type={showPass ? "text" : "password"} value={form.smtpPassword} onChange={(e) => set("smtpPassword", e.target.value)} placeholder="App password" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2 top-2.5 text-gray-400">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Encryption</Label>
            <select className={SEL} value={form.smtpSecure} onChange={(e) => set("smtpSecure", e.target.value)}>
              <option value="tls">TLS (recommended)</option>
              <option value="ssl">SSL</option>
              <option value="none">None</option>
            </select>
          </div>
          <div />
          <div>
            <Label>From Email</Label>
            <Input value={form.fromEmail} onChange={(e) => set("fromEmail", e.target.value)} placeholder="noreply@school.edu" />
          </div>
          <div>
            <Label>From Name</Label>
            <Input value={form.fromName} onChange={(e) => set("fromName", e.target.value)} placeholder="School Management" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-slate-200" />
            <label htmlFor="isActive" className="text-sm text-gray-700">Enable email sending</label>
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Configuration"}
            </Button>
            {saved && <span className="text-sm text-green-600 font-medium">Saved</span>}
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p className="font-medium mb-1">Gmail tip</p>
        <p>Use <strong>smtp.gmail.com</strong>, port <strong>587</strong>, TLS, and generate an <strong>App Password</strong> in your Google Account security settings (requires 2FA).</p>
      </div>
    </main>
  );
}
