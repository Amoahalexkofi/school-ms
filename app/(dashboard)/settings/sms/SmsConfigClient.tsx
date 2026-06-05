"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Save, Eye, EyeOff, Check } from "lucide-react";

const PROVIDERS = [
  { value: "twilio",         label: "Twilio",         fields: ["apiKey", "senderId"] },
  { value: "africas_talking", label: "Africa's Talking", fields: ["apiKey", "username", "senderId"] },
  { value: "msg91",          label: "MSG91",           fields: ["apiKey", "senderId"] },
  { value: "nexmo",          label: "Vonage (Nexmo)",  fields: ["apiKey", "password", "senderId"] },
];

export function SmsConfigClient({ configs: initial }: { configs: any[] }) {
  const [configs, setConfigs] = useState<any[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  function getConfig(provider: string) {
    return configs.find((c) => c.provider === provider) ?? { provider, apiKey: "", senderId: "", username: "", password: "", isActive: false };
  }

  function update(provider: string, key: string, value: any) {
    setConfigs((cs) => {
      const existing = cs.find((c) => c.provider === provider);
      if (existing) return cs.map((c) => (c.provider === provider ? { ...c, [key]: value } : c));
      return [...cs, { provider, apiKey: "", senderId: "", username: "", password: "", isActive: false, [key]: value }];
    });
    setSaved(null);
  }

  async function save(provider: string) {
    setSaving(provider);
    try {
      const config = getConfig(provider);
      const res = await fetch("/api/sms-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfigs((cs) => {
        const exists = cs.find((c) => c.provider === provider);
        return exists ? cs.map((c) => (c.provider === provider ? updated : c)) : [...cs, updated];
      });
      setSaved(provider);
    } catch { alert("Failed to save"); }
    finally { setSaving(null); }
  }

  async function setActive(provider: string) {
    // Deactivate all, then activate selected
    for (const p of PROVIDERS) {
      const cfg = getConfig(p.value);
      if (cfg.isActive && p.value !== provider) {
        await fetch("/api/sms-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...cfg, isActive: false }),
        });
        update(p.value, "isActive", false);
      }
    }
    update(provider, "isActive", true);
    await save(provider);
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold">SMS Configuration</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure one SMS gateway to send attendance alerts, fee reminders, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {PROVIDERS.map((prov) => {
          const cfg = getConfig(prov.value);
          const isActive = cfg.isActive;
          return (
            <Card key={prov.value} className={isActive ? "border-green-400 shadow-sm" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    {prov.label}
                    {isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active</span>}
                  </CardTitle>
                  {!isActive && (
                    <Button size="sm" variant="outline" onClick={() => setActive(prov.value)}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Set Active
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prov.fields.includes("apiKey") && (
                  <div>
                    <Label>API Key</Label>
                    <div className="relative">
                      <Input
                        type={showPass[prov.value] ? "text" : "password"}
                        value={cfg.apiKey ?? ""}
                        onChange={(e) => update(prov.value, "apiKey", e.target.value)}
                        placeholder="Enter API key"
                      />
                      <button type="button" onClick={() => setShowPass(s => ({ ...s, [prov.value]: !s[prov.value] }))} className="absolute right-2 top-2.5 text-gray-400">
                        {showPass[prov.value] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}
                {prov.fields.includes("username") && (
                  <div>
                    <Label>Username</Label>
                    <Input value={cfg.username ?? ""} onChange={(e) => update(prov.value, "username", e.target.value)} placeholder="Account username" />
                  </div>
                )}
                {prov.fields.includes("password") && (
                  <div>
                    <Label>API Secret</Label>
                    <Input type="password" value={cfg.password ?? ""} onChange={(e) => update(prov.value, "password", e.target.value)} placeholder="API secret" />
                  </div>
                )}
                {prov.fields.includes("senderId") && (
                  <div>
                    <Label>Sender ID</Label>
                    <Input value={cfg.senderId ?? ""} onChange={(e) => update(prov.value, "senderId", e.target.value)} placeholder="e.g. SCHOOL" />
                  </div>
                )}
                <div className="md:col-span-2 flex items-center gap-3">
                  <Button size="sm" onClick={() => save(prov.value)} disabled={saving === prov.value} className="gap-1">
                    <Save className="h-3.5 w-3.5" />{saving === prov.value ? "Saving…" : "Save"}
                  </Button>
                  {saved === prov.value && <span className="text-sm text-green-600 font-medium">Saved</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
