"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, CheckCheck, Megaphone, Plus, Trash2 } from "lucide-react";

const TYPE_STYLES: Record<string, string> = {
  FEE_DUE: "bg-red-100 text-red-700",
  RESULT_PUBLISHED: "bg-green-100 text-green-700",
  HOMEWORK_ASSIGNED: "bg-blue-100 text-blue-700",
  EXAM_SCHEDULED: "bg-purple-100 text-purple-700",
  ABSENCE_MARKED: "bg-orange-100 text-orange-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    title: "", message: "", publishDate: new Date().toISOString().slice(0, 10),
    visibleStudent: true, visibleStaff: true, visibleParent: true,
  });
  const [composeSaving, setComposeSaving] = useState(false);
  const [composeError, setComposeError] = useState("");

  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

  async function load() {
    if (!userId) return;
    const [res, bRes] = await Promise.all([
      fetch(`/api/notifications?userId=${userId}`).catch(() => null),
      fetch(`/api/notifications/send`).catch(() => null),
    ]);
    if (res?.ok) {
      const d = await res.json();
      setNotifications(d.notifications ?? []);
      setUnreadCount(d.unreadCount ?? 0);
    }
    if (bRes?.ok) setBroadcasts(await bRes.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [userId]);

  async function markAllRead() {
    if (!userId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, markAll: true }),
    });
    await load();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function sendBroadcast() {
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      setComposeError("Title and message are required");
      return;
    }
    setComposeSaving(true); setComposeError("");
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...composeForm, createdById: userId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Failed");
      setComposeOpen(false);
      setComposeForm({ title: "", message: "", publishDate: new Date().toISOString().slice(0, 10), visibleStudent: true, visibleStaff: true, visibleParent: true });
      await load();
    } catch (e: any) {
      setComposeError(e.message || "Failed");
    } finally {
      setComposeSaving(false);
    }
  }

  async function deleteBroadcast(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/notifications/send/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl">

        {(broadcasts.length > 0 || isAdmin) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-indigo-600" /> Announcements
              </h2>
              {isAdmin && (
                <Button size="sm" onClick={() => { setComposeError(""); setComposeOpen(true); }}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> New Announcement
                </Button>
              )}
            </div>
            {broadcasts.length === 0 ? (
              <p className="text-sm text-gray-400">No announcements yet.</p>
            ) : (
              <div className="space-y-2">
                {broadcasts.map((b: any) => (
                  <div key={b.id} className="p-4 rounded-xl border bg-indigo-50/50 border-indigo-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900">{b.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap">{b.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(b.publishDate).toLocaleDateString()}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => deleteBroadcast(b.id)} className="text-gray-300 hover:text-red-500 shrink-0" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
            {unreadCount > 0 && (
              <Button size="sm" variant="outline" onClick={markAllRead} className="gap-1.5">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                    n.isRead ? "bg-white border-gray-100" : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${TYPE_STYLES[n.type] ?? "bg-gray-100 text-gray-700"}`}>
                    {n.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && (
                    <button onClick={() => markRead(n.id)} className="text-xs text-blue-600 hover:underline shrink-0">
                      Mark read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={composeOpen} onOpenChange={(o) => !o && setComposeOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input className="mt-1" value={composeForm.title} onChange={(e) => setComposeForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Message *</Label>
              <textarea
                className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                rows={4}
                value={composeForm.message}
                onChange={(e) => setComposeForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
            <div>
              <Label>Publish Date</Label>
              <Input className="mt-1" type="date" value={composeForm.publishDate} onChange={(e) => setComposeForm((f) => ({ ...f, publishDate: e.target.value }))} />
            </div>
            <div>
              <Label>Visible to</Label>
              <div className="flex items-center gap-4 mt-1.5">
                {(["visibleStudent", "visibleStaff", "visibleParent"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={composeForm[key]}
                      onChange={(e) => setComposeForm((f) => ({ ...f, [key]: e.target.checked }))}
                    />
                    {key === "visibleStudent" ? "Students" : key === "visibleStaff" ? "Staff" : "Parents"}
                  </label>
                ))}
              </div>
            </div>
            {composeError && <p className="text-sm text-red-600">{composeError}</p>}
            <Button className="w-full" disabled={composeSaving} onClick={sendBroadcast}>
              {composeSaving ? "Sending…" : "Send Announcement"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
