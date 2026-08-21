"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/components/PermissionsProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, Save } from "lucide-react";

type NotifRow = {
  type: string; label: string; implemented: boolean;
  emailEnabled: boolean; smsEnabled: boolean; pushEnabled: boolean;
};

export function NotificationsClient({ settings: initial }: { settings: NotifRow[] }) {
  const perm = usePermission("system_settings");
  const [settings, setSettings] = useState<NotifRow[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggle(type: string, channel: "emailEnabled" | "smsEnabled") {
    setSettings((ss) => ss.map((s) => s.type === type && s.implemented ? { ...s, [channel]: !s[channel] } : s));
    setSaved(false);
  }

  function setAll(channel: "emailEnabled" | "smsEnabled", value: boolean) {
    setSettings((ss) => ss.map((s) => s.implemented ? { ...s, [channel]: value } : s));
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

  const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        disabled ? "bg-gray-100 cursor-not-allowed" : checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full shadow-sm transition-transform ${
        disabled ? "bg-gray-300" : "bg-white"
      } ${checked && !disabled ? "translate-x-4" : "translate-x-1"}`} />
    </button>
  );

  const implementedRows = settings.filter((s) => s.implemented);
  const allEmail = implementedRows.length > 0 && implementedRows.every((s) => s.emailEnabled);
  const allSms   = implementedRows.length > 0 && implementedRows.every((s) => s.smsEnabled);

  return (
    <main className="flex-1 px-4 py-7 md:p-8 max-w-[1400px] mx-auto w-full space-y-6">
      <Link href="/settings" className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Settings
      </Link>

      <div>
        <h2 className="text-lg font-bold">Notification Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Control which events send Email and SMS/WhatsApp.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600" /> Event Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
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
                  <th className="text-center px-4 py-3 font-medium text-gray-400">
                    <div className="flex flex-col items-center gap-1">
                      <span>Push</span>
                      <span className="text-xs normal-case font-normal">Coming soon</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {settings.map((s) => (
                  <tr key={s.type} className={`hover:bg-gray-50 ${s.implemented ? "" : "opacity-60"}`}>
                    <td className="px-4 py-3 font-medium">
                      {s.label}
                      {!s.implemented && <span className="ml-2 text-xs font-normal text-gray-400 align-middle">Not available yet</span>}
                    </td>
                    <td className="px-4 py-3 text-center"><Toggle checked={s.emailEnabled} disabled={!s.implemented} onChange={() => toggle(s.type, "emailEnabled")} /></td>
                    <td className="px-4 py-3 text-center"><Toggle checked={s.smsEnabled}   disabled={!s.implemented} onChange={() => toggle(s.type, "smsEnabled")} /></td>
                    <td className="px-4 py-3 text-center"><Toggle checked={false} disabled onChange={() => {}} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        {perm.canEdit && (
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />{saving ? "Saving…" : "Save Settings"}
          </Button>
        )}
        {saved && <span className="text-sm text-green-600 font-medium">Settings saved</span>}
      </div>
    </main>
  );
}
