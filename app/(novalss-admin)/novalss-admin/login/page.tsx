"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, KeyRound, Lock, Mail, User } from "lucide-react";

type Mode = "login" | "setup" | "key";

export default function NovalssAdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // First run (no admin account yet) → show the setup form
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => (r.ok ? r.json() : { needsSetup: false }))
      .then((d) => { if (d.needsSetup) setMode("setup"); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let body: Record<string, unknown>;
    if (mode === "setup") {
      if (!email.trim() || !password) { setError("Email and password are required"); return; }
      if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
      if (password !== confirm) { setError("Passwords do not match"); return; }
      if (!key.trim()) { setError("Paste your admin key to prove ownership"); return; }
      body = { setup: true, key: key.trim(), email, password, name };
    } else if (mode === "key") {
      if (!key.trim()) { setError("Enter your admin key"); return; }
      body = { key: key.trim() };
    } else {
      if (!email.trim() || !password) { setError("Enter your email and password"); return; }
      body = { email, password };
    }

    setLoading(true);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/novalss-admin");
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Sign-in failed");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Novalss Admin</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === "setup" ? "Create your admin account" : "Company operations dashboard"}
          </p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-7 space-y-4">
          {!checked ? (
            <p className="text-sm text-center text-gray-400 py-6">Loading…</p>
          ) : mode === "key" ? (
            <>
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  <KeyRound className="h-3.5 w-3.5" /> Admin Key
                </Label>
                <Input type="password" value={key} onChange={(e) => setKey(e.target.value)}
                  placeholder="Enter your Novalss admin key" autoFocus />
              </div>
            </>
          ) : (
            <>
              {mode === "setup" && (
                <div>
                  <Label className="flex items-center gap-1.5 mb-2">
                    <User className="h-3.5 w-3.5" /> Your Name
                  </Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alexander Amoah" autoFocus />
                </div>
              )}
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@novalss.com" autoFocus={mode === "login"} />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  <Lock className="h-3.5 w-3.5" /> Password
                </Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "setup" ? "At least 8 characters" : "Your password"} />
              </div>
              {mode === "setup" && (
                <>
                  <div>
                    <Label className="flex items-center gap-1.5 mb-2">
                      <Lock className="h-3.5 w-3.5" /> Confirm Password
                    </Label>
                    <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1.5 mb-2">
                      <KeyRound className="h-3.5 w-3.5" /> Admin Key
                    </Label>
                    <Input type="password" value={key} onChange={(e) => setKey(e.target.value)}
                      placeholder="From your .env — proves ownership" />
                    <p className="text-[11.5px] text-gray-400 mt-1">
                      One-time step: the key bootstraps your account. After this you sign in with email &amp; password.
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading || !checked}>
            {loading ? "Verifying…" : mode === "setup" ? "Create Account & Sign In" : "Sign In"}
          </Button>

          {checked && mode !== "setup" && (
            <button type="button"
              onClick={() => { setError(""); setMode(mode === "key" ? "login" : "key"); }}
              className="w-full text-xs text-center text-gray-400 hover:text-gray-600 transition-colors">
              {mode === "key" ? "← Sign in with email & password" : "Use admin key instead"}
            </button>
          )}

          <p className="text-xs text-center text-gray-400">
            This area is restricted to Novalss company staff only.
          </p>
        </form>
      </div>
    </main>
  );
}
