"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, Save } from "lucide-react";

type NotifRow = { type: string; label: string; emailEnabled: boolean; smsEnabled: boolean; pushEnabled: boolean };

export function NotificationsClient({ settings: initial }: { settings: NotifRow[] }) {
  const [settings, setSettings] = useState<NotifRow[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(type: string, channel: "emailEnabled" | "smsEnabled" | "pushEnabled") {
    setSettings((ss) => ss.map((s) => s.type === type ? { ...s, [channel]: !s[channel] } : s));
    setSaved(false);
  }

  function setAll(channel: "emailEnabled" | "smsEnabled" | "pushEnabled", value: boolean) {
    setSettings((ss) => ss.map((s) => ({ ...s, [channel]: value })));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm ${checked ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  const allEmail = settings.every((s) => s.emailEnabled);
  const allSms   = settings.every((s) => s.smsEnabled);
  const allPush  = settings.every((s) => s.pushEnabled);

  return (
    <main className="flex-1 p-6 max-w-3xl mx-auto space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold">Notification Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Control which events trigger Email, SMS, and in-app push notifications.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" /> Event Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Event</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <div className="flex flex-col items-center gap-1">
                    <span>Email</span>
                    <button onClick={() => setAll("emailEnabled", !allEmail)} className="text-xs text-blue-500 hover:underline">{allEmail ? "None" : "All"}</button>
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <div className="flex flex-col items-center gap-1">
                    <span>SMS</span>
                    <button onClick={() => setAll("smsEnabled", !allSms)} className="text-xs text-blue-500 hover:underline">{allSms ? "None" : "All"}</button>
                  </div>
                </th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">
                  <div className="flex flex-col items-center gap-1">
                    <span>Push</span>
                    <button onClick={() => setAll("pushEnabled", !allPush)} className="text-xs text-blue-500 hover:underline">{allPush ? "None" : "All"}</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {settings.map((s) => (
                <tr key={s.type} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{s.label}</td>
                  <td className="px-4 py-3 text-center"><Toggle checked={s.emailEnabled} onChange={() => toggle(s.type, "emailEnabled")} /></td>
                  <td className="px-4 py-3 text-center"><Toggle checked={s.smsEnabled}   onChange={() => toggle(s.type, "smsEnabled")} /></td>
                  <td className="px-4 py-3 text-center"><Toggle checked={s.pushEnabled}  onChange={() => toggle(s.type, "pushEnabled")} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Settings"}
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">Settings saved</span>}
      </div>
    </main>
  );
}
