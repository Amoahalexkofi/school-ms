"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Mail, Save, Eye, EyeOff, CheckCircle2,
  AlertCircle, Loader2, Send, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const INPUT = "h-11 w-full rounded-xl border border-slate-200 px-3 text-[14px] text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 bg-white";

const PRESETS = [
  {
    label: "Gmail",
    logo: "G",
    color: "#ea4335",
    values: { smtpHost: "smtp.gmail.com", smtpPort: "587", smtpSecure: "tls" },
    hint: "Use an App Password (not your Gmail password). Requires 2-Step Verification.",
    hintLink: "https://myaccount.google.com/apppasswords",
    hintLinkLabel: "Create App Password →",
  },
  {
    label: "Outlook / Microsoft 365",
    logo: "O",
    color: "#0078d4",
    values: { smtpHost: "smtp.office365.com", smtpPort: "587", smtpSecure: "tls" },
    hint: "Use your Microsoft 365 email and password. May require enabling SMTP AUTH in the admin center.",
  },
  {
    label: "Yahoo Mail",
    logo: "Y",
    color: "#6001d2",
    values: { smtpHost: "smtp.mail.yahoo.com", smtpPort: "587", smtpSecure: "tls" },
    hint: "Generate an App Password in Yahoo Account Security settings.",
  },
  {
    label: "Custom / Other",
    logo: "✦",
    color: "#6366f1",
    values: { smtpHost: "", smtpPort: "587", smtpSecure: "tls" },
    hint: "Enter your SMTP server details manually.",
  },
];

export function EmailConfigClient({ config }: { config: any }) {
  const [form, setForm] = useState({
    smtpHost:     config?.smtpHost     ?? "",
    smtpPort:     String(config?.smtpPort ?? "587"),
    smtpUsername: config?.smtpUsername ?? "",
    smtpPassword: config?.smtpPassword ?? "",
    smtpSecure:   config?.smtpSecure   ?? "tls",
    fromEmail:    config?.fromEmail    ?? "",
    fromName:     config?.fromName     ?? "",
    isActive:     config?.isActive     ?? false,
  });

  const [showPass,    setShowPass]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saveMsg,     setSaveMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [testEmail,   setTestEmail]   = useState(config?.smtpUsername ?? "");
  const [testing,     setTesting]     = useState(false);
  const [testMsg,     setTestMsg]     = useState<{ ok: boolean; text: string } | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(
    PRESETS.find(p => p.values.smtpHost && p.values.smtpHost === config?.smtpHost)?.label ?? null
  );

  function set(k: string, v: any) {
    setForm(f => ({ ...f, [k]: v }));
    setSaveMsg(null);
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setActivePreset(p.label);
    setForm(f => ({ ...f, ...p.values }));
    setSaveMsg(null);
  }

  async function save() {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/email-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, smtpPort: parseInt(form.smtpPort) || 587 }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveMsg({ ok: true, text: "Configuration saved ✓" });
    } catch {
      setSaveMsg({ ok: false, text: "Failed to save. Try again." });
    }
    setSaving(false);
  }

  async function sendTest() {
    if (!testEmail.trim()) return;
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/email-config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: testEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestMsg({ ok: true, text: `Test email sent to ${testEmail}` });
      } else {
        setTestMsg({ ok: false, text: data.error ?? "Send failed — check your SMTP settings." });
      }
    } catch {
      setTestMsg({ ok: false, text: "Could not connect. Check your server and port." });
    }
    setTesting(false);
  }

  const selectedPreset = PRESETS.find(p => p.label === activePreset);

  return (
    <main className="flex-1 p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <Link href="/settings"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h1 className="text-[22px] font-black text-slate-900 tracking-tight">Email Settings</h1>
        <p className="text-[13px] text-slate-500 mt-0.5">
          Configure outgoing email for password resets, fee receipts, and bulk messages.
        </p>
      </div>

      {/* ── Provider presets ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Zap className="h-4 w-4 text-slate-400" />
          <h2 className="text-[15px] font-black text-slate-900">Quick Setup</h2>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center ${
                activePreset === p.label
                  ? "border-indigo-400 bg-indigo-50/60"
                  : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/60"
              }`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[14px] font-black"
                style={{ background: p.color }}>
                {p.logo}
              </div>
              <span className="text-[11px] font-bold text-slate-700 leading-tight">{p.label}</span>
            </button>
          ))}
        </div>
        {selectedPreset?.hint && (
          <div className="mx-4 mb-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-[12px] text-amber-800">
            {selectedPreset.hint}
            {selectedPreset.hintLink && (
              <> <a href={selectedPreset.hintLink} target="_blank" rel="noopener noreferrer"
                className="font-bold underline">{selectedPreset.hintLinkLabel}</a></>
            )}
          </div>
        )}
      </div>

      {/* ── SMTP fields ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Mail className="h-4 w-4 text-slate-400" />
          <h2 className="text-[15px] font-black text-slate-900">SMTP Configuration</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                SMTP Host *
              </label>
              <input className={INPUT} value={form.smtpHost}
                onChange={e => set("smtpHost", e.target.value)}
                placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Port
              </label>
              <input className={INPUT} type="number" value={form.smtpPort}
                onChange={e => set("smtpPort", e.target.value)}
                placeholder="587" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
              Encryption
            </label>
            <div className="flex gap-2">
              {[
                { v: "tls",  label: "TLS (recommended)" },
                { v: "ssl",  label: "SSL" },
                { v: "none", label: "None" },
              ].map(opt => (
                <button key={opt.v}
                  onClick={() => set("smtpSecure", opt.v)}
                  className={`flex-1 h-10 rounded-xl text-[13px] font-bold transition-all border-2 ${
                    form.smtpSecure === opt.v
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700"
                      : "bg-slate-50 border-transparent text-slate-500 hover:border-slate-200"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Username / Email
              </label>
              <input className={INPUT} value={form.smtpUsername}
                onChange={e => set("smtpUsername", e.target.value)}
                placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Password / App Password
              </label>
              <div className="relative">
                <input className={INPUT + " pr-10"}
                  type={showPass ? "text" : "password"}
                  value={form.smtpPassword}
                  onChange={e => set("smtpPassword", e.target.value)}
                  placeholder={config?.smtpPasswordSet ? "•••••• saved — leave blank to keep" : "••••••••••••"} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                From Email
              </label>
              <input className={INPUT} value={form.fromEmail}
                onChange={e => set("fromEmail", e.target.value)}
                placeholder="noreply@school.edu" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                From Name
              </label>
              <input className={INPUT} value={form.fromName}
                onChange={e => set("fromName", e.target.value)}
                placeholder="St. Mary's School" />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <div>
              <p className="text-[14px] font-bold text-slate-900">Enable email sending</p>
              <p className="text-[12px] text-slate-500 mt-0.5">Turn off to stop all outgoing emails without deleting config</p>
            </div>
            <button onClick={() => set("isActive", !form.isActive)}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${form.isActive ? "bg-indigo-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-[26px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <Button onClick={save} disabled={saving} className="gap-2 min-w-[160px]">
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Save className="h-4 w-4" />
              }
              {saving ? "Saving…" : "Save Configuration"}
            </Button>
            {saveMsg && (
              <span className={`flex items-center gap-1.5 text-[13px] font-semibold ${saveMsg.ok ? "text-emerald-600" : "text-red-500"}`}>
                {saveMsg.ok
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <AlertCircle className="h-4 w-4" />
                }
                {saveMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Test email ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.06)" }}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
          <Send className="h-4 w-4 text-slate-400" />
          <h2 className="text-[15px] font-black text-slate-900">Send Test Email</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13px] text-slate-500">
            Verify your SMTP settings are working by sending a test email. Save your configuration first.
          </p>
          <div className="flex gap-3">
            <input
              className={INPUT}
              type="email"
              placeholder="recipient@example.com"
              value={testEmail}
              onChange={e => { setTestEmail(e.target.value); setTestMsg(null); }}
            />
            <Button
              onClick={sendTest}
              disabled={testing || !testEmail.trim() || !form.isActive}
              variant="outline"
              className="shrink-0 gap-2 px-5">
              {testing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
              {testing ? "Sending…" : "Send Test"}
            </Button>
          </div>
          {!form.isActive && (
            <p className="text-[12px] text-amber-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              Email sending is disabled — enable it above and save first.
            </p>
          )}
          {testMsg && (
            <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-[13px] font-semibold ${
              testMsg.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {testMsg.ok
                ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              }
              {testMsg.text}
            </div>
          )}
        </div>
      </div>

      {/* ── What emails are sent ── */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/60 px-6 py-5">
        <p className="text-[13px] font-bold text-slate-700 mb-3">Emails sent automatically by Skula</p>
        <ul className="space-y-2">
          {[
            ["Password reset", "When a user requests a password reset link"],
            ["Fee payment receipt", "When a fee payment is recorded for a student"],
            ["Bulk messages", "When admin sends a message to students, parents, or staff"],
            ["Alumni newsletter", "When admin emails the alumni list"],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-start gap-2.5 text-[13px]">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
              <span><strong className="text-slate-800">{title}</strong>
                <span className="text-slate-500"> — {desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
