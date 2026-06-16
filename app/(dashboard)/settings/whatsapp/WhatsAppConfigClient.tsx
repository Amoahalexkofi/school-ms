"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Save, Eye, EyeOff, Check, Send, ExternalLink, Info } from "lucide-react";

const PROVIDERS = [
  {
    value:  "twilio_whatsapp",
    label:  "Twilio WhatsApp",
    badge:  "Recommended if you already use Twilio SMS",
    color:  "text-red-600",
    bg:     "bg-red-50",
    border: "border-red-200",
    fields: ["apiKey", "password", "senderId"],
    labels: { apiKey: "Account SID", password: "Auth Token", senderId: "WhatsApp Number" },
    hints:  { apiKey: "Find in Twilio Console → Account Info", password: "Find in Twilio Console → Account Info", senderId: "e.g. +14155238886 (Sandbox) or your approved number" },
    docsUrl: "https://www.twilio.com/docs/whatsapp",
    setup: [
      "Sign in to twilio.com and go to Console → Messaging → WhatsApp",
      "Use the Sandbox number for testing, or apply for a business number",
      "Enter your Account SID and Auth Token from the Console dashboard",
      "Enter the full WhatsApp sender number (with country code)",
    ],
  },
  {
    value:  "wati",
    label:  "WATI",
    badge:  "Most popular for businesses",
    color:  "text-green-700",
    bg:     "bg-green-50",
    border: "border-green-200",
    fields: ["apiKey", "endpoint"],
    labels: { apiKey: "API Token", endpoint: "WATI Endpoint URL" },
    hints:  { apiKey: "Settings → API in your WATI dashboard", endpoint: "e.g. https://live-server.wati.io" },
    docsUrl: "https://docs.wati.io",
    setup: [
      "Sign up at wati.io and connect your WhatsApp Business Account",
      "Go to Settings → API to copy your API token",
      "Copy your server endpoint URL from the dashboard (top of the API page)",
      "Paste both values below and click Save",
    ],
  },
  {
    value:  "meta",
    label:  "Meta Cloud API",
    badge:  "Free — direct from Meta",
    color:  "text-blue-700",
    bg:     "bg-blue-50",
    border: "border-blue-200",
    fields: ["apiKey", "senderId"],
    labels: { apiKey: "Access Token", senderId: "Phone Number ID" },
    hints:  { apiKey: "Facebook Developer App → WhatsApp → API Setup", senderId: "Phone Number ID from WhatsApp Business API setup" },
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api",
    setup: [
      "Create a Facebook Developer App at developers.facebook.com",
      "Add the WhatsApp product and complete business verification",
      "Go to WhatsApp → API Setup to get your Phone Number ID",
      "Generate a permanent access token and paste both values below",
    ],
  },
];

export function WhatsAppConfigClient({ configs: initial }: { configs: any[] }) {
  const perm = usePermission("system_settings");
  const [configs, setConfigs]     = useState<any[]>(initial);
  const [saving, setSaving]       = useState<string | null>(null);
  const [saved, setSaved]         = useState<string | null>(null);
  const [showPass, setShowPass]   = useState<Record<string, boolean>>({});
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function getConfig(provider: string) {
    return configs.find(c => c.provider === provider) ?? {
      provider, apiKey: "", password: "", senderId: "", endpoint: "", isActive: false,
    };
  }

  function update(provider: string, key: string, value: any) {
    setConfigs(cs => {
      const existing = cs.find(c => c.provider === provider);
      if (existing) return cs.map(c => c.provider === provider ? { ...c, [key]: value } : c);
      return [...cs, { provider, apiKey: "", password: "", senderId: "", endpoint: "", isActive: false, [key]: value }];
    });
    setSaved(null);
  }

  async function save(provider: string) {
    setSaving(provider);
    try {
      const cfg = getConfig(provider);
      const res = await fetch("/api/whatsapp-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setConfigs(cs => cs.find(c => c.provider === provider)
        ? cs.map(c => c.provider === provider ? updated : c)
        : [...cs, updated]
      );
      setSaved(provider);
    } catch { alert("Failed to save"); }
    finally { setSaving(null); }
  }

  async function activate(provider: string) {
    update(provider, "isActive", true);
    const cfg = { ...getConfig(provider), isActive: true };
    await fetch("/api/whatsapp-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setConfigs(cs => cs.map(c => ({ ...c, isActive: c.provider === provider })));
  }

  async function sendTest() {
    if (!testPhone.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/whatsapp-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone.trim() }),
      });
      const data = await res.json();
      setTestResult(res.ok
        ? { ok: true, msg: `✓ Message sent via ${data.provider}` }
        : { ok: false, msg: data.error ?? "Failed to send" }
      );
    } catch {
      setTestResult({ ok: false, msg: "Network error" });
    } finally { setTesting(false); }
  }

  return (
    <main className="flex-1 p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Configuration
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect a WhatsApp provider to send fee receipts, attendance alerts, and exam results directly to parents.
        </p>
      </div>

      {/* How it works */}
      <Card className="border-indigo-200 bg-indigo-50/40">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm text-indigo-800 space-y-1">
              <p className="font-semibold">What gets sent automatically once configured:</p>
              <ul className="list-disc list-inside space-y-0.5 text-indigo-700">
                <li>Fee receipts — every time a payment is collected</li>
                <li>Attendance alerts — when a student is marked absent</li>
                <li>Exam results — when marksheets are published</li>
                <li>Fee reminders — for outstanding balances</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test widget */}
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Send Test WhatsApp Message</p>
          <p className="text-xs text-gray-500 mb-3">Uses whichever provider is currently active.</p>
          <div className="flex gap-2">
            <Input
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="+233XXXXXXXXX"
              className="max-w-xs"
            />
            <Button size="sm" onClick={sendTest} disabled={testing || !testPhone.trim()} className="gap-1 bg-green-600 hover:bg-green-700">
              <Send className="h-3.5 w-3.5" />{testing ? "Sending…" : "Send Test"}
            </Button>
          </div>
          {testResult && (
            <p className={`mt-2 text-sm font-medium ${testResult.ok ? "text-green-600" : "text-red-500"}`}>
              {testResult.msg}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Provider cards */}
      <div className="space-y-4">
        {PROVIDERS.map(prov => {
          const cfg      = getConfig(prov.value);
          const isActive = cfg.isActive;
          const open     = expanded === prov.value || isActive;

          return (
            <Card key={prov.value} className={`transition-all ${isActive ? "border-green-400 shadow-md" : "border-slate-200"}`}>
              <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(open && !isActive ? null : prov.value)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2.5">
                    <div className={`w-8 h-8 ${prov.bg} rounded-lg flex items-center justify-center`}>
                      <MessageCircle className={`h-4 w-4 ${prov.color}`} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">{prov.label}</span>
                      <span className={`ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full ${prov.bg} ${prov.color}`}>
                        {prov.badge}
                      </span>
                      {isActive && (
                        <span className="ml-2 text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          ✓ Active
                        </span>
                      )}
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <a href={prov.docsUrl} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-600 transition-colors">
                      Docs <ExternalLink className="h-3 w-3" />
                    </a>
                    {!isActive && (
                      <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); activate(prov.value); }}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Set Active
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {open && (
                <CardContent className="space-y-5 pt-0">
                  {/* Setup steps */}
                  <div className={`rounded-xl p-4 ${prov.bg} border ${prov.border}`}>
                    <p className="text-[12px] font-bold text-slate-600 uppercase tracking-wide mb-2">Setup steps</p>
                    <ol className="space-y-1.5">
                      {prov.setup.map((step, i) => (
                        <li key={i} className="flex gap-2 text-[13px] text-slate-700">
                          <span className={`font-black ${prov.color} shrink-0`}>{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prov.fields.map(field => (
                      <div key={field}>
                        <Label className="text-[13px] font-semibold">
                          {(prov.labels as any)[field]}
                        </Label>
                        <p className="text-[11px] text-slate-400 mb-1.5">{(prov.hints as any)[field]}</p>
                        {field === "password" || field === "apiKey" ? (
                          <div className="relative">
                            <Input
                              type={showPass[`${prov.value}_${field}`] ? "text" : "password"}
                              value={(cfg as any)[field] ?? ""}
                              onChange={e => update(prov.value, field, e.target.value)}
                              placeholder={`Enter ${(prov.labels as any)[field]}`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPass(s => ({ ...s, [`${prov.value}_${field}`]: !s[`${prov.value}_${field}`] }))}
                              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                              {showPass[`${prov.value}_${field}`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        ) : (
                          <Input
                            value={(cfg as any)[field] ?? ""}
                            onChange={e => update(prov.value, field, e.target.value)}
                            placeholder={`Enter ${(prov.labels as any)[field]}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    {perm.canEdit && (
                      <Button size="sm" onClick={() => save(prov.value)} disabled={saving === prov.value} className="gap-1">
                        <Save className="h-3.5 w-3.5" />
                        {saving === prov.value ? "Saving…" : "Save"}
                      </Button>
                    )}
                    {saved === prov.value && (
                      <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Saved
                      </span>
                    )}
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
