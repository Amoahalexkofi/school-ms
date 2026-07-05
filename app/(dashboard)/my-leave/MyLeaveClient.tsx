"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Plus, AlertCircle } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function MyLeaveClient({ hasProfile, initialRequests }: {
  hasProfile: boolean;
  initialRequests: any[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [requests, setRequests] = useState<any[]>(initialRequests);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fromDate: today, toDate: today, reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function apply() {
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/my-leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to apply");
      setRequests(r => [data, ...r]);
      setOpen(false);
      setForm({ fromDate: today, toDate: today, reason: "" });
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  if (!hasProfile) {
    return (
      <main className="flex-1 p-6">
        <Card><CardContent className="py-14 text-center text-gray-400 text-sm">
          No student profile is linked to your account.
        </CardContent></Card>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-6 space-y-5 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Leave Requests</h2>
          <p className="text-xs text-gray-400 mt-0.5">Apply for leave — your class teacher or the school office will approve it.</p>
        </div>
        <Button onClick={() => { setError(""); setOpen(o => !o); }}>
          <Plus className="h-4 w-4 mr-1" /> Apply for Leave
        </Button>
      </div>

      {open && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From *</label>
                <Input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To *</label>
                <Input type="date" min={form.fromDate} value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
              <textarea rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                placeholder="e.g. Medical appointment"
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
            </div>
            {error && (
              <p className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={saving} onClick={apply}>{saving ? "Submitting…" : "Submit Request"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No leave requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["From", "To", "Days", "Reason", "Status", "Note"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td className="px-4 py-3">{new Date(r.fromDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">{new Date(r.toDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-600">{r.leaveDays ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[220px] truncate">{r.reason ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{r.remark ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
