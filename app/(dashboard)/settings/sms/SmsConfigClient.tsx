"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Save, Eye, EyeOff, Check, Send, ChevronDown } from "lucide-react";

const PROVIDERS = [
  { value: "twilio",         label: "Twilio",           fields: ["apiKey", "senderId"] },
  { value: "africas_talking", label: "Africa's Talking", fields: ["apiKey", "username", "senderId"] },
  { value: "bms",            label: "BMS Africa",        fields: ["apiKey", "senderId"] },
];

export function SmsConfigClient({ configs: initial }: { configs: any[] }) {
  const perm = usePermission("system_settings");
  const [configs, setConfigs] = useState<any[]>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function getConfig(provider: string) {
    return configs.find((c) => c.provider === provider) ?? { provider, apiKey: "", senderId: "", username: "", password: "", isActive: false };
  }

  const activeProvider = PROVIDERS.find((p) => getConfig(p.value).isActive);

  // Only one provider needs its fields visible at a time — the active one by
  // default. Everything else stays collapsed to a single summary row until
  // opened, so the page reads as "here's the live gateway" instead of three
  // competing forms.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(activeProvider ? [activeProvider.value] : [])
  );

  function toggleExpanded(provider: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(provider)) next.delete(provider);
      else next.add(provider);
      return next;
    });
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

  async function sendTest() {
    if (!testPhone.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/sms-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone.trim() }),
      });
      const data = await res.json();
      setTestResult(res.ok ? { ok: true, msg: `Sent via ${data.provider}` } : { ok: false, msg: data.error ?? "Failed" });
    } catch {
      setTestResult({ ok: false, msg: "Network error" });
    } finally {
      setTesting(false);
    }
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
    setExpanded((prev) => new Set(prev).add(provider));
  }

  return (
    <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold">SMS Configuration</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure one SMS gateway to send attendance alerts, fee reminders, and notifications.</p>
      </div>

      {/* Test SMS widget — tied to whichever gateway is actually live */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-700">Send Test SMS</p>
            {activeProvider && (
              <p className="text-xs text-gray-500">via <span className="font-medium text-gray-700">{activeProvider.label}</span></p>
            )}
          </div>
          {activeProvider ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+233XXXXXXXXX"
                  className="max-w-xs"
                />
                <Button size="sm" onClick={sendTest} disabled={testing || !testPhone.trim()} className="gap-1">
                  <Send className="h-3.5 w-3.5" />{testing ? "Sending…" : "Send Test"}
                </Button>
              </div>
              {testResult && (
                <p className={`mt-2 text-sm font-medium ${testResult.ok ? "text-green-600" : "text-red-500"}`}>
                  {testResult.ok ? "✓" : "✗"} {testResult.msg}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Activate a gateway below first — then you can send a test message here.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PROVIDERS.map((prov) => {
          const cfg = getConfig(prov.value);
          const isActive = cfg.isActive;
          const isConfigured = !!cfg.apiKeySet;
          const isOpen = expanded.has(prov.value);

          return (
            <Card key={prov.value} className={`${isOpen ? "md:col-span-2" : ""} ${isActive ? "border-green-400 shadow-sm" : ""}`}>
              <button
                type="button"
                onClick={() => toggleExpanded(prov.value)}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 text-left"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-sm font-semibold text-gray-800 truncate">{prov.label}</span>
                  {isActive && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">Active</span>}
                  {!isActive && isConfigured && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium shrink-0">Configured</span>}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <CardContent className="pt-0 pb-5 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {prov.fields.includes("apiKey") && (
                      <div>
                        <Label>API Key</Label>
                        <div className="relative">
                          <Input
                            type={showPass[prov.value] ? "text" : "password"}
                            value={cfg.apiKey ?? ""}
                            onChange={(e) => update(prov.value, "apiKey", e.target.value)}
                            placeholder={cfg.apiKeySet ? "•••••• saved — leave blank to keep" : "Enter API key"}
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
                        <Input type="password" value={cfg.password ?? ""} onChange={(e) => update(prov.value, "password", e.target.value)} placeholder={cfg.passwordSet ? "•••••• saved — leave blank to keep" : "API secret"} />
                      </div>
                    )}
                    {prov.fields.includes("senderId") && (
                      <div>
                        <Label>Sender ID</Label>
                        <Input value={cfg.senderId ?? ""} onChange={(e) => update(prov.value, "senderId", e.target.value)} placeholder="e.g. SCHOOL" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    {perm.canEdit && (
                      <Button size="sm" onClick={() => save(prov.value)} disabled={saving === prov.value} className="gap-1">
                        <Save className="h-3.5 w-3.5" />{saving === prov.value ? "Saving…" : "Save"}
                      </Button>
                    )}
                    {perm.canEdit && !isActive && (
                      <Button size="sm" variant="outline" onClick={() => setActive(prov.value)}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Set Active
                      </Button>
                    )}
                    {saved === prov.value && <span className="text-sm text-green-600 font-medium">Saved</span>}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
