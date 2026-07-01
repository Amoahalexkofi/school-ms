"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertCircle } from "lucide-react";

export function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update password");
      router.push("/dashboard");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 p-5 md:p-7">
      <div className="max-w-md mx-auto mt-6 bg-white rounded-xl border border-slate-200 p-6">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
        </div>
        <h1 className="text-[18px] font-semibold text-slate-900">{forced ? "Set your password" : "Change password"}</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {forced
            ? "For your security, choose a new password before continuing."
            : "Choose a new password for your account."}
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">New password</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm password</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Saving…" : "Save password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
