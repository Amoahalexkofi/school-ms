"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Lock } from "lucide-react";

export default function NovalssAdminLoginPage() {
  const router = useRouter();
  const [key, setKey]       = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) { setError("Enter your admin key"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (res.ok) {
      router.push("/novalss-admin");
    } else {
      setError("Invalid admin key");
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
          <p className="text-slate-400 text-sm mt-1">Company operations dashboard</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl shadow-2xl p-7 space-y-5">
          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <Lock className="h-3.5 w-3.5" /> Admin Key
            </Label>
            <Input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter your Novalss admin key"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying…" : "Access Dashboard"}
          </Button>
          <p className="text-xs text-center text-gray-400">
            This area is restricted to Novalss company staff only.
          </p>
        </form>
      </div>
    </main>
  );
}
